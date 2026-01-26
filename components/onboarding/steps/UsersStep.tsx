'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Edit2, X, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { mockDataService } from '@/lib/mock-data/service';
import { PhoneAssignmentType } from '@/lib/mock-data/types';
import { cn } from '@/lib/utils';

export enum UserProfile {
  AGENT = 'AGENT',
  ADMIN = 'ADMIN',
}

interface OnboardingUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  extension?: string;
  profile: UserProfile;
  source: 'device' | 'manual'; // Track if user came from devices or was manually added
}

interface UsersStepProps {
  locationId: string;
  onComplete: () => void;
  skipRules: any[];
}

export function UsersStep({ locationId, onComplete, skipRules }: UsersStepProps) {
  const [users, setUsers] = useState<OnboardingUser[]>([]);
  const [editingUser, setEditingUser] = useState<OnboardingUser | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  // Load users from devices on mount
  useEffect(() => {
    loadUsersFromDevices();
  }, [locationId]);

  const loadUsersFromDevices = () => {
    const phones = mockDataService.phones.getByLocationId(locationId);
    const deviceUsers: OnboardingUser[] = [];

    phones.forEach((phone) => {
      // Only include users assigned to devices (not extensions)
      if (
        phone.assignmentType === PhoneAssignmentType.ASSIGNED_TO_USER &&
        phone.userFirstName &&
        phone.userLastName &&
        phone.userEmail
      ) {
        // Check if user already exists (by email)
        const existingUser = deviceUsers.find((u) => u.email === phone.userEmail);
        if (!existingUser) {
          deviceUsers.push({
            id: `device-${phone.id}`,
            firstName: phone.userFirstName,
            lastName: phone.userLastName,
            email: phone.userEmail,
            extension: phone.extension,
            profile: UserProfile.AGENT, // Default to Agent
            source: 'device',
          });
        }
      }
    });

    setUsers(deviceUsers);
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setShowDialog(true);
  };

  const handleEditUser = (user: OnboardingUser) => {
    setEditingUser(user);
    setShowDialog(true);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter((u) => u.id !== userId));
  };

  const handleSaveUser = (userData: Omit<OnboardingUser, 'id' | 'source'>) => {
    if (editingUser) {
      // Update existing user
      setUsers(
        users.map((u) =>
          u.id === editingUser.id
            ? { ...userData, id: editingUser.id, source: editingUser.source }
            : u
        )
      );
    } else {
      // Add new user
      const newUser: OnboardingUser = {
        ...userData,
        id: `manual-${Date.now()}`,
        source: 'manual',
      };
      setUsers([...users, newUser]);
    }
    setShowDialog(false);
    setEditingUser(null);
  };

  // Save users when component unmounts or when navigating away
  useEffect(() => {
    // This would typically call an API to persist the users
    // For now, users are stored in component state
    // In production, you'd want to save to the backend here
    return () => {
      // Cleanup or save on unmount if needed
    };
  }, [users]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-1">Users</h3>
        <p className="text-sm text-muted-foreground">
          Manage users for this location. Users from devices are automatically included.
        </p>
      </div>

      {/* Users Summary */}
      {users.length > 0 && (
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Total Users:</span>
            <Badge variant="outline" className="font-semibold">{users.length}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">From Devices:</span>
            <Badge variant="outline" className="font-semibold">
              {users.filter((u) => u.source === 'device').length}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Manually Added:</span>
            <Badge variant="outline" className="font-semibold">
              {users.filter((u) => u.source === 'manual').length}
            </Badge>
          </div>
        </div>
      )}

      {/* Users Table */}
      {users.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-2">No users added yet</p>
            <p className="text-xs text-muted-foreground text-center max-w-sm">
              Users from devices will appear here automatically. You can also manually add users.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 border-b border-slate-200 hover:bg-slate-50/50">
                    <TableHead className="h-12 px-6 font-semibold text-xs text-slate-700 uppercase tracking-wider">
                      Name
                    </TableHead>
                    <TableHead className="h-12 px-6 font-semibold text-xs text-slate-700 uppercase tracking-wider">
                      Email
                    </TableHead>
                    <TableHead className="h-12 px-6 font-semibold text-xs text-slate-700 uppercase tracking-wider w-28">
                      Extension
                    </TableHead>
                    <TableHead className="h-12 px-6 font-semibold text-xs text-slate-700 uppercase tracking-wider w-32">
                      Profile
                    </TableHead>
                    <TableHead className="h-12 px-6 font-semibold text-xs text-slate-700 uppercase tracking-wider w-40">
                      Source
                    </TableHead>
                    <TableHead className="h-12 px-6 w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user, index) => (
                    <TableRow
                      key={user.id}
                      className={cn(
                        'border-b border-slate-100 transition-all duration-150 hover:bg-slate-50/80',
                        index === users.length - 1 && 'border-b-0'
                      )}
                    >
                      <TableCell className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-900">
                            {user.firstName} {user.lastName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <span className="text-sm text-slate-700">{user.email}</span>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        {user.extension ? (
                          <span className="text-sm font-medium text-slate-900">{user.extension}</span>
                        ) : (
                          <span className="text-sm text-slate-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge
                          variant={user.profile === UserProfile.ADMIN ? 'default' : 'secondary'}
                          className="text-xs font-medium whitespace-nowrap"
                        >
                          {user.profile}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        {user.source === 'device' ? (
                          <Badge variant="outline" className="text-xs bg-primary/5 border-primary/20 text-primary whitespace-nowrap">
                            From Device Setup
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs whitespace-nowrap">
                            Manually Added
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            className="h-8 w-8 p-0"
                            title="Edit user"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          {user.source === 'manual' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              title="Delete user"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add User Button */}
      <div className="flex justify-end">
        <Button onClick={handleAddUser} variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* User Dialog */}
      <UserDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        user={editingUser}
        onSave={handleSaveUser}
      />
    </div>
  );
}

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: OnboardingUser | null;
  onSave: (userData: Omit<OnboardingUser, 'id' | 'source'>) => void;
}

function UserDialog({ open, onOpenChange, user, onSave }: UserDialogProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [profile, setProfile] = useState<UserProfile>(UserProfile.AGENT);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setEmail(user.email);
      setProfile(user.profile);
    } else {
      setFirstName('');
      setLastName('');
      setEmail('');
      setProfile(UserProfile.AGENT);
    }
  }, [user, open]);

  const handleSave = () => {
    if (!firstName || !lastName || !email) {
      return;
    }

    onSave({
      firstName,
      lastName,
      email,
      extension: user?.extension, // Preserve extension from original user if editing, don't allow editing
      profile,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{user ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogDescription>
            {user ? 'Update user information' : 'Enter user details below'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name *</Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
              />
            </div>
            <div className="space-y-2">
              <Label>Last Name *</Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label>Email *</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john.doe@example.com"
            />
          </div>

          {/* Extension Display (read-only if from device) */}
          {user?.extension && (
            <div className="space-y-2">
              <Label>Extension</Label>
              <Input
                value={user.extension}
                disabled
                className="bg-muted cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">
                Extension is set from device configuration and cannot be edited here
              </p>
            </div>
          )}

          {/* Profile Type */}
          <div className="space-y-2">
            <Label>Profile *</Label>
            <RadioGroup
              value={profile}
              onValueChange={(value) => setProfile(value as UserProfile)}
              className="grid gap-3 pt-1"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem id="profile-agent" value={UserProfile.AGENT} />
                <Label htmlFor="profile-agent" className="font-normal text-sm cursor-pointer">
                  Agent
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem id="profile-admin" value={UserProfile.ADMIN} />
                <Label htmlFor="profile-admin" className="font-normal text-sm cursor-pointer">
                  Admin
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={!firstName || !lastName || !email}
            >
              {user ? 'Save Changes' : 'Add User'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
