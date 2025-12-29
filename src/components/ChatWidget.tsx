import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { translations } from "../locales/translations";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface SystemInfo {
  keywords: string[];
  url: string;
}

const WEBHOOK_URL = "https://n8n.e-vko.kz/webhook-test/3b55dd73-10b8-40c4-9f85-8d825e800c6d";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now(),
        text:
          language === "ru"
            ? "Здравствуйте! Я виртуальный помощник портала информационных систем. Я могу помочь вам найти нужную систему или рассказать о моих возможностях. Спросите меня: 'Что ты умеешь?' или попросите показать интересующую вас систему."
            : "Сәлеметсіз бе! Мен ақпараттық жүйелер порталының виртуалды көмекшісімін. Мен сізге қажетті жүйені табуға немесе менің мүмкіндіктерім туралы айтуға көмектесе аламын. Мәселен: 'Не істей аласың?' деп сұраңыз немесе сізді қызықтыратын жүйені көрсетуімді сұраңыз.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, language]);

  const systemsMapping: { [key: string]: SystemInfo } = {
    registries: {
      keywords: [
        "реестр",
        "реестры",
        "данные",
        "справочник",
        "тізілім",
        "деректер",
        "анықтамалық",
      ],
      url: "https://forms.situation-centre.kz",
    },
    situationCenter: {
      keywords: [
        "ситуационный",
        "центр",
        "мониторинг",
        "координация",
        "ахуалдық",
        "орталық",
        "үйлестіру",
      ],
      url: "https://situation-centre.kz",
    },
    floods: {
      keywords: [
        "паводок",
        "паводк",
        "наводнение",
        "вода",
        "су тасқын",
        "тасқын",
      ],
      url: "https://maps.situation-centre.kz",
    },
    forms: {
      keywords: ["форм", "сбор", "сц", "жинау", "нысан", "жо"],
      url: "https://arm.situation-centre.kz",
    },
    rac: {
      keywords: ["рац", "ядро", "аналит", "өзег", "ато", "талдау"],
      url: "https://forms.situation-centre.kz/regionalanalysiscenter",
    },
    heatMonitoring: {
      keywords: [
        "тепло",
        "отопление",
        "теплоисточник",
        "жылу",
        "жылыту",
        "көз",
      ],
      url: "https://hs.e-vko.kz/embed/heat-monitoring",
    },
    mediaPlanning: {
      keywords: ["медиа", "планирование", "жоспарлау", "коммуникац"],
      url: "https://media.situation-centre.kz/",
    },
    infoPolicy: {
      keywords: [
        "информационн",
        "политика",
        "ақпарат",
        "саясат",
        "публичн",
      ],
      url: "https://forms.situation-centre.kz/informationpolicy",
    },
    citizenPlatform: {
      keywords: [
        "обращен",
        "граждан",
        "платформа",
        "өтініш",
        "азаматтар",
        "халық",
      ],
      url: "https://crm.e-vko.kz",
    },
  };

  const detectSystemFromMessage = (message: string): string | null => {
    const lowerMessage = message.toLowerCase();

    for (const [systemKey, systemInfo] of Object.entries(systemsMapping)) {
      for (const keyword of systemInfo.keywords) {
        if (lowerMessage.includes(keyword.toLowerCase())) {
          return systemKey;
        }
      }
    }
    return null;
  };

  // Функция для отправки запроса на webhook
  const sendToWebhook = async (userMessage: string): Promise<string> => {
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          language: language,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Проверяем, есть ли URL для открытия
      if (data.url) {
        setTimeout(() => {
          window.open(data.url, "_blank");
        }, 1000);
      }
      
      // Если webhook вернул системный ключ, открываем соответствующую систему
      if (data.systemKey && systemsMapping[data.systemKey]) {
        setTimeout(() => {
          window.open(systemsMapping[data.systemKey].url, "_blank");
        }, 1000);
      }
      
      // Возвращаем ответ от webhook
      return data.response || data.message || data.text || JSON.stringify(data);
    } catch (error) {
      console.error("Ошибка при отправке на webhook:", error);
      
      // В случае ошибки используем локальную обработку как fallback
      return generateLocalResponse(userMessage);
    }
  };

  // Локальная обработка сообщений (используется как fallback)
  const generateLocalResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    const t = translations[language];

    // Приветствия
    if (
      lowerMessage.includes("привет") ||
      lowerMessage.includes("здравств") ||
      lowerMessage.includes("салем") ||
      lowerMessage.includes("сәлем")
    ) {
      return language === "ru"
        ? "Здравствуйте! Чем могу помочь?"
        : "Сәлеметсіз бе! Сізге қалай көмектесе аламын?";
    }

    // Что ты умеешь?
    if (
      lowerMessage.includes("что ты умеешь") ||
      lowerMessage.includes("что умеешь") ||
      lowerMessage.includes("возможност") ||
      lowerMessage.includes("функции") ||
      lowerMessage.includes("не істей") ||
      lowerMessage.includes("мүмкіндік")
    ) {
      return language === "ru"
        ? "Я могу:\n\n• Показать информацию о паводковой ситуации\n• Помочь открыть Ситуационный центр\n• Найти нужные реестры данных\n• Открыть систему мониторинга теплоисточников\n• Показать формы сбора данных\n• Помочь с другими информационными системами\n\nПросто напишите, что вас интересует, например: 'покажи паводковую ситуацию' или 'открой реестры данных'"
        : "Мен мыналарды жасай аламын:\n\n• Су тасқыны жағдайы туралы ақпаратты көрсету\n• Ахуалдық орталықты ашуға көмектесу\n• Қажетті деректер тізілімдерін табу\n• Жылу көздерін бақылау жүйесін ашу\n• Деректерді жинау нысандарын көрсету\n• Басқа ақпараттық жүйелермен көмектесу\n\nТек сізді не қызықтыратынын жазыңыз, мысалы: 'су тасқыны жағдайын көрсет' немесе 'деректер тізілімдерін аш'";
    }

    // Благодарность
    if (
      lowerMessage.includes("спасибо") ||
      lowerMessage.includes("благодар") ||
      lowerMessage.includes("рахмет") ||
      lowerMessage.includes("алғыс")
    ) {
      return language === "ru"
        ? "Пожалуйста! Обращайтесь, если нужна помощь."
        : "Өтінемін! Көмек керек болса, хабарласыңыз.";
    }

    // Помощь
    if (
      lowerMessage.includes("помощь") ||
      lowerMessage.includes("помоги") ||
      lowerMessage.includes("көмек") ||
      lowerMessage.includes("көмектес")
    ) {
      return language === "ru"
        ? "Конечно! Напишите, какая система вас интересует, и я помогу её открыть. Или спросите: 'Что ты умеешь?'"
        : "Әрине! Сізді қандай жүйе қызықтырады жазыңыз, мен оны ашуға көмектесемін. Немесе: 'Не істей аласың?' деп сұраңыз.";
    }

    // Поиск системы
    const detectedSystem = detectSystemFromMessage(userMessage);
    if (detectedSystem) {
      const systemUrl = systemsMapping[detectedSystem].url;
      const systemName = t.systems[detectedSystem as keyof typeof t.systems];

      setTimeout(() => {
        window.open(systemUrl, "_blank");
      }, 1000);

      return language === "ru"
        ? `Открываю "${systemName.title}"...\n\nСистема откроется в новой вкладке через секунду.`
        : `"${systemName.title}" ашылуда...\n\nЖүйе бір секундтан кейін жаңа бетте ашылады.`;
    }

    // Список систем
    if (
      lowerMessage.includes("список") ||
      lowerMessage.includes("все систем") ||
      lowerMessage.includes("какие систем") ||
      lowerMessage.includes("тізім") ||
      lowerMessage.includes("барлық жүйе")
    ) {
      return language === "ru"
        ? "Доступные системы:\n\n• Реестры данных\n• Ситуационный центр\n• Ситуация по паводкам\n• Формы сбора СЦ\n• Ядро РАЦ\n• Мониторинг теплоисточников\n• Медиапланирование\n• Информационная политика\n• Платформа обращений граждан\n\nНапишите название нужной системы, и я её открою."
        : "Қолжетімді жүйелер:\n\n• Деректер тізілімдері\n• Ахуалдық орталық\n• Су тасқыны жағдайы\n• ЖО жинау нысандары\n• АТО өзегі\n• Жылу көздерін бақылау\n• Медиа жоспарлау\n• Ақпараттық саясат\n• Азаматтардың өтініштері платформасы\n\nҚажетті жүйенің атын жазыңыз, мен оны ашамын.";
    }

    // Ответ по умолчанию
    return language === "ru"
      ? "Извините, я не совсем понял ваш запрос. Попробуйте спросить: 'Что ты умеешь?' или укажите название интересующей системы."
      : "Кешіріңіз, мен сіздің сұрауыңызды толық түсінбедім. 'Не істей аласың?' деп сұраңыз немесе қызықтыратын жүйенің атын көрсетіңіз.";
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageToSend = inputValue;
    setInputValue("");
    setIsLoading(true);

    // Отправляем запрос на webhook
    const botResponse = await sendToWebhook(messageToSend);
    
    const botMessage: Message = {
      id: Date.now() + 1,
      text: botResponse,
      sender: "bot",
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, botMessage]);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Кнопка открытия чата */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50"
          aria-label={
            language === "ru" ? "Открыть чат" : "Чатты ашу"
          }
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Окно чата */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-slate-200">
          {/* Заголовок */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5" />
              <div>
                <h3 className="font-medium">
                  {language === "ru"
                    ? "Виртуальный помощник"
                    : "Виртуалды көмекші"}
                </h3>
                <p className="text-xs text-blue-100">
                  {language === "ru" ? "Онлайн" : "Желіде"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-blue-700 p-1 rounded transition-colors"
              aria-label={language === "ru" ? "Закрыть чат" : "Чатты жабу"}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Сообщения */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-lg ${
                    message.sender === "user"
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-white text-slate-800 rounded-bl-none shadow-sm border border-slate-200"
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender === "user"
                        ? "text-blue-100"
                        : "text-slate-400"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString(
                      language === "ru" ? "ru-RU" : "kk-KZ",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Поле ввода */}
          <div className="p-4 border-t border-slate-200 bg-white rounded-b-lg">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  language === "ru"
                    ? "Напишите сообщение..."
                    : "Хабарлама жазыңыз..."
                }
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                aria-label={
                  language === "ru" ? "Отправить" : "Жіберу"
                }
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}