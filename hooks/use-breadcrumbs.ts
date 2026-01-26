import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { mockDataService } from '@/lib/mock-data/service';
import { UserRole } from '@/types';

export interface BreadcrumbItem {
  label: string;
  href: string;
  isLast?: boolean;
}

export interface UseBreadcrumbsOptions {
  userRole?: UserRole;
}

// Route segment to label mapping
const routeLabels: Record<string, string> = {
  'customer': 'Customer',
  'implementation-lead': 'Implementation Lead',
  'dashboard': 'Dashboard',
  'account': 'Account',
  'accounts': 'Accounts',
  'onboarding': 'Onboarding',
  'create': 'Create Account',
};

// Check if a segment is a dynamic route parameter (UUID-like or ID pattern)
const isDynamicSegment = (segment: string): boolean => {
  // Matches patterns like: account-1, location-1, or UUIDs
  // Exclude common route names that might match the pattern
  const commonRoutes = ['dashboard', 'account', 'accounts', 'onboarding', 'create', 'customer', 'implementation-lead'];
  if (commonRoutes.includes(segment.toLowerCase())) {
    return false;
  }
  return /^(account-|location-)[a-z0-9-]+$/i.test(segment) || 
         /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment);
};

export function useBreadcrumbs(options?: UseBreadcrumbsOptions): BreadcrumbItem[] {
  const pathname = usePathname();
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const userRole = options?.userRole;

  useEffect(() => {
    const generateBreadcrumbs = async () => {
      if (!pathname || pathname === '/') {
        setBreadcrumbs([]);
        return;
      }

      // Split pathname into segments, filter out empty strings
      const segments = pathname.split('/').filter(Boolean);
      
      // If no segments after filtering, we're on home
      if (segments.length === 0) {
        setBreadcrumbs([]);
        return;
      }
      
      const items: BreadcrumbItem[] = [];
      let currentPath = '';
      
      // Skip role prefix (customer, implementation-lead) - user knows their role
      let startIndex = 0;
      if (segments[0] === 'customer' || segments[0] === 'implementation-lead') {
        startIndex = 1;
        currentPath = `/${segments[0]}`;
      }
      
      // Build breadcrumbs progressively, skipping redundant segments
      for (let i = startIndex; i < segments.length; i++) {
        const segment = segments[i];
        const prevSegment = i > startIndex ? segments[i - 1] : '';
        
        // Check if this is a dynamic segment (ID)
        if (isDynamicSegment(segment)) {
          currentPath += `/${segment}`;
          
          let label = segment; // Default fallback
          
          if (prevSegment === 'account' || prevSegment === 'accounts') {
            // Fetch account name
            try {
              const account = mockDataService.accounts.getById(segment);
              if (account) {
                label = account.name;
              }
            } catch (error) {
              console.warn('Failed to fetch account for breadcrumb:', error);
            }
            
            items.push({
              label,
              href: currentPath,
              isLast: i === segments.length - 1
            });
          } else if (prevSegment === 'onboarding') {
            // Fetch location name and show parent account instead of "Onboarding"
            try {
              const location = mockDataService.locations.getById(segment);
              if (location) {
                label = location.name;
                
                // For onboarding, show "Account" and parent account instead of "Onboarding" segment
                // This gives better context: "Account > Account Name > Location Name"
                if (location.accountId) {
                  const account = mockDataService.accounts.getById(location.accountId);
                  if (account) {
                    const accountPath = userRole === UserRole.CUSTOMER 
                      ? `/customer/account/${location.accountId}`
                      : `/implementation-lead/accounts/${location.accountId}`;
                    const dashboardPath = userRole === UserRole.CUSTOMER 
                      ? '/customer/dashboard'
                      : '/implementation-lead/dashboard';
                    
                    // Add "Account" breadcrumb first
                    items.push({
                      label: 'Account',
                      href: dashboardPath,
                      isLast: false
                    });
                    
                    // Then add account name
                    items.push({
                      label: account.name,
                      href: accountPath,
                      isLast: false
                    });
                  }
                }
              }
            } catch (error) {
              console.warn('Failed to fetch location for breadcrumb:', error);
            }
            
            items.push({
              label,
              href: currentPath,
              isLast: i === segments.length - 1
            });
          } else {
            // Unknown dynamic segment - include as-is
            items.push({
              label,
              href: currentPath,
              isLast: i === segments.length - 1
            });
          }
        } else {
          // Static route segment
          
          // Skip "dashboard" as it's the default entry point (only show if not last)
          if (segment === 'dashboard') {
            currentPath += `/${segment}`;
            if (i < segments.length - 1) {
              const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
              items.push({
                label,
                href: currentPath,
                isLast: false
              });
            }
            continue;
          }
          
          // Skip "onboarding" segment - we'll show account name instead when we encounter location ID
          if (segment === 'onboarding') {
            currentPath += `/${segment}`;
            continue;
          }
          
          // For "account" or "accounts" segment, link to dashboard instead of the non-existent /customer/account route
          if (segment === 'account' || segment === 'accounts') {
            currentPath += `/${segment}`;
            // Link to dashboard instead of the account route prefix
            const dashboardPath = userRole === UserRole.CUSTOMER 
              ? '/customer/dashboard'
              : '/implementation-lead/dashboard';
            items.push({
              label: routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
              href: dashboardPath,
              isLast: false
            });
            continue;
          }
          
          currentPath += `/${segment}`;
          const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
          items.push({
            label,
            href: currentPath,
            isLast: i === segments.length - 1
          });
        }
      }

      // Mark the last item
      if (items.length > 0) {
        items[items.length - 1].isLast = true;
      }

      // Only show breadcrumbs if there's meaningful context (more than 1 item)
      setBreadcrumbs(items.length > 1 ? items : []);
    };

    generateBreadcrumbs();
  }, [pathname, userRole]);

  return breadcrumbs;
}
