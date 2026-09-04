import { LucideIcon } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

interface StatItem {
  value: number;
  label: string;
  icon: LucideIcon;
  suffix?: string;
}

interface StatsSectionProps {
  stats: StatItem[];
  loading?: boolean;
}

export function StatsSection({ stats, loading }: StatsSectionProps) {
  if (loading) {
    return (
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="text-center p-6">
                <div className="flex flex-col items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <Skeleton className="h-10 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Our Growing Network</h2>
          <p className="text-muted-foreground">Join thousands of UTP alumni making connections worldwide</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatsCard
              key={index}
              value={stat.value}
              label={stat.label}
              icon={stat.icon}
              suffix={stat.suffix}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
