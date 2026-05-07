import {
  Bot,
  FileSearch,
  Map,
  MessageCircleMore,
  PhoneCall,
  SendHorizontal,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';

type ChatRole = 'assistant' | 'user';

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  tone?: 'default' | 'accent';
};

type QuickAction = {
  label: string;
  prompt: string;
  icon: typeof FileSearch;
};

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: 'Tra cứu hồ sơ',
    prompt: 'Tôi muốn tra cứu hồ sơ trực tuyến thì bắt đầu từ đâu?',
    icon: FileSearch,
  },
  {
    label: 'Bản đồ số',
    prompt: 'Cho tôi biết cách truy cập bản đồ số của phường.',
    icon: Map,
  },
  {
    label: 'Tổng đài 1022',
    prompt: 'Tổng đài 1022 hỗ trợ những gì?',
    icon: PhoneCall,
  },
  {
    label: 'Thủ tục phổ biến',
    prompt: 'Các thủ tục trực tuyến phổ biến ở phường là gì?',
    icon: ShieldCheck,
  },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    tone: 'accent',
    content:
      'Chào bạn, tôi là trợ lý số của Phường Xuân Hòa. Tôi có thể hướng dẫn nhanh về thủ tục, tra cứu hồ sơ, bản đồ số và các đầu mối hỗ trợ.',
  },
  {
    id: 'hint',
    role: 'assistant',
    content:
      'Bạn có thể chọn một gợi ý nhanh bên dưới hoặc nhập câu hỏi để xem trước trải nghiệm tư vấn cho người dân.',
  },
];

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

function createAssistantReply(input: string) {
  const normalized = normalizeText(input);

  if (normalized.includes('1022') || normalized.includes('tong dai')) {
    return 'Tổng đài 1022 là kênh tiếp nhận phản ánh và hỗ trợ thông tin của TP.HCM. Ở bản tích hợp thật, tôi sẽ đặt CTA rõ để người dân biết khi nào nên liên hệ 1022 và khi nào nên làm việc trực tiếp với phường.';
  }

  if (normalized.includes('ban do') || normalized.includes('map')) {
    return 'Phần UI đã có shortcut Bản đồ số. Ở bước tích hợp sau, nút này có thể dẫn sang site bản đồ ngoài hoặc mở tab mới với lớp dữ liệu địa phương.';
  }

  if (
    normalized.includes('tra cuu') ||
    normalized.includes('ho so') ||
    normalized.includes('thutuc') ||
    normalized.includes('thu tuc')
  ) {
    return 'Luồng tư vấn phù hợp là: xác định nhóm thủ tục, dẫn người dân đến dịch vụ tương ứng, rồi gợi ý thêm tra cứu kết quả hồ sơ. Khi có backend, chatbot có thể trả link trực tiếp theo từng loại hồ sơ.';
  }

  if (normalized.includes('pdf') || normalized.includes('so tay') || normalized.includes('lanh dao')) {
    return 'Sổ tay số điện thoại lãnh đạo phường đang phù hợp dưới dạng shortcut PDF công khai. Trong bản chatbot thật, tôi có thể trả trực tiếp file PDF hoặc tóm tắt đầu mối liên hệ theo nhu cầu người dân.';
  }

  return 'Về UX, chatbot này đang là bản mô phỏng giao diện. Bước tiếp theo có thể là nối dữ liệu FAQ, luồng thủ tục và các link thực tế để tư vấn tự động cho người dân.';
}

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!scrollRef.current) {
      return;
    }

    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const quickActions = useMemo(() => QUICK_ACTIONS, []);

  const sendPrompt = (prompt: string) => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || isTyping) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmedPrompt,
    };

    setMessages((current) => [...current, userMessage]);
    setInputValue('');
    setIsTyping(true);

    timeoutRef.current = window.setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: createAssistantReply(trimmedPrompt),
      };

      setMessages((current) => [...current, assistantMessage]);
      setIsTyping(false);
    }, 520);
  };

  const submitMessage = () => {
    sendPrompt(inputValue);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            className="fixed bottom-24 right-3 z-[80] w-[min(420px,calc(100vw-24px))] md:bottom-26 md:right-5"
          >
            <div className="portal-card-shadow overflow-hidden rounded-[28px] border border-[#c8dce2] bg-[#f8fcfd]">
              <div className="relative overflow-hidden bg-[linear-gradient(135deg,#14808d_0%,#18507f_100%)] px-5 py-5 text-white">
                <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-white/12 blur-2xl" />

                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/18 bg-white/14">
                      <Bot className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/78">
                        Trợ lý số
                      </p>
                      <h3 className="mt-1 text-lg font-semibold leading-6">Tư vấn người dân</h3>
                      <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/12 px-2.5 py-1 text-[11px] font-medium text-white/86">
                        <span className="h-2 w-2 rounded-full bg-[#ffe089]" />
                        UI/UX Demo
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/16 bg-white/10 text-white/88 transition-colors hover:bg-white/18"
                    aria-label="Đóng chatbot"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="border-b border-[#dce8eb] bg-[#eef7f8] px-5 py-3">
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action) => {
                    const Icon = action.icon;

                    return (
                      <button
                        key={action.label}
                        type="button"
                        onClick={() => sendPrompt(action.prompt)}
                        className="inline-flex items-center gap-2 rounded-full border border-[#cfe0e4] bg-white px-3 py-2 text-xs font-semibold text-[#17526f] transition-colors hover:bg-[#f4fbfc]"
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {action.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div
                ref={scrollRef}
                className="max-h-[420px] min-h-[340px] space-y-4 overflow-y-auto bg-[linear-gradient(180deg,#f8fcfd_0%,#f1f8fa_100%)] px-5 py-5"
              >
                {messages.map((message) => {
                  const isAssistant = message.role === 'assistant';

                  return (
                    <div
                      key={message.id}
                      className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-[22px] px-4 py-3 text-sm leading-7 ${
                          isAssistant
                            ? message.tone === 'accent'
                              ? 'bg-[linear-gradient(135deg,#e7f7f9_0%,#d9f0f4_100%)] text-[#174558] ring-1 ring-[#cde4e8]'
                              : 'bg-white text-[#34505b] ring-1 ring-[#dbe9ec]'
                            : 'bg-[linear-gradient(135deg,#14808d_0%,#18507f_100%)] text-white'
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  );
                })}

                {isTyping ? (
                  <div className="flex justify-start">
                    <div className="inline-flex items-center gap-1 rounded-full bg-white px-4 py-3 ring-1 ring-[#dbe9ec]">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-[#5f96a3]" />
                      <span className="h-2 w-2 animate-pulse rounded-full bg-[#5f96a3] [animation-delay:120ms]" />
                      <span className="h-2 w-2 animate-pulse rounded-full bg-[#5f96a3] [animation-delay:240ms]" />
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="border-t border-[#dce8eb] bg-white px-4 py-4">
                <div className="flex items-end gap-3">
                  <div className="min-w-0 flex-1 rounded-[22px] border border-[#d9e8ea] bg-[#f8fcfd] px-4 py-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(event) => setInputValue(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          submitMessage();
                        }
                      }}
                      placeholder="Nhập câu hỏi để mô phỏng tư vấn..."
                      className="w-full border-0 bg-transparent text-sm text-[#234654] outline-none placeholder:text-[#7a98a1]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={submitMessage}
                    disabled={!inputValue.trim() || isTyping}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#14808d] text-white transition-colors hover:bg-[#18507f] disabled:cursor-not-allowed disabled:opacity-55"
                    aria-label="Gửi tin nhắn"
                  >
                    <SendHorizontal className="h-5 w-5" />
                  </button>
                </div>

                <p className="mt-3 text-[11px] leading-5 text-[#73909a]">
                  Đây là bản UI/UX mô phỏng. Bước sau có thể nối FAQ, quy trình thủ tục và AI backend để trả lời thực tế.
                </p>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
        className="fixed bottom-3 right-3 z-[79] md:bottom-5 md:right-5"
      >
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="portal-card-shadow group flex items-center gap-3 rounded-full border border-[#b8d8df] bg-[linear-gradient(135deg,#1aa3b0_0%,#18507f_100%)] px-4 py-3 text-left text-white transition-transform duration-200 hover:-translate-y-0.5"
          aria-label="Mở chatbot tư vấn người dân"
        >
          <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white/14 ring-1 ring-white/18">
            <MessageCircleMore className="h-6 w-6" />
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ffe089] px-1 text-[10px] font-bold text-[#0f4e69]">
              AI
            </span>
          </span>

          <span className="hidden min-w-0 md:block">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-white/75">
              Hỗ trợ trực tuyến
            </span>
            <span className="mt-1 flex items-center gap-2 text-sm font-semibold leading-5">
              Chatbot tư vấn người dân
              <Sparkles className="h-4 w-4 text-[#ffe089]" />
            </span>
          </span>
        </button>
      </motion.div>
    </>
  );
}
