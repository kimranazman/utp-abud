import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Search, User, Clock } from 'lucide-react';

interface VerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VerificationModal({ open, onOpenChange }: VerificationModalProps) {
  const navigate = useNavigate();

  const handleExploreDirectory = () => {
    onOpenChange(false);
    // Navigate directly to directory instead of home page
    navigate('/abud/directory');
  };

  const handleCompleteProfile = () => {
    onOpenChange(false);
    navigate('/abud/profile/edit');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            Welcome to UTP Alumni Connect!
          </DialogTitle>
          <DialogDescription className="text-center space-y-4 pt-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-left">
                  <p className="text-sm text-blue-900 font-medium mb-1">
                    Profile Verification Pending
                  </p>
                  <p className="text-sm text-blue-700">
                    Your profile has been submitted for verification. You'll appear in the alumni directory once an admin verifies your account (usually within 24-48 hours).
                  </p>
                </div>
              </div>
            </div>

            <div className="text-left pt-2">
              <p className="text-sm font-medium text-gray-900 mb-3">
                In the meantime, you can:
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                    <Search className="w-3 h-3 text-gray-600" />
                  </div>
                  <span className="text-sm text-gray-700">Explore the alumni directory</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="w-3 h-3 text-gray-600" />
                  </div>
                  <span className="text-sm text-gray-700">View business listings</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-gray-600" />
                  </div>
                  <span className="text-sm text-gray-700">Complete additional profile sections for better visibility</span>
                </div>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center gap-2">
          <Button
            onClick={handleExploreDirectory}
            className="min-w-[140px]"
          >
            Explore Directory
          </Button>
          <Button
            variant="outline"
            onClick={handleCompleteProfile}
            className="min-w-[140px]"
          >
            Complete Profile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}