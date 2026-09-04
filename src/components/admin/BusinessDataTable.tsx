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
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronLeft, ChevronRight, Building, ExternalLink } from 'lucide-react';
import { BusinessWithOwner } from '@/hooks/useBusinessManagement';
import { BusinessRowActions } from './BusinessRowActions';

interface BusinessDataTableProps {
  businesses: BusinessWithOwner[];
  isLoading: boolean;
  onDelete: (business: BusinessWithOwner) => Promise<void>;
  isDeleting: boolean;
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export function BusinessDataTable({
  businesses,
  isLoading,
  onDelete,
  isDeleting,
  page,
  totalPages,
  totalCount,
  onPageChange
}: BusinessDataTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Owner Year</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-36" />
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-muted-foreground">No businesses found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Owner Year</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {businesses.map((business) => (
              <TableRow key={business.id}>
                {/* Business Column */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 rounded">
                      {business.logo_url ? (
                        <AvatarImage src={business.logo_url} className="object-contain" />
                      ) : null}
                      <AvatarFallback className="rounded">
                        <Building className="h-5 w-5 text-muted-foreground" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="font-medium">{business.business_name}</span>
                      {business.website && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <ExternalLink className="h-3 w-3" />
                          <a
                            href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline truncate max-w-[150px]"
                          >
                            {business.website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* Category Column */}
                <TableCell>
                  {business.category_name ? (
                    <Badge variant="outline">{business.category_name}</Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>

                {/* Location Column */}
                <TableCell>
                  {business.location_country ? (
                    <span>
                      {business.location_city && `${business.location_city}, `}
                      {business.location_country}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>

                {/* Owner Column */}
                <TableCell>
                  <div>
                    <span className="font-medium">{business.owner_name || 'Unknown'}</span>
                    {business.owner_email && (
                      <p className="text-sm text-muted-foreground truncate max-w-[180px]">
                        {business.owner_email}
                      </p>
                    )}
                  </div>
                </TableCell>

                {/* Owner Graduation Year Column */}
                <TableCell>
                  {business.owner_graduation_year || <span className="text-muted-foreground">-</span>}
                </TableCell>

                {/* Actions Column */}
                <TableCell>
                  <BusinessRowActions
                    business={business}
                    onDelete={onDelete}
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
            Showing {page * 20 + 1} to {Math.min((page + 1) * 20, totalCount)} of {totalCount} businesses
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
