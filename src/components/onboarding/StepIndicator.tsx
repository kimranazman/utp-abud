import { cn } from '@/lib/utils';
import { Check, Clock, Lock, Star, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export interface Step {
  index: number;
  title: string;
  subtitle?: string;
  isRequired: boolean;
  isCompleted: boolean;
  isCurrent: boolean;
  isAvailable: boolean;
  estimatedTime?: string;
  icon?: React.ReactNode;
}

interface StepIndicatorProps {
  steps: Step[];
  onStepClick?: (stepIndex: number) => void;
  orientation?: 'horizontal' | 'vertical';
  showEstimatedTime?: boolean;
  showConnectors?: boolean;
  groupedSteps?: {
    title: string;
    steps: number[];
  }[];
  className?: string;
}

export function StepIndicator({
  steps,
  onStepClick,
  orientation = 'horizontal',
  showEstimatedTime = true,
  showConnectors = true,
  groupedSteps,
  className
}: StepIndicatorProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getStepStatus = (step: Step) => {
    if (step.isCompleted) return 'completed';
    if (step.isCurrent) return 'current';
    if (step.isAvailable) return 'available';
    return 'locked';
  };

  const getStepIcon = (step: Step) => {
    const status = getStepStatus(step);

    if (status === 'completed') {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-full h-full flex items-center justify-center bg-green-500 text-white rounded-full"
        >
          <Check className="w-4 h-4" />
        </motion.div>
      );
    }

    if (status === 'current') {
      return (
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-full h-full flex items-center justify-center bg-blue-500 text-white rounded-full"
        >
          <div className="w-2 h-2 bg-white rounded-full" />
        </motion.div>
      );
    }

    if (status === 'locked') {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 rounded-full">
          <Lock className="w-3 h-3" />
        </div>
      );
    }

    return (
        <div className="w-full h-full flex items-center justify-center bg-white border-2 border-gray-300 rounded-full">
          <div className="text-sm font-medium text-gray-600">{step.index + 1}</div>
        </div>
    );
  };

  const getStepColors = (step: Step) => {
    const status = getStepStatus(step);

    const colors = {
      completed: {
        bg: 'bg-green-50',
        border: 'border-green-500',
        text: 'text-green-700',
        connector: 'bg-green-500'
      },
      current: {
        bg: 'bg-blue-50',
        border: 'border-blue-500',
        text: 'text-blue-700',
        connector: 'bg-gray-300'
      },
      available: {
        bg: 'bg-white',
        border: 'border-gray-300',
        text: 'text-gray-700',
        connector: 'bg-gray-300'
      },
      locked: {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-400',
        connector: 'bg-gray-200'
      }
    };

    return colors[status];
  };

  const renderConnector = (step: Step, nextStep?: Step) => {
    if (!showConnectors || !nextStep) return null;

    const isCompleted = step.isCompleted;
    const isActive = step.isCurrent;

    return (
      <div
        className={cn(
          'absolute top-6 w-full h-0.5 -right-1/2 transform translate-x-full',
          orientation === 'vertical' && 'top-12 left-6 w-0.5 h-full transform-none',
          isCompleted ? 'bg-green-500' : 'bg-gray-300'
        )}
      >
        {isActive && (
          <motion.div
            className="h-full bg-blue-500"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.5 }}
          />
        )}
      </div>
    );
  };

  const renderStep = (step: Step, index: number) => {
    const colors = getStepColors(step);
    const status = getStepStatus(step);
    const isClickable = step.isAvailable && onStepClick;

    return (
      <motion.div
        key={step.index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className={cn(
          'relative flex items-start gap-3',
          orientation === 'vertical' ? 'flex-row' : 'flex-col',
          isClickable && 'cursor-pointer group',
          className
        )}
        onClick={() => isClickable && onStepClick(step.index)}
      >
        {/* Step Icon */}
        <div className="relative">
          <div
            className={cn(
              'w-12 h-12 rounded-full border-2 transition-all duration-200',
              colors.border,
              isClickable && 'group-hover:shadow-lg group-hover:scale-110'
            )}
          >
            {getStepIcon(step)}
          </div>

          {/* Required Indicator */}
          {step.isRequired && (
            <div
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
              title="Required step"
            >
              <Star className="w-3 h-3 text-white fill-white" />
            </div>
          )}

          {/* Connector */}
          {index < steps.length - 1 && renderConnector(step, steps[index + 1])}
        </div>

        {/* Step Content */}
        <div
          className={cn(
            'flex-1',
            orientation === 'horizontal' ? 'text-center' : 'text-left',
            status === 'locked' && 'opacity-50'
          )}
        >
          <div className={cn('font-medium text-sm', colors.text)}>
            {step.title}
          </div>

          {step.subtitle && (
            <div className="text-xs text-gray-500 mt-0.5">
              {step.subtitle}
            </div>
          )}

          {showEstimatedTime && step.estimatedTime && (
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
              <Clock className="w-3 h-3" />
              {step.estimatedTime}
            </div>
          )}

          {/* Progress Badge */}
          {step.isCurrent && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700"
            >
              In Progress
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  };

  // Group steps if grouping is provided
  const renderGroupedSteps = () => {
    if (!groupedSteps) return null;

    return (
      <div className="space-y-6">
        {groupedSteps.map((group, groupIndex) => {
          const groupSteps = steps.filter(step =>
            group.steps.includes(step.index)
          );

          const isGroupComplete = groupSteps.every(s => s.isCompleted);
          const hasCurrentStep = groupSteps.some(s => s.isCurrent);

          return (
            <div key={groupIndex} className="relative">
              {/* Group Header */}
              <div className="flex items-center gap-2 mb-4">
                <div
                  className={cn(
                    'text-sm font-semibold uppercase tracking-wider',
                    isGroupComplete ? 'text-green-600' :
                    hasCurrentStep ? 'text-blue-600' : 'text-gray-500'
                  )}
                >
                  {group.title}
                </div>
                {isGroupComplete && (
                  <Check className="w-4 h-4 text-green-600" />
                )}
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Group Steps */}
              <div
                className={cn(
                  'grid gap-4',
                  orientation === 'horizontal'
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                    : 'grid-cols-1'
                )}
              >
                {groupSteps.map((step, index) => renderStep(step, index))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Mobile view with vertical orientation
  if (isMobile && orientation === 'horizontal') {
    return (
      <div className="space-y-4">
        {steps.map((step, index) => renderStep(step, index))}
      </div>
    );
  }

  // Grouped view
  if (groupedSteps) {
    return renderGroupedSteps();
  }

  // Default view
  return (
    <div
      className={cn(
        'flex',
        orientation === 'horizontal'
          ? 'flex-row items-start justify-between gap-8 overflow-x-auto'
          : 'flex-col gap-6'
      )}
    >
      {steps.map((step, index) => renderStep(step, index))}
    </div>
  );
}

// Compact Step Progress Bar
interface CompactStepProgressProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: Set<number>;
  requiredSteps: number[];
  onStepClick?: (step: number) => void;
}

export function CompactStepProgress({
  currentStep,
  totalSteps,
  completedSteps,
  requiredSteps,
  onStepClick
}: CompactStepProgressProps) {
  const progressPercentage = (completedSteps.size / totalSteps) * 100;

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-green-500"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Step Dots */}
      <div className="relative mt-2">
        <div className="flex justify-between">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const isCompleted = completedSteps.has(index);
            const isCurrent = index === currentStep;
            const isRequired = requiredSteps.includes(index);
            const isClickable = isCompleted && onStepClick;

            return (
              <button
                key={index}
                onClick={() => isClickable && onStepClick(index)}
                disabled={!isClickable}
                className={cn(
                  'w-3 h-3 rounded-full transition-all duration-200',
                  isCompleted && 'bg-green-500',
                  isCurrent && 'bg-blue-500 ring-4 ring-blue-100',
                  !isCompleted && !isCurrent && 'bg-gray-300',
                  isClickable && 'cursor-pointer hover:scale-125',
                  'relative'
                )}
              >
                {isRequired && (
                  <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress Text */}
      <div className="mt-3 text-center">
        <p className="text-sm text-gray-600">
          Step {currentStep + 1} of {totalSteps}
          {requiredSteps.includes(currentStep) && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {completedSteps.size} completed, {requiredSteps.length - requiredSteps.filter(s => completedSteps.has(s)).length} required remaining
        </p>
      </div>
    </div>
  );
}