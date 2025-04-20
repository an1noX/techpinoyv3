
import { LucideIcon } from "lucide-react";

interface BenefitItemProps {
  icon: LucideIcon;
  text: string;
  delay: number;
  color: string;
}

export function BenefitItem({ icon: Icon, text, delay, color }: BenefitItemProps) {
  return (
    <li className="flex items-start gap-2 animate-slide-in" style={{ animationDelay: `${delay}ms` }}>
      <span className={`p-1 rounded-full ${color} mt-0.5`}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="text-gray-800 text-sm">{text}</span>
    </li>
  );
}
