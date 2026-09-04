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
import { MoreVertical, Eye, Trash2 } from 'lucide-react';
import { BusinessWithOwner } from '@/hooks/useBusinessManagement';

interface BusinessRowActionsProps {
  business: BusinessWithOwner;
  onDelete: (business: BusinessWithOwner) => Promise<void>;
  isDeleting: boolean;
}

export function BusinessRowActions({
  business,
  onDelete,
  isDeleting
}: BusinessRowActionsProps) {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleViewBusiness = () => {
    navigate(`/abud/business/${business.id}`);
  };

  const handleDelete = async () => {
    await onDelete(business);
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
          <DropdownMenuItem onClick={handleViewBusiness}>
            <Eye className="mr-2 h-4 w-4" />
            View Business
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Business
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Business</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>Are you sure you want to delete <strong>{business.business_name}</strong>?</p>
                <p>This will permanently remove:</p>
                <ul className="list-disc list-inside text-sm">
                  <li>The business listing and all details</li>
                  <li>Business gallery images</li>
                  <li>Business achievements</li>
                  <li>Category associations</li>
                  <li>Team member associations</li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  Owner: {business.owner_name || business.owner_email || 'Unknown'}
                </p>
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
              {isDeleting ? 'Deleting...' : 'Delete Business'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
