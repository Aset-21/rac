import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  isTyping?: boolean; // Флаг, что сообщение еще печатается
}

// Используем относительный путь, чтобы работал прокси в Vite
const WEBHOOK_URL = "/webhook/3b55dd73-10b8-40c4-9f85-8d825e800c6d";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();
  
  // Рефы для управления анимацией печати
  const typingQueueRef = useRef<string>(""); // Очередь символов для печати
  const isTypingRef = useRef<boolean>(false); // Флаг, идет ли сейчас процесс печати
  const currentBotMessageIdRef = useRef<number | null>(null); // ID текущего сообщения бота

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Эффект для анимации печати
  useEffect(() => {
    let typingInterval: NodeJS.Timeout;

    const typeNextChar = () => {
      if (typingQueueRef.current.length > 0 && currentBotMessageIdRef.current) {
        isTypingRef.current = true;
        
        // Увеличиваем скорость: берем больше символов за раз
        const charCount = 5; 
        const nextChars = typingQueueRef.current.substring(0, charCount);
        typingQueueRef.current = typingQueueRef.current.substring(charCount);

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === currentBotMessageIdRef.current
              ? { ...msg, text: msg.text + nextChars }
              : msg
          )
        );
      } else {
        isTypingRef.current = false;
      }
    };

    // Уменьшаем интервал для большей скорости
    typingInterval = setInterval(typeNextChar, 10); 

    return () => clearInterval(typingInterval);
  }, []);

  // Функция для отправки запроса на webhook с поддержкой стриминга
  const sendToWebhook = async (userMessage: string) => {
    console.log("Отправка сообщения на webhook:", WEBHOOK_URL);
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

      console.log("Статус ответа:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("ReadableStream not supported in this browser.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      
      const botMessageId = Date.now() + 1;
      currentBotMessageIdRef.current = botMessageId;
      typingQueueRef.current = ""; // Очищаем очередь перед новым ответом
      
      let buffer = ""; 
      let hasReceivedContent = false; // Флаг, получали ли мы уже контент (для защиты от дублей)

      // Создаем пустое сообщение от бота
      setMessages((prev: Message[]) => [
        ...prev,
        {
          id: botMessageId,
          text: "",
          sender: "bot",
          timestamp: new Date(),
          isTyping: true
        },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        
        // Пытаемся найти полные JSON объекты в буфере
        let braceCount = 0;
        let startIndex = 0;
        let processedIndex = 0;

        for (let i = 0; i < buffer.length; i++) {
          if (buffer[i] === '{') {
            if (braceCount === 0) startIndex = i;
            braceCount++;
          } else if (buffer[i] === '}') {
            braceCount--;
            
            if (braceCount === 0) {
              const potentialJson = buffer.substring(startIndex, i + 1);
              try {
                const data = JSON.parse(potentialJson);
                
                if (data.type === 'item' && data.content) {
                   let newContent = "";
                   let isFinalOutput = false;

                   // Проверяем, является ли контент JSON-строкой с полем output (финальный ответ)
                   if (typeof data.content === 'string' && data.content.trim().startsWith('{') && data.content.trim().endsWith('}')) {
                       try {
                          const innerData = JSON.parse(data.content);
                          if (innerData.output) {
                              newContent = innerData.output; 
                              isFinalOutput = true;
                          }
                       } catch (e) {
                          newContent = data.content;
                       }
                    } else {
                       newContent = data.content;
                    }
                    
                    // Добавляем новый контент в очередь печати
                    if (newContent) {
                        // Если это финальный output и мы уже получали контент (стриминг), то игнорируем дубль
                        if (isFinalOutput && hasReceivedContent) {
                            console.log("Пропуск дублирующего финального ответа");
                        } else {
                            typingQueueRef.current += newContent;
                            hasReceivedContent = true;
                        }
                    }
                }
                processedIndex = i + 1;
              } catch (e) {
                console.log("Ошибка парсинга:", potentialJson);
              }
            }
          }
        }

        if (processedIndex > 0) {
          buffer = buffer.substring(processedIndex);
        }
      }
      
      console.log("Стриминг завершен");

    } catch (error) {
      console.error("Ошибка при отправке на webhook:", error);
      
      setMessages((prev: Message[]) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: language === "ru" 
            ? "Произошла ошибка при соединении с сервером. Пожалуйста, попробуйте позже." 
            : "Сервермен байланысу кезінде қате орын алды. Кейінірек қайталап көріңіз.",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev: Message[]) => [...prev, userMessage]);
    const messageToSend = inputValue;
    setInputValue("");
    setIsLoading(true);

    await sendToWebhook(messageToSend);
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
                  <p className="text-sm whitespace-pre-line">
                    {message.text}
                    {/* Курсор для эффекта печати (опционально) */}
                    {message.sender === 'bot' && message.id === currentBotMessageIdRef.current && typingQueueRef.current.length > 0 && (
                        <span className="inline-block w-1.5 h-4 ml-1 bg-blue-500 animate-pulse align-middle"></span>
                    )}
                  </p>
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
