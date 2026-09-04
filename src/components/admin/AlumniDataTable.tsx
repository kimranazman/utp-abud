import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronLeft, ChevronRight, CheckCircle, Clock, Shield } from 'lucide-react';
import { AlumniProfile } from '@/hooks/useAlumniManagement';
import { AlumniRowActions } from './AlumniRowActions';

interface AlumniDataTableProps {
  alumni: AlumniProfile[];
  isLoading: boolean;
  currentUserId: string | undefined;
  onDelete: (alumni: AlumniProfile) => Promise<void>;
  onUpdateRole: (userId: string, newRole: 'admin' | 'alumni' | 'pending') => Promise<void>;
  isDeleting: boolean;
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export function AlumniDataTable({
  alumni,
  isLoading,
  currentUserId,
  onDelete,
  onUpdateRole,
  isDeleting,
  page,
  totalPages,
  totalCount,
  onPageChange
}: AlumniDataTableProps) {
  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getCompletionColor = (completion: number) => {
    if (completion >= 75) return 'text-green-600';
    if (completion >= 50) return 'text-yellow-600';
    if (completion >= 25) return 'text-orange-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Graduation Year</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Completion</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (alumni.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-muted-foreground">No alumni found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Graduation Year</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Completion</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alumni.map((profile) => (
              <TableRow key={profile.id}>
                {/* User Column */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={profile.avatar_url || undefined} />
                      <AvatarFallback>{getInitials(profile.full_name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{profile.full_name || 'No name'}</span>
                        {profile.role === 'admin' && (
                          <Badge variant="destructive" className="gap-1 text-xs px-1.5 py-0">
                            <Shield className="h-3 w-3" />
                            Admin
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">{profile.email}</span>
                    </div>
                  </div>
                </TableCell>

                {/* Graduation Year Column */}
                <TableCell>
                  {profile.graduation_year || '-'}
                </TableCell>

                {/* Location Column */}
                <TableCell>
                  {profile.location_country ? (
                    <span>
                      {profile.location_city && `${profile.location_city}, `}
                      {profile.location_country}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>

                {/* Program Column */}
                <TableCell>
                  {profile.course || <span className="text-muted-foreground">-</span>}
                </TableCell>

                {/* Completion Column */}
                <TableCell>
                  <div className="flex items-center gap-2 min-w-[100px]">
                    <Progress value={profile.completion} className="h-2 w-16" />
                    <span className={`text-sm font-medium ${getCompletionColor(profile.completion)}`}>
                      {profile.completion}%
                    </span>
                  </div>
                </TableCell>

                {/* Status Column */}
                <TableCell>
                  {profile.is_verified ? (
                    <Badge variant="outline" className="gap-1 bg-green-50 text-green-700 border-green-200">
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="h-3 w-3" />
                      Pending
                    </Badge>
                  )}
                </TableCell>

                {/* Actions Column */}
                <TableCell>
                  <AlumniRowActions
                    alumni={profile}
                    currentUserId={currentUserId}
                    onDelete={onDelete}
                    onUpdateRole={onUpdateRole}
                    isDeleting={isDeleting}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {page * 20 + 1} to {Math.min((page + 1) * 20, totalCount)} of {totalCount} alumni
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages - 1}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
