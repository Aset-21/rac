import logoImage from "figma:asset/a64c95f638a4bb19d8530c362ec957c7c7dfb22a.png";
import { Phone, Mail, Clock } from "lucide-react";
import { useEffect, useState } from "react";

export function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-KZ', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-KZ', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Logo and Title */}
          <div className="flex items-center gap-4">
            <img 
              src={logoImage} 
              alt="IT Компания Рейтинг" 
              className="h-14 w-auto"
            />
            <div className="border-l border-slate-300 pl-4">
              <h2 className="text-slate-900 leading-tight">IT КОМПАНИЯ РЕЙТИНГ</h2>
            </div>
          </div>

          {/* Right side info */}
          <div className="flex flex-wrap items-center gap-6">
            {/* Date and Time */}
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="size-5 text-blue-600" />
              <div>
                <div className="text-xs text-slate-500">{formatDate(currentTime)}</div>
                <div className="font-mono">{formatTime(currentTime)}</div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="flex flex-wrap items-center gap-4">
              <a 
                href="tel:+77775351954" 
                className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors"
              >
                <Phone className="size-4 text-blue-600" />
                <div>
                  <div className="text-xs text-slate-500">Поддержка</div>
                  <div className="text-sm">8 (777) 535-19-54</div>
                </div>
              </a>

              <a 
                href="mailto:info@rating.kz" 
                className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors"
              >
                <Mail className="size-4 text-blue-600" />
                <div>
                  <div className="text-xs text-slate-500">Email</div>
                  <div className="text-sm">info@rating.kz</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}