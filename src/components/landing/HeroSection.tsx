import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, LogIn } from 'lucide-react';

interface HeroSectionProps {
  headline: string;
  subheadline: string;
  badge?: string;
  backgroundImage?: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
}

export function HeroSection({
  headline,
  subheadline,
  badge,
  backgroundImage,
  primaryCta,
  secondaryCta,
}: HeroSectionProps) {
  const navigate = useNavigate();

  return (
    <section
      className="relative py-16 md:py-20 lg:py-24 px-4"
      style={
        backgroundImage
          ? {
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
    >
      {/* Overlay for background image readability */}
      {backgroundImage && (
        <div className="absolute inset-0 bg-background/85" />
      )}

      <div className="container mx-auto text-center relative z-10">
        {badge && (
          <Badge variant="verified" className="mb-4">
            {badge}
          </Badge>
        )}

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-utp-blue to-utp-gold bg-clip-text text-transparent">
          {headline}
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          {subheadline}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="accent"
            size="lg"
            className="gap-2"
            onClick={() => navigate(primaryCta.href)}
          >
            {primaryCta.label}
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-2 hover:border-utp-blue hover:text-utp-blue"
            onClick={() => navigate(secondaryCta.href)}
          >
            <LogIn className="h-4 w-4" />
            {secondaryCta.label}
          </Button>
        </div>
      </div>
    </section>
  );
}
