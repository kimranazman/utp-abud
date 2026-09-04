import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useCountUp } from '@/hooks/useCountUp';

interface StatsCardProps {
  value: number;
  label: string;
  icon: LucideIcon;
  suffix?: string;
}

export function StatsCard({ value, label, icon: Icon, suffix }: StatsCardProps) {
  const { count, ref } = useCountUp(value, 2000);

  return (
    <Card className="text-center p-6 hover:shadow-lg hover:border-utp-blue/30 transition-all">
      <div ref={ref} className="flex flex-col items-center gap-3">
        <div className="h-12 w-12 bg-utp-blue/10 rounded-full flex items-center justify-center">
          <Icon className="h-6 w-6 text-utp-blue" />
        </div>
        <div className="text-3xl md:text-4xl font-bold text-foreground">
          {count}
          {suffix && <span className="text-utp-gold">{suffix}</span>}
        </div>
        <p className="text-muted-foreground font-medium">{label}</p>
      </div>
    </Card>
  );
}
