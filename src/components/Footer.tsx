import { Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="flex items-start gap-3">
            <MapPin className="size-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-slate-400 text-sm">Адрес</div>
              <div className="text-sm">Республика Казахстан, 070004, г.Усть-Каменогорск, ул.Казахстан, 27</div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Mail className="size-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-slate-400 text-sm">Email</div>
              <div>info@rating.kz</div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Phone className="size-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-slate-400 text-sm">Техническая поддержка</div>
              <div>8 (777) 535-19-54</div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Phone className="size-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-slate-400 text-sm">Ценовые предложения</div>
              <div>8 (7232) 203-203</div>
              <div className="text-slate-400 text-xs mt-1">вн. 120, 121, 123</div>
            </div>
          </div>
        </div>
        
        <div className="pt-6 border-t border-slate-800 text-center text-slate-400 text-sm">
          © {new Date().getFullYear()} IT Компания Рейтинг. Все права защищены.
        </div>
      </div>
    </footer>
  );
}