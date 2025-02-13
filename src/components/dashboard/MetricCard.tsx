
import { Card } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string;
  action: () => void;
  actionLabel: string;
  secondaryAction?: () => void;
  secondaryActionLabel?: string;
  isLoading?: boolean;
}

export function MetricCard({ 
  title, 
  value, 
  action, 
  actionLabel,
  secondaryAction,
  secondaryActionLabel,
  isLoading
}: MetricCardProps) {
  console.log(`Rendering MetricCard for ${title}`);
  
  return (
    <Card className="p-6">
      <div className="bg-dgxprt-navy rounded-t-md -mx-6 -mt-6 p-4 mb-4">
        <h3 className="text-lg font-bold text-white text-center">{title}</h3>
      </div>
      <p className="text-4xl font-bold text-dgxprt-navy mb-4 text-center">
        {isLoading ? "..." : value}
      </p>
      <button
        onClick={action}
        className="w-full py-2 text-center rounded-md bg-dgxprt-purple text-white hover:bg-dgxprt-purple/90 mb-2"
      >
        {actionLabel}
      </button>
      {secondaryAction && secondaryActionLabel && (
        <button
          onClick={secondaryAction}
          className="w-full py-2 text-center rounded-md bg-dgxprt-purple text-white font-bold hover:bg-dgxprt-purple/90"
        >
          {secondaryActionLabel}
        </button>
      )}
    </Card>
  );
}
