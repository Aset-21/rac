import { SystemGrid } from "./components/SystemGrid";
import { LanguageProvider } from "./contexts/LanguageContext";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { ChatWidget } from "./components/ChatWidget";
import { useLanguage } from "./contexts/LanguageContext";
import { translations } from "./locales/translations";

function AppContent() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="min-h-screen bg-slate-50 py-12 md:py-16">
      <main className="container mx-auto px-4">
        <div className="flex justify-end mb-8">
          <LanguageSwitcher />
        </div>
        
        <div className="text-center mb-12">
          <h1 className="text-slate-900 mb-2">
            {t.title}
          </h1>
          <h2 className="text-slate-700">
            {t.subtitle}
          </h2>
        </div>
        
        <SystemGrid />
      </main>
      
      <ChatWidget />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}