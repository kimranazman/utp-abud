import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreVertical, Eye, Trash2, ShieldPlus, Shield } from 'lucide-react';
import { AlumniProfile } from '@/hooks/useAlumniManagement';

interface AlumniRowActionsProps {
  alumni: AlumniProfile;
  currentUserId: string | undefined;
  onDelete: (alumni: AlumniProfile) => Promise<void>;
  onUpdateRole: (userId: string, newRole: 'admin' | 'alumni' | 'pending') => Promise<void>;
  isDeleting: boolean;
}

export function AlumniRowActions({
  alumni,
  currentUserId,
  onDelete,
  onUpdateRole,
  isDeleting
}: AlumniRowActionsProps) {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);

  const isCurrentUser = alumni.user_id === currentUserId;
  const isAdmin = alumni.role === 'admin';

  const handleViewProfile = () => {
    navigate(`/abud/profile/${alumni.user_id}`);
  };

  const handleRoleChange = async () => {
    const newRole = isAdmin ? 'alumni' : 'admin';
    await onUpdateRole(alumni.user_id, newRole);
    setShowRoleDialog(false);
  };

  const handleDelete = async () => {
    await onDelete(alumni);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleViewProfile}>
            <Eye className="mr-2 h-4 w-4" />
            View Profile
          </DropdownMenuItem>

          {!isCurrentUser && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowRoleDialog(true)}>
                {isAdmin ? (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Remove Admin
                  </>
                ) : (
                  <>
                    <ShieldPlus className="mr-2 h-4 w-4" />
                    Make Admin
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete User
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Account</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>Are you sure you want to delete <strong>{alumni.full_name || alumni.email}</strong>'s account?</p>
                <p>This will permanently remove:</p>
                <ul className="list-disc list-inside text-sm">
                  <li>Their profile and personal information</li>
                  <li>All businesses they own</li>
                  <li>All messages and conversations</li>
                  <li>Career history and achievements</li>
                </ul>
                <p className="font-medium text-destructive">This action cannot be undone.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete Account'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Role Change Dialog */}
      <AlertDialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isAdmin ? 'Remove Admin Privileges' : 'Grant Admin Privileges'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isAdmin
                ? `Are you sure you want to remove admin privileges from ${alumni.full_name || alumni.email}? They will no longer be able to access the admin dashboard.`
                : `Are you sure you want to grant admin privileges to ${alumni.full_name || alumni.email}? They will be able to manage users, view all data, and modify system settings.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRoleChange}>
              {isAdmin ? 'Remove Admin' : 'Grant Admin'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
