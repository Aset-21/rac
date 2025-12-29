import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/button';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm border border-slate-200 p-1">
      <Button
        variant={language === 'kk' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setLanguage('kk')}
        className="text-sm px-4"
      >
        Қазақша
      </Button>
      <Button
        variant={language === 'ru' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setLanguage('ru')}
        className="text-sm px-4"
      >
        Русский
      </Button>
    </div>
  );
}
