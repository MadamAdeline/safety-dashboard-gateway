
import { Card } from "@/components/ui/card";

interface InfoCardProps {
  title: string;
  image: string;
  link: string;
}

export function InfoCard({ title, image, link }: InfoCardProps) {
  return (
    <a 
      href={link} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="block"
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="h-48 overflow-hidden">
          <img src={image} alt={title} className="w-full h-full object-cover" />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-dgxprt-navy">{title}</h3>
        </div>
      </Card>
    </a>
  );
}
