import { LucideIcon, ArrowRight } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { useLanguage } from "../contexts/LanguageContext";
import { translations } from "../locales/translations";

interface SystemCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  url: string;
  color: string;
}

export function SystemCard({ title, description, icon: Icon, url, color }: SystemCardProps) {
  const { language } = useLanguage();
  const t = translations[language];

  const handleClick = () => {
    // Открываем ссылку в новой вкладке
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card
      className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-slate-200 bg-white overflow-hidden"
      onClick={handleClick}
    >
      <CardContent className="p-6">
        <div className="flex flex-col h-full">
          {/* Icon */}
          <div
            className={`w-14 h-14 rounded-xl p-3 mb-4 transition-transform duration-300 group-hover:scale-110 ${color.includes(' ') || color.includes('-') ? color : ''}`}
            style={!(color.includes(' ') || color.includes('-')) ? { backgroundColor: color } : {}}
          >
            <Icon className="size-full text-white" />
          </div>

          {/* Content */}
          <div className="flex-1 mb-4">
            <h3 className="text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
              {title}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {description}
            </p>
          </div>

          {/* Arrow indicator */}
          <div className="flex items-center gap-2 text-blue-600 text-sm">
            <span>{t.openSystem}</span>
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}