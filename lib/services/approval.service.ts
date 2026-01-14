/**
 * Approval Service
 * Manages approval workflows for phone purchases, credit, and provisioning
 */

import { ApprovalRequest, ApprovalResponse } from './types';
import { AuditLogService } from './audit-log.service';
import { mockDataService } from '@/lib/mock-data/service';

// In-memory approval store (replace with database later)
const approvals: Map<string, ApprovalResponse> = new Map();
let approvalCounter = 0;

export class ApprovalService {
  /**
   * Request approval
   */
  static requestApproval(request: ApprovalRequest, requestedBy: string): ApprovalResponse {
    const approvalId = `approval-${++approvalCounter}`;
    
    const approval: ApprovalResponse = {
      id: approvalId,
      status: 'PENDING',
      requestedBy,
      requestedAt: new Date(),
      metadata: {
        locationId: request.locationId,
        ...request.metadata,
      },
    };

    approvals.set(approvalId, approval);

    // Log audit
    AuditLogService.log({
      action: 'APPROVE',
      entityType: request.type.toLowerCase(),
      entityId: request.entityId,
      userId: requestedBy,
      metadata: {
        approvalId,
        approvalType: request.type,
        ...request.metadata,
      },
    });

    return approval;
  }

  /**
   * Request phone purchase approval (for individual unsupported device)
   */
  static requestPhonePurchase(params: {
    phoneId: string;
    locationId: string;
    brand: string;
    model: string;
    quantity?: number;
    unitPrice?: number;
    requestedBy: string;
  }): ApprovalResponse {
    const totalPrice = params.quantity && params.unitPrice
      ? params.quantity * params.unitPrice
      : undefined;

    return this.requestApproval(
      {
        type: 'PHONE_PURCHASE',
        locationId: params.locationId,
        entityId: params.phoneId,
        metadata: {
          brand: params.brand,
          model: params.model,
          quantity: params.quantity || 1,
          unitPrice: params.unitPrice,
          totalPrice,
        },
      },
      params.requestedBy
    );
  }

  /**
   * Request catalog purchase approval (NEW)
   * Triggered when buyPhonesThroughVoiceStack = true
   * Creates approval for entire catalog selection
   */
  static requestCatalogPurchase(params: {
    locationId: string;
    catalogSelections: Array<{
      brand: string;
      model: string;
      quantity: number;
      deviceTypes?: string[];
    }>;
    requestedBy: string;
  }): ApprovalResponse {
    // Calculate total quantity and cost estimate
    const totalQuantity = params.catalogSelections.reduce((sum, sel) => sum + sel.quantity, 0);
    
    return this.requestApproval(
      {
        type: 'PHONE_PURCHASE',
        locationId: params.locationId,
        entityId: `catalog-${params.locationId}`, // Use location ID as entity ID for catalog purchases
        metadata: {
          catalogSelections: params.catalogSelections,
          totalQuantity,
          purchaseType: 'CATALOG',
        },
      },
      params.requestedBy
    );
  }

  /**
   * Check if purchase flow should be forced
   * Rule: If deviceOwnership = NOT_OWNED OR unsupported devices exist
   */
  static shouldForcePurchaseFlow(locationId: string): {
    shouldForce: boolean;
    reason?: string;
  } {
    const onboarding = mockDataService.onboarding.getByLocationId(locationId);
    if (!onboarding) {
      return { shouldForce: false };
    }

    // Force if devices not owned
    if (onboarding.deviceOwnership === 'NOT_OWNED') {
      return {
        shouldForce: true,
        reason: 'Devices are not owned',
      };
    }

    // Force if unsupported devices exist
    const phones = mockDataService.phones.getByLocationId(locationId);
    const hasUnsupported = phones.some(p => p.isUnsupported);
    if (hasUnsupported) {
      return {
        shouldForce: true,
        reason: 'Unsupported devices detected',
      };
    }

    return { shouldForce: false };
  }

  /**
   * Approve an approval request
   */
  static approve(
    approvalId: string,
    approvedBy: string,
    comments?: string
  ): ApprovalResponse {
    const approval = approvals.get(approvalId);
    if (!approval) {
      throw new Error(`Approval ${approvalId} not found`);
    }

    if (approval.status !== 'PENDING') {
      throw new Error(`Approval ${approvalId} is not pending`);
    }

    approval.status = 'APPROVED';
    approval.approvedBy = approvedBy;
    approval.approvedAt = new Date();
    approval.comments = comments;

    approvals.set(approvalId, approval);

    // Log audit
    AuditLogService.log({
      action: 'APPROVE',
      entityType: 'approval',
      entityId: approvalId,
      userId: approvedBy,
      metadata: {
        previousStatus: 'PENDING',
        newStatus: 'APPROVED',
        comments,
      },
    });

    return approval;
  }

  /**
   * Reject an approval request
   */
  static reject(
    approvalId: string,
    rejectedBy: string,
    comments?: string
  ): ApprovalResponse {
    const approval = approvals.get(approvalId);
    if (!approval) {
      throw new Error(`Approval ${approvalId} not found`);
    }

    if (approval.status !== 'PENDING') {
      throw new Error(`Approval ${approvalId} is not pending`);
    }

    approval.status = 'REJECTED';
    approval.approvedBy = rejectedBy; // Reusing field for rejector
    approval.approvedAt = new Date();
    approval.comments = comments;

    approvals.set(approvalId, approval);

    // Log audit
    AuditLogService.log({
      action: 'REJECT',
      entityType: 'approval',
      entityId: approvalId,
      userId: rejectedBy,
      metadata: {
        previousStatus: 'PENDING',
        newStatus: 'REJECTED',
        comments,
      },
    });

    return approval;
  }

  /**
   * Get approval by ID
   */
  static getApproval(approvalId: string): ApprovalResponse | null {
    return approvals.get(approvalId) || null;
  }

  /**
   * Get pending approvals for a location
   */
  static getPendingApprovals(locationId: string): ApprovalResponse[] {
    return Array.from(approvals.values()).filter(
      a => a.status === 'PENDING' && a.metadata?.locationId === locationId
    );
  }

  /**
   * Check if location has pending approvals
   */
  static hasPendingApprovals(locationId: string): boolean {
    return this.getPendingApprovals(locationId).length > 0;
  }

  /**
   * Get all approvals for a location
   */
  static getApprovalsForLocation(locationId: string): ApprovalResponse[] {
    // In real implementation, query by locationId
    return Array.from(approvals.values());
  }
}
