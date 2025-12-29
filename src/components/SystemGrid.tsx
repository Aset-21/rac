import { SystemCard } from "./SystemCard";
import { 
  Database, 
  AlertTriangle, 
  Map, 
  FileText, 
  Cpu, 
  Thermometer, 
  Megaphone, 
  FileBarChart,
  MessageSquare
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { translations } from "../locales/translations";

export function SystemGrid() {
  const { language } = useLanguage();
  const t = translations[language];

  const systems = [
    {
      id: 1,
      title: t.systems.registries.title,
      description: t.systems.registries.description,
      icon: Database,
      url: "https://forms.situation-centre.kz",
      color: "from-blue-500 to-blue-600"
    },
    {
      id: 2,
      title: t.systems.situationCenter.title,
      description: t.systems.situationCenter.description,
      icon: AlertTriangle,
      url: "https://situation-centre.kz",
      color: "from-emerald-500 to-emerald-600"
    },
    {
      id: 3,
      title: t.systems.floods.title,
      description: t.systems.floods.description,
      icon: Map,
      url: "https://maps.situation-centre.kz",
      color: "from-amber-500 to-amber-600"
    },
    {
      id: 4,
      title: t.systems.forms.title,
      description: t.systems.forms.description,
      icon: FileText,
      url: "https://arm.situation-centre.kz",
      color: "from-purple-500 to-purple-600"
    },
    {
      id: 5,
      title: t.systems.rac.title,
      description: t.systems.rac.description,
      icon: Cpu,
      url: "https://forms.situation-centre.kz/regionalanalysiscenter",
      color: "from-pink-500 to-pink-600"
    },
    {
      id: 6,
      title: t.systems.heatMonitoring.title,
      description: t.systems.heatMonitoring.description,
      icon: Thermometer,
      url: "https://hs.e-vko.kz/embed/heat-monitoring",
      color: "from-red-500 to-red-600"
    },
    {
      id: 7,
      title: t.systems.mediaPlanning.title,
      description: t.systems.mediaPlanning.description,
      icon: Megaphone,
      url: "https://media.situation-centre.kz/",
      color: "from-cyan-500 to-cyan-600"
    },
    {
      id: 8,
      title: t.systems.infoPolicy.title,
      description: t.systems.infoPolicy.description,
      icon: FileBarChart,
      url: "https://forms.situation-centre.kz/informationpolicy",
      color: "from-indigo-500 to-indigo-600"
    },
    {
      id: 9,
      title: t.systems.citizenPlatform.title,
      description: t.systems.citizenPlatform.description,
      icon: MessageSquare,
      url: "https://crm.e-vko.kz",
      color: "from-violet-500 to-violet-600"
    }
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {systems.map((system) => (
        <SystemCard key={system.id} {...system} />
      ))}
    </div>
  );
}