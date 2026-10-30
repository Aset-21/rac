import { LogOut } from "lucide-react";
import { SystemGrid } from "./components/SystemGrid";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { LoginPage } from "./components/LoginPage";
import { ChatWidget } from "./components/ChatWidget";
import { Button } from "./components/ui/button";
import { useLanguage } from "./contexts/LanguageContext";
import { translations } from "./locales/translations";

function AppContent() {
  const { language } = useLanguage();
  const { user, logout } = useAuth();
  const t = translations[language];

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 md:py-16">
      <main className="container mx-auto px-4">
        <div className="flex justify-end items-center gap-3 mb-8">
          <span className="text-sm text-slate-600">{user.username}</span>
          <LanguageSwitcher />
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut />
            {t.logout}
          </Button>
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
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
