/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Droplets, 
  Wrench, 
  ShieldCheck, 
  LayoutDashboard, 
  Phone, 
  Camera, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  User, 
  LogOut,
  ChevronRight,
  Clock,
  CreditCard,
  Building2,
  TrendingUp,
  Award,
  MessageSquare,
  Send,
  X,
  Settings,
  HelpCircle,
  Info,
  CreditCard as CardIcon,
  Menu,
  Grid,
  Coins,
  Wind,
  Waves,
  Hammer,
  Thermometer,
  Bath,
  Zap,
  Snowflake,
  Flame,
  Truck,
  Stethoscope
} from 'lucide-react';
import { api } from './services/api';
import { diagnosePlumbingIssueAI, getChatResponseAI } from './services/aiService';
import { User as UserType, DiagnosisResult, ServiceRequest } from './types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const DALSU_LOGO = "https://yt3.googleusercontent.com/s1xgTpfJ_9xtxNg4Udq8De8gkZoz49Fsfj2OWs4c2MmM7GiiCDvDthKelr5PWTznC4OZtUjoFw=s160-c-k-c0x00ffffff-no-rj";

// --- Components ---

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 2500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#002B5B] z-[100] flex flex-col items-center justify-center text-white"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 260,
          damping: 20,
          duration: 0.8
        }}
        className="relative mb-8"
      >
        <div className="w-48 h-48 bg-white rounded-full p-4 shadow-2xl flex items-center justify-center overflow-hidden border-4 border-[#FFD700]">
          <img src={DALSU_LOGO} alt="달수 로고" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
        </div>
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-4 border-2 border-dashed border-[#FFD700]/30 rounded-full"
        />
      </motion.div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center"
      >
        <h1 className="text-4xl font-black tracking-tighter text-[#FFD700] mb-3 drop-shadow-[0_4px_15px_rgba(255,215,0,0.4)]">
          달수배관케어
        </h1>
        <div className="flex flex-col items-center">
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-[#FFD700]/50 to-transparent mb-2" />
          <p className="text-white font-black text-[11px] tracking-[0.6em] uppercase leading-none">
            우리집 배관주치의
          </p>
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-[#FFD700]/50 to-transparent mt-3" />
        </div>
      </motion.div>

      <div className="absolute bottom-12 flex flex-col items-center gap-4">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{ 
                duration: 1, 
                repeat: Infinity, 
                delay: i * 0.2 
              }}
              className="w-2 h-2 bg-[#FFD700] rounded-full"
            />
          ))}
        </div>
        <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase">Loading Services...</span>
      </div>
    </motion.div>
  );
};

const DiagnosisLoadingScreen = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#002B5B]/95 z-[100] flex flex-col items-center justify-center text-white backdrop-blur-sm"
    >
      <motion.div
        animate={{ 
          scale: [1, 1.05, 1],
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative mb-8"
      >
        <div className="w-40 h-40 bg-white rounded-full p-4 shadow-2xl flex items-center justify-center overflow-hidden border-4 border-[#FFD700]">
          <img src={DALSU_LOGO} alt="달수 로고" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
        </div>
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-4 border-4 border-t-[#FFD700] border-r-transparent border-b-transparent border-l-transparent rounded-full"
        />
      </motion.div>
      
      <div className="text-center px-6">
        <h2 className="text-2xl font-black text-[#FFD700] mb-2">AI 마스터가 진단 중입니다</h2>
        <p className="text-white/70 text-sm font-medium">잠시만 기다려주세요. 사진과 증상을 분석하여<br/>최적의 해결책을 찾고 있습니다.</p>
      </div>

      <div className="mt-12 flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [0, -10, 0],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{ 
              duration: 0.6, 
              repeat: Infinity, 
              delay: i * 0.1 
            }}
            className="w-3 h-3 bg-[#FFD700] rounded-full"
          />
        ))}
      </div>
    </motion.div>
  );
};

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: '안녕하세요! 달수 AI 상담원입니다. 배관 문제나 서비스에 대해 궁금한 점이 있으신가요?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const response = await getChatResponseAI(userMsg);
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: '죄송합니다. 오류가 발생했습니다.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-[#002B5B] text-white rounded-full shadow-2xl flex items-center justify-center z-40 hover:scale-110 transition-transform active:scale-95"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-24 right-6 w-[calc(100vw-48px)] max-w-sm h-[500px] bg-white rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-100"
          >
            <div className="bg-[#002B5B] p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full p-1 overflow-hidden border-2 border-[#FFD700]">
                  <img src={DALSU_LOGO} alt="달수" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">달수 마스터</h4>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-[10px] text-white/60">실시간 상담 중</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className="flex gap-2 max-w-[85%]">
                    {m.role === 'ai' && (
                      <div className="w-8 h-8 bg-white rounded-full p-1 flex-shrink-0 border border-gray-200 overflow-hidden">
                        <img src={DALSU_LOGO} alt="달수" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                      </div>
                    )}
                    <div className={`p-3 rounded-2xl text-sm shadow-sm ${
                      m.role === 'user' 
                        ? 'bg-[#002B5B] text-white rounded-tr-none' 
                        : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                    }`}>
                      {m.text}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-white rounded-full p-1 flex-shrink-0 border border-gray-200 overflow-hidden">
                      <img src={DALSU_LOGO} alt="달수" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
              <input 
                type="text" 
                placeholder="메시지를 입력하세요..."
                className="flex-1 px-4 py-2 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B5B]"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="p-2 bg-[#002B5B] text-white rounded-xl disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }: any) => {
  const variants: any = {
    primary: 'bg-[#002B5B] text-white hover:bg-[#001F42]',
    secondary: 'bg-[#FFD700] text-[#002B5B] hover:bg-[#E6C200]',
    outline: 'border-2 border-[#002B5B] text-[#002B5B] hover:bg-[#002B5B] hover:text-white',
    ghost: 'text-[#002B5B] hover:bg-gray-100'
  };
  return (
    <button 
      disabled={disabled}
      onClick={onClick} 
      className={`px-6 py-3 rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className = "", onClick }: any) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${className}`}
  >
    {children}
  </div>
);

const Badge = ({ type }: { type: string }) => {
  const configs: any = {
    'Certified': { bg: 'bg-blue-100', text: 'text-blue-700', icon: ShieldCheck, label: '인증 기사' },
    'Top Rated': { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Award, label: '우수 기사' },
    'Rapid Response': { bg: 'bg-green-100', text: 'text-green-700', icon: Clock, label: '빠른 출동' },
  };

  const config = configs[type] || { bg: 'bg-gray-100', text: 'text-gray-700', icon: Award, label: type };
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${config.bg} ${config.text}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

// --- Views ---

const LoginView = ({ onLogin }: { onLogin: (user: UserType) => void }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone) return;
    setLoading(true);
    try {
      const user = await api.login(phone);
      onLogin(user);
    } catch (e) {
      alert('로그인 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Event Banner at Top of Login */}
      <div className="w-full aspect-[16/6] bg-gradient-to-r from-red-600 to-pink-500 relative overflow-hidden">
        <div className="absolute inset-0 p-6 flex flex-col justify-center text-white z-10">
          <p className="text-sm font-bold mb-1">지금 어플 가입하면</p>
          <h3 className="text-2xl font-black mb-2">총 10,000P 지급!</h3>
          <p className="text-[10px] opacity-80">가입시 5,000P + 주문시 5,000P</p>
        </div>
        <div className="absolute right-4 bottom-4 w-24 h-24 bg-white/20 rounded-full blur-2xl" />
        <Award className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 rotate-12" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-[#002B5B] rounded-3xl shadow-lg">
              <Droplets className="w-12 h-12 text-[#FFD700]" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-[#002B5B] mb-2">달수 배관케어</h1>
          <p className="text-gray-500 mb-8">막힌 배관, 신뢰로 뚫습니다.</p>
          
          <Card className="p-8">
            <div className="space-y-4">
              <div className="text-left">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">휴대폰 번호</label>
                <input 
                  type="tel" 
                  placeholder="010-0000-0000"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#002B5B] outline-none transition-all"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <Button onClick={handleLogin} className="w-full" disabled={loading}>
                {loading ? '인증 중...' : '시작하기'}
              </Button>
              <p className="text-[10px] text-gray-400 mt-4">
                로그인 시 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

const CustomerDashboard = ({ user, onLogout, onLogin }: { user: UserType | null, onLogout: () => void, onLogin: (user: UserType) => void }) => {
  const [isSplash, setIsSplash] = useState(true);
  const [step, setStep] = useState<'home' | 'diagnosis' | 'result' | 'request' | 'history' | 'detail' | 'profile' | 'category' | 'price' | 'login' | 'membership' | 'payment' | 'address' | 'notification' | 'faq' | 'notice' | 'success'>('home');
  const [successType, setSuccessType] = useState<'auto' | 'quote'>('auto');
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [symptoms, setSymptoms] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [assignmentMethod, setAssignmentMethod] = useState<'auto' | 'quote'>('auto');
  const [userRequests, setUserRequests] = useState<ServiceRequest[]>([]);
  const [assignedTechnician, setAssignedTechnician] = useState<{name: string, rating: string, exp: string} | null>(null);

  const technicians = [
    { name: '김달수 마스터 (베테랑)', rating: '4.9', exp: '15년' },
    { name: '이철수 마스터 (전문가)', rating: '4.8', exp: '12년' },
    { name: '박지성 마스터 (마스터)', rating: '5.0', exp: '18년' },
    { name: '최강수 마스터 (고수)', rating: '4.7', exp: '10년' }
  ];
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loginPhone, setLoginPhone] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [loginRole, setLoginRole] = useState<'customer' | 'technician'>('customer');
  const [showCategoryDrawer, setShowCategoryDrawer] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const isGuest = !user;

  const categories = [
    { id: 'toilet', name: '변기막힘', icon: Bath, color: 'text-blue-500', bg: 'bg-blue-50', emoji: '🚽', price: '5만원~' },
    { id: 'sink', name: '싱크대막힘', icon: Droplets, color: 'text-orange-500', bg: 'bg-orange-50', emoji: '🚰', price: '7만원~' },
    { id: 'drain', name: '하수구막힘', icon: ShieldCheck, color: 'text-indigo-500', bg: 'bg-indigo-50', emoji: '🕳️', price: '7만원~' },
    { id: 'bath', name: '세면대/욕조', icon: Bath, color: 'text-sky-500', bg: 'bg-sky-50', emoji: '🛁', price: '5만~' },
    { id: 'urinal', name: '소변기막힘', icon: Waves, color: 'text-cyan-500', bg: 'bg-cyan-50', emoji: '🚻', price: '5만~' },
    { id: 'leak', name: '고압/누수', icon: Zap, color: 'text-red-500', bg: 'bg-red-50', emoji: '🌊', price: '현장견적' },
    { id: 'pipe', name: '수도관세척', icon: Wrench, color: 'text-emerald-500', bg: 'bg-emerald-50', emoji: '🚿' },
    { id: 'heating', name: '난방배관', icon: Thermometer, color: 'text-rose-500', bg: 'bg-rose-50', emoji: '🔥' },
    { id: 'odor', name: '냄새제거', icon: Wind, color: 'text-purple-500', bg: 'bg-purple-50', emoji: '👃' },
    { id: 'boiler_repair', name: '보일러수리', icon: Flame, color: 'text-orange-600', bg: 'bg-orange-50', emoji: '♨️' },
    { id: 'aircon_repair', name: '에어컨수리', icon: Wind, color: 'text-blue-600', bg: 'bg-blue-50', emoji: '🛠️' },
    { id: 'fridge_repair', name: '냉장고수리', icon: Snowflake, color: 'text-cyan-600', bg: 'bg-cyan-50', emoji: '🧊' },
    { id: 'washer_repair', name: '세탁기수리', icon: Waves, color: 'text-indigo-600', bg: 'bg-indigo-50', emoji: '🧺' },
    { id: 'aircon', name: '에어컨청소', icon: Wind, color: 'text-teal-500', bg: 'bg-teal-50', emoji: '❄️' },
    { id: 'parts', name: '부품교체', icon: Hammer, color: 'text-amber-500', bg: 'bg-amber-50', emoji: '🛠️' },
    { id: 'slip', name: '미끄럼방지', icon: Grid, color: 'text-gray-500', bg: 'bg-gray-50', emoji: '🦶' },
  ];

  useEffect(() => {
    if (step === 'history' && !isGuest) {
      loadHistory();
    } else if (step === 'history' && isGuest) {
      setStep('login');
    }
  }, [step, isGuest]);

  const handleAdminLogin = async () => {
    if (adminCode === '1001') {
      setLoading(true);
      try {
        const loggedInUser = await api.login('010-0000-0000', 'admin');
        onLogin(loggedInUser);
        setStep('home');
        setShowAdminModal(false);
        setAdminCode('');
      } catch (e) {
        alert('관리자 로그인 실패');
      } finally {
        setLoading(false);
      }
    } else {
      alert('관리자 코드가 일치하지 않습니다.');
    }
  };

  const handleQuickLogin = async () => {
    if (!loginPhone) return;
    setLoading(true);
    try {
      const loggedInUser = await api.login(loginPhone, loginRole);
      onLogin(loggedInUser);
      setStep('home');
    } catch (e) {
      alert('로그인 실패');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    if (!user) return;
    setLoading(true);
    const data = await api.getUserRequests(user.id);
    setUserRequests(data);
    setLoading(false);
  };

  const loadQuotes = async (req: ServiceRequest) => {
    setSelectedRequest(req);
    setLoading(true);
    const data = await api.getRequestQuotes(req.id);
    setQuotes(data);
    setLoading(false);
    setStep('detail');
  };

  const handleStartDiagnosis = (catId: string) => {
    if (isGuest) {
      setSelectedCategory(catId);
      setStep('login');
      return;
    }
    setSelectedCategory(catId);
    setStep('diagnosis');
    setShowCategoryDrawer(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      alert(`${file.name} 파일이 선택되었습니다.`);
    }
  };

  const runDiagnosis = async () => {
    if (!selectedCategory || !symptoms || !uploadedFile) {
      alert('증상 설명과 사진을 모두 등록해주세요.');
      return;
    }
    
    setLoading(true);
    console.log("Starting diagnosis process...");
    
    try {
      // Ensure loading screen is visible
      const aiPromise = diagnosePlumbingIssueAI(symptoms, selectedCategory, uploadedFile);
      const delayPromise = new Promise(resolve => setTimeout(resolve, 1500));
      
      const [aiResult] = await Promise.all([aiPromise, delayPromise]);
      
      console.log("AI Analysis complete, saving to server...");
      
      const savedResult = await api.saveDiagnosis({
        userId: user?.id || 0, // Handle guest if needed, though login is required
        category: selectedCategory,
        result: aiResult
      });
      
      setDiagnosis(savedResult);
      setStep('result');
      console.log("Diagnosis flow complete.");
    } catch (error) {
      console.error("Diagnosis failed:", error);
      alert('진단 중 오류가 발생했습니다. 네트워크 연결을 확인하고 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      <AnimatePresence>
        {isSplash && <SplashScreen onFinish={() => setIsSplash(false)} />}
        {step === 'diagnosis' && loading && <DiagnosisLoadingScreen />}
      </AnimatePresence>

      <AnimatePresence>
        {showAdminModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-xs rounded-[32px] overflow-hidden shadow-2xl"
            >
              <div className="bg-[#002B5B] p-6 text-center text-white">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="w-6 h-6 text-[#FFD700]" />
                </div>
                <h4 className="font-black text-lg">관리자 인증</h4>
                <p className="text-xs text-white/60 mt-1">보안 코드를 입력해주세요</p>
              </div>
              <div className="p-6 space-y-4">
                <input 
                  type="password" 
                  placeholder="CODE"
                  maxLength={4}
                  className="w-full text-center text-2xl font-black tracking-[1em] py-4 bg-gray-50 rounded-2xl border-2 border-gray-100 focus:border-[#002B5B] outline-none transition-all"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                />
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setShowAdminModal(false); setAdminCode(''); }}
                    className="flex-1 py-3 bg-gray-100 rounded-xl text-sm font-bold text-gray-500"
                  >
                    취소
                  </button>
                  <button 
                    onClick={handleAdminLogin}
                    className="flex-1 py-3 bg-[#002B5B] rounded-xl text-sm font-bold text-white shadow-lg shadow-blue-900/20"
                  >
                    확인
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header - Dalsu Premium Branding */}
      <header className="bg-gradient-to-b from-[#002B5B] to-[#001F42] text-white sticky top-0 z-30 shadow-lg border-b border-white/5">
        <div className="px-4 pt-4 pb-3">
          <div className="grid grid-cols-[44px_1fr_44px] items-center">
            {/* Left Logo */}
            <div 
              onClick={() => setStep('home')}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-white overflow-hidden border-2 border-[#FFD700] cursor-pointer shadow-sm active:scale-95 transition-transform"
            >
              <img src={DALSU_LOGO} alt="달수" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            
            {/* Center Branding */}
            <div className="flex flex-col items-center text-center">
              <h1 className="text-[22px] font-black tracking-tighter text-[#FFD700] leading-none mb-1.5 drop-shadow-sm">
                달수배관케어 <span className="text-white">마스터</span>
              </h1>
              <div className="bg-[#FFD700]/10 px-3 py-0.5 rounded-full border border-[#FFD700]/20 backdrop-blur-md">
                <span className="text-[10px] font-black text-[#FFD700] tracking-tight uppercase">막힌배관 신뢰로 뚫습니다</span>
              </div>
            </div>

            {/* Right Profile/Login */}
            <div 
              className="flex flex-col items-center justify-center w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer justify-self-end" 
              onClick={() => setStep('profile')}
            >
              <User className="w-5 h-5 text-[#FFD700]" />
              <span className="text-[7px] font-black text-[#FFD700] mt-0.5 uppercase">{user ? 'MY' : 'LOGIN'}</span>
            </div>
          </div>
        </div>
        
        {/* Emergency Status Bar */}
        <div className="flex items-center justify-center gap-2 bg-[#FFD700] px-4 py-1.5 shadow-inner">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Zap className="w-3.5 h-3.5 text-[#002B5B] fill-[#002B5B]" />
          </motion.div>
          <span className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
            <span className="text-[#002B5B]">전국 24시</span>
            <span className="w-1 h-1 rounded-full bg-[#002B5B]/20" />
            <span className="text-[#D91E18]">20분 긴급출동 대기중</span>
          </span>
        </div>
      </header>

      <main className="max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {step === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col"
            >
              {/* AI Hero Section - Perfectly Symmetrical Design */}
              <div className="px-5 py-4">
                <Card 
                  className="bg-gradient-to-br from-[#002B5B] via-[#003366] to-[#002B5B] rounded-[28px] p-7 text-white relative overflow-hidden cursor-pointer shadow-2xl border-none group"
                  onClick={() => handleStartDiagnosis('sink')}
                >
                  <div className="relative z-10 flex flex-col items-center text-center">
                    {/* Centered Badge */}
                    <div className="inline-flex items-center gap-2 mb-4 bg-[#FFD700] px-4 py-1 rounded-full shadow-lg">
                      <Zap className="w-3.5 h-3.5 text-[#002B5B] fill-[#002B5B]" />
                      <span className="text-[10px] font-black text-[#002B5B] uppercase tracking-tighter">AI 무료 진단 서비스</span>
                    </div>
                    
                    {/* Centered Heading */}
                    <h3 className="text-[30px] font-black mb-2 leading-[1.1] tracking-tight">
                      막힌 배관, <br/>
                      <span className="text-[#FFD700]">AI로 3초만에</span> 해결!
                    </h3>
                    
                    {/* Centered Description */}
                    <p className="text-white/80 text-sm mb-7 leading-relaxed font-medium max-w-[240px]">
                      사진 한 장으로 원인 파악부터 <br/>
                      예상 비용까지 즉시 확인하세요
                    </p>
                    
                    {/* Centered Action Button */}
                    <div className="w-full bg-white text-[#002B5B] py-4 rounded-2xl font-black text-lg shadow-xl flex items-center justify-center gap-2 group-hover:bg-[#FFD700] transition-all duration-300 active:scale-[0.98]">
                      무료 진단 시작하기
                      <ChevronRight className="w-6 h-6" />
                    </div>
                  </div>
                  
                  {/* Symmetrical Decorative Background Glows */}
                  <div className="absolute -left-10 -top-10 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl" />
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl" />
                </Card>
              </div>

              {/* Service Selection Header */}
              <div className="p-6 flex flex-col items-center">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#00AEEF] rounded-full flex items-center justify-center">
                    <Droplets className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-800">원하시는 서비스를 선택하세요.</h4>
                </div>

                {/* Direct Call Button */}
                <button 
                  onClick={() => window.location.href = 'tel:1577-1197'}
                  className="w-full max-w-xs bg-[#3B82F6] text-white py-3 rounded-full flex items-center justify-center gap-2 shadow-lg hover:bg-blue-600 transition-colors mb-8"
                >
                  <Phone className="w-5 h-5 fill-current" />
                  <span className="text-lg font-bold">직접전화 (1577-1197)</span>
                </button>

                {/* Categories Grid - Clean & Modern Design */}
                <div className="w-full px-2 py-4">
                  <div className="grid grid-cols-4 gap-x-2 gap-y-8 w-full">
                    {categories.map((cat, idx) => (
                      <motion.div 
                        key={cat.id} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="flex flex-col items-center gap-2 cursor-pointer group"
                        onClick={() => handleStartDiagnosis(cat.id)}
                      >
                        <div className="relative">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-sm group-hover:shadow-md group-hover:-translate-y-1 ${cat.bg} border border-white relative z-10`}>
                            <span className="text-3xl group-hover:scale-110 transition-transform">{cat.emoji}</span>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-gray-700 text-center leading-tight break-keep group-hover:text-[#002B5B] transition-colors">
                          {cat.name}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Subscription Banner */}
              <div className="px-6 pb-8">
                <Card 
                  className="bg-yellow-50 border-yellow-100 p-4 flex items-center justify-between cursor-pointer hover:bg-yellow-100 transition-colors"
                  onClick={() => setStep('membership')}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-400 rounded-lg">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[#002B5B]">달수 멤버십 구독</h4>
                      <p className="text-[10px] text-gray-600">월 29,900원으로 우리 집 배관 주치의 등록</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#002B5B]" />
                </Card>
              </div>
            </motion.div>
          )}

          {step === 'diagnosis' && (
            <motion.div 
              key="diagnosis"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <button onClick={() => setStep('home')} className="text-sm text-gray-500 flex items-center gap-1">
                  <ChevronRight className="w-4 h-4 rotate-180" /> 돌아가기
                </button>
                <button 
                  onClick={() => setShowCategoryDrawer(true)}
                  className="text-xs font-bold text-[#00AEEF] bg-blue-50 px-3 py-1.5 rounded-full flex items-center gap-1"
                >
                  <Grid className="w-3 h-3" /> 서비스 변경
                </button>
              </div>

              <div className="text-center relative">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-20 h-20 opacity-10 pointer-events-none">
                  <img src={DALSU_LOGO} alt="" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </div>
                <span className="text-4xl mb-2 block relative z-10">
                  {categories.find(c => c.id === selectedCategory)?.emoji}
                </span>
                <h3 className="text-2xl font-bold text-[#002B5B] relative z-10">
                  {categories.find(c => c.id === selectedCategory)?.name || 'AI 자가진단'}
                </h3>
              </div>

              <Card className="p-6 space-y-6">
                <div>
                  <label className="text-sm font-bold text-gray-600 mb-2 block">증상을 설명해주세요</label>
                  <textarea 
                    className="w-full p-4 rounded-xl border border-gray-200 h-32 outline-none focus:ring-2 focus:ring-[#002B5B] text-sm"
                    placeholder="예: 싱크대 물이 안 내려가고 냄새가 나요."
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-bold text-gray-600 mb-2 block">현장 사진/영상 (필수)</label>
                  <label className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors block relative">
                    <input 
                      type="file" 
                      accept="image/*,video/*" 
                      className="hidden" 
                      onChange={handleFileUpload}
                    />
                    {uploadedFile ? (
                      <div className="flex flex-col items-center">
                        <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
                        <p className="text-sm font-bold text-gray-700">{uploadedFile.name}</p>
                        <p className="text-xs text-gray-400 mt-1">파일이 준비되었습니다.</p>
                      </div>
                    ) : (
                      <>
                        <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 font-medium">사진 또는 영상 업로드</p>
                        <p className="text-[10px] text-gray-400 mt-1">정확한 진단을 위해 꼭 필요합니다.</p>
                      </>
                    )}
                  </label>
                </div>

                <Button 
                  onClick={runDiagnosis} 
                  className="w-full py-4 text-lg"
                  disabled={!symptoms || !uploadedFile}
                >
                  AI 진단 시작하기
                </Button>
              </Card>

              {/* Category Selection Drawer (Overlay) */}
              <AnimatePresence>
                {showCategoryDrawer && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowCategoryDrawer(false)}
                      className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
                    />
                    <motion.div 
                      initial={{ y: '100%' }}
                      animate={{ y: 0 }}
                      exit={{ y: '100%' }}
                      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                      className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] z-[70] p-6 max-h-[80vh] overflow-y-auto"
                    >
                      <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
                      <h4 className="text-xl font-bold text-[#002B5B] mb-6 text-center">진단받을 서비스를 선택하세요</h4>
                      <div className="grid grid-cols-3 gap-4">
                        {categories.map((cat) => (
                          <div 
                            key={cat.id}
                            onClick={() => handleStartDiagnosis(cat.id)}
                            className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${
                              selectedCategory === cat.id ? 'bg-blue-50 ring-2 ring-[#00AEEF]' : 'bg-gray-50'
                            }`}
                          >
                            <span className="text-3xl">{cat.emoji}</span>
                            <span className="text-[10px] font-bold text-gray-700">{cat.name}</span>
                          </div>
                        ))}
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full mt-8"
                        onClick={() => setShowCategoryDrawer(false)}
                      >
                        닫기
                      </Button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {step === 'result' && diagnosis && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="flex flex-col items-center text-center mb-4">
                <div className="w-24 h-24 bg-white rounded-full p-2 shadow-xl border-4 border-[#FFD700] mb-4 overflow-hidden flex items-center justify-center">
                  <img src={DALSU_LOGO} alt="달수" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </div>
                <h3 className="text-2xl font-black text-[#002B5B]">달수 AI 진단 리포트</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Dalsu AI Master Analysis</p>
              </div>

              <Card className="p-6 space-y-6 relative overflow-hidden">
                <div className="absolute -right-8 -top-8 w-32 h-32 opacity-[0.03] pointer-events-none">
                  <img src={DALSU_LOGO} alt="" className="w-full h-full object-contain grayscale" referrerPolicy="no-referrer" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-400">긴급도</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    diagnosis.urgencyLevel === 'CRITICAL' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                  }`}>
                    {diagnosis.urgencyLevel}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-400 mb-3">예상 원인 확률</h4>
                  <div className="space-y-3">
                    {diagnosis.possibleCauses.map((c, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-gray-700">{c.cause}</span>
                          <span className="font-bold text-[#002B5B]">{c.probability}%</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${c.probability}%` }}
                            className="bg-[#002B5B] h-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl">
                  <h4 className="text-sm font-bold text-blue-800 mb-1">예상 비용 범위</h4>
                  <p className="text-xl font-bold text-blue-900">
                    {diagnosis.estimatedPriceRange.min.toLocaleString()} ~ {diagnosis.estimatedPriceRange.max.toLocaleString()}원
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-gray-400">전문가 조언</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">{diagnosis.advice}</p>
                </div>

                <div className="pt-4 border-t border-gray-100 flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setStep('home')}>취소</Button>
                  <Button className="flex-1" onClick={() => setStep('request')}>서비스 신청</Button>
                </div>
              </Card>
            </motion.div>
          )}

          {step === 'request' && (
            <motion.div 
              key="request"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h3 className="text-2xl font-bold text-[#002B5B]">서비스 예약</h3>
              <Card className="p-6 space-y-6">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <MapPin className="text-[#002B5B]" />
                  <div>
                    <p className="text-xs text-gray-400">방문 주소</p>
                    <p className="text-sm font-bold">서울시 마포구 독막로 123 (상수동)</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-bold text-gray-600 mb-3">배정 방식 선택</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div 
                      onClick={() => setAssignmentMethod('auto')}
                      className={`p-4 border-2 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                        assignmentMethod === 'auto' ? 'border-[#002B5B] bg-blue-50' : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div>
                        <p className={`font-bold ${assignmentMethod === 'auto' ? 'text-[#002B5B]' : 'text-gray-700'}`}>자동 배정 (추천)</p>
                        <p className={`text-xs ${assignmentMethod === 'auto' ? 'text-blue-700' : 'text-gray-500'}`}>가장 가까운 인증 기사님 즉시 배정</p>
                      </div>
                      {assignmentMethod === 'auto' && <CheckCircle2 className="text-[#002B5B]" />}
                    </div>
                    <div 
                      onClick={() => setAssignmentMethod('quote')}
                      className={`p-4 border-2 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                        assignmentMethod === 'quote' ? 'border-[#002B5B] bg-blue-50' : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div>
                        <p className={`font-bold ${assignmentMethod === 'quote' ? 'text-[#002B5B]' : 'text-gray-700'}`}>견적 비교</p>
                        <p className={`text-xs ${assignmentMethod === 'quote' ? 'text-blue-700' : 'text-gray-500'}`}>여러 기사님의 견적을 받아보고 선택</p>
                      </div>
                      {assignmentMethod === 'quote' && <CheckCircle2 className="text-[#002B5B]" />}
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full py-4 text-lg" 
                  disabled={loading}
                  onClick={async () => {
                    console.log("Confirm button clicked", { isGuest, user, selectedCategory, assignmentMethod });
                    if (isGuest || !user) {
                      setStep('login');
                      return;
                    }
                    
                    setLoading(true);
                    try {
                      console.log("Attempting to create request...", {
                        user_id: user.id,
                        category: selectedCategory,
                        assignmentMethod
                      });
                      
                      const result = await api.createRequest({
                        user_id: user.id,
                        category: categories.find(c => c.id === selectedCategory)?.name || '기타',
                        location: '서울시 마포구 독막로 123 (상수동)',
                        urgency: diagnosis?.urgencyLevel || 'MEDIUM',
                        diagnosis_id: diagnosis?.id
                      });
                      
                      console.log("Request created successfully, result:", result);
                      
                      // Automatic SMS delivery to manager (01044993866)
                      try {
                        const categoryName = categories.find(c => c.id === selectedCategory)?.name || '기타';
                        const smsMessage = `[달수배관케어] 신규 예약 신청\n카테고리: ${categoryName}\n위치: 서울시 마포구 독막로 123 (상수동)\n긴급도: ${diagnosis?.urgencyLevel || 'MEDIUM'}\n증상: ${symptoms}\n고객연락처: ${user.phone}`;
                        await api.sendSMS('01044993866', smsMessage);
                        console.log("Automatic SMS sent to manager");
                      } catch (smsError) {
                        console.error("Failed to send automatic SMS:", smsError);
                      }
                      
                      // Pick a random technician for display
                      const randomTech = technicians[Math.floor(Math.random() * technicians.length)];
                      setAssignedTechnician(randomTech);
                      
                      setSuccessType(assignmentMethod);
                      setStep('success');
                      console.log("Step changed to success");
                    } catch (error: any) {
                      console.error("Detailed error in reservation:", error);
                      alert(`예약 처리 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  {loading ? '처리 중...' : '예약 확정하기'}
                </Button>
              </Card>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center min-h-[70vh] text-center"
            >
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-2xl font-black text-[#002B5B] mb-2">예약이 확정되었습니다!</h3>
              <p className="text-gray-500 mb-8 px-6">
                {successType === 'auto' 
                  ? '가장 가까운 전문 기사님께 고객님의 정보가 전달되었습니다. 잠시 후 기사님이 직접 연락드릴 예정입니다.' 
                  : '견적 요청이 성공적으로 전송되었습니다. 기사님들이 견적을 보내면 알림으로 알려드릴게요.'}
              </p>

              {successType === 'auto' && (
                <Card className="w-full p-6 mb-8 bg-blue-50 border-blue-100">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                      <User className="w-8 h-8 text-[#002B5B]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">배정된 마스터</p>
                      <h4 className="text-lg font-bold text-[#002B5B]">{assignedTechnician?.name || '김달수 마스터 (베테랑)'}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-white px-2 py-0.5 rounded text-gray-600 font-medium">평점 {assignedTechnician?.rating || '4.9'}</span>
                        <span className="text-xs bg-white px-2 py-0.5 rounded text-gray-600 font-medium">경력 {assignedTechnician?.exp || '15년'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <Button variant="outline" className="bg-white" onClick={() => window.location.href = 'tel:01044993866'}>
                      <Phone className="w-4 h-4 mr-2" /> 전화하기
                    </Button>
                    <Button variant="outline" className="bg-white" onClick={() => window.location.href = 'sms:01044993866'}>
                      <MessageSquare className="w-4 h-4 mr-2" /> 메시지
                    </Button>
                  </div>
                </Card>
              )}

              <div className="w-full space-y-3">
                <Button className="w-full py-4" onClick={() => setStep('history')}>
                  이용 내역 확인하기
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => setStep('home')}>
                  홈으로 돌아가기
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'history' && (
            <motion.div 
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h3 className="text-2xl font-bold text-[#002B5B]">이용 내역</h3>
              {loading ? (
                <div className="text-center py-12 text-gray-400">내역을 불러오는 중...</div>
              ) : userRequests.length === 0 ? (
                <div className="text-center py-12 text-gray-400">이용 내역이 없습니다.</div>
              ) : (
                <div className="space-y-4">
                  {userRequests.map((req) => (
                    <Card key={req.id} className="p-5 cursor-pointer hover:border-[#002B5B] transition-all" onClick={() => loadQuotes(req)}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-gray-400">{new Date(req.created_at).toLocaleDateString()}</span>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                          req.status === 'PENDING' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                        }`}>
                          {req.status === 'PENDING' ? '견적 대기 중' : req.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-lg">{req.category}</h4>
                      <p className="text-sm text-gray-500 mt-1">{req.location}</p>
                      <div className="mt-4 flex items-center text-[#002B5B] text-sm font-bold">
                        상세 보기 <ChevronRight className="w-4 h-4" />
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {step === 'detail' && selectedRequest && (
            <motion.div 
              key="detail"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <button onClick={() => setStep('history')} className="text-sm text-gray-500 flex items-center gap-1">
                <ChevronRight className="w-4 h-4 rotate-180" /> 목록으로
              </button>
              <h3 className="text-2xl font-bold text-[#002B5B]">요청 상세 정보</h3>
              
              <Card className="p-6 bg-[#002B5B] text-white">
                <p className="text-xs text-white/60 mb-1">서비스 항목</p>
                <h4 className="text-xl font-bold mb-4">{selectedRequest.category}</h4>
                <div className="flex gap-4 text-sm">
                  <div>
                    <p className="text-white/60">요청일</p>
                    <p>{new Date(selectedRequest.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-white/60">긴급도</p>
                    <p>{selectedRequest.urgency}</p>
                  </div>
                </div>
              </Card>

              <div>
                <h4 className="font-bold text-gray-800 mb-4">도착한 견적 ({quotes.length})</h4>
                {loading ? (
                  <div className="text-center py-8 text-gray-400">견적 확인 중...</div>
                ) : quotes.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl border border-dashed border-gray-200 text-center">
                    <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">기사님들이 견적을 작성 중입니다.<br/>잠시만 기다려주세요.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {quotes.map((q) => (
                      <Card key={q.id} className="p-5">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                              <User className="text-gray-400" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold">{q.technician_name}</span>
                                <div className="flex items-center gap-0.5 text-yellow-500 text-xs">
                                  <Award className="w-3 h-3 fill-current" />
                                  <span>{q.rating}</span>
                                </div>
                              </div>
                              <div className="flex gap-1 mt-1">
                                {q.badges.map((b: string) => <Badge key={b} type={b} />)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-400">예상 비용</p>
                            <p className="text-lg font-bold text-[#002B5B]">{q.price_min.toLocaleString()}원~</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl mb-4">
                          "{q.notes || '정직하고 꼼꼼하게 작업해드리겠습니다.'}"
                        </p>
                        <Button className="w-full py-2" onClick={() => {
                          setSuccessType('auto'); // Treat as auto since a technician is now assigned
                          setStep('success');
                        }}>이 기사님 선택하기</Button>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === 'profile' && (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h3 className="text-2xl font-bold text-[#002B5B]">마이페이지</h3>
              
              <Card className="p-6 flex items-center gap-4">
                <div className="w-16 h-16 bg-[#002B5B] rounded-full flex items-center justify-center text-white">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-[#002B5B]">{user ? `${user.name}님` : '게스트'}</h4>
                  <p className="text-sm text-gray-500">{user ? user.phone : '로그인이 필요합니다'}</p>
                </div>
              </Card>

              {user && (
                <Card className="p-4 bg-gradient-to-r from-[#002B5B] to-[#004080] text-white overflow-hidden relative">
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 rotate-12">
                    <img src={DALSU_LOGO} alt="" className="w-full h-full object-contain grayscale invert" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex justify-between items-center relative z-10">
                    <div>
                      <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">나의 멤버십</p>
                      <h4 className="text-lg font-black text-[#FFD700]">
                        {user.subscription ? (user.subscription.type === 'MONTHLY' ? '월간 멤버십 이용 중' : '연간 멤버십 이용 중') : '멤버십 미가입'}
                      </h4>
                      {user.subscription && (
                        <p className="text-[10px] text-white/40 mt-1">만료일: {new Date(user.subscription.end_date).toLocaleDateString()}</p>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      className="bg-white/10 border-white/20 text-white text-xs py-1.5 h-auto hover:bg-white/20"
                      onClick={() => setStep('membership')}
                    >
                      {user.subscription ? '관리' : '가입하기'}
                    </Button>
                  </div>
                </Card>
              )}

              {!user && (
                <Button className="w-full" onClick={() => setStep('login')}>로그인 / 회원가입</Button>
              )}

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-2">계정 설정</h4>
                <Card className="divide-y divide-gray-50">
                  <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setStep('payment')}>
                    <div className="flex items-center gap-3">
                      <CardIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-medium">결제 수단 관리</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                  <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setStep('address')}>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-medium">주소지 관리</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                  <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setStep('notification')}>
                    <div className="flex items-center gap-3">
                      <Settings className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-medium">알림 설정</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                </Card>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-2">고객 지원</h4>
                <Card className="divide-y divide-gray-50">
                  <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setStep('faq')}>
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-medium">자주 묻는 질문</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                  <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setStep('notice')}>
                    <div className="flex items-center gap-3">
                      <Info className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-medium">공지사항</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                </Card>
              </div>

              <Button variant="outline" className="w-full border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600" onClick={onLogout}>
                {user ? '로그아웃' : '초기화'}
              </Button>

              <div className="pt-8 border-t border-gray-100">
                <p className="text-[10px] text-gray-400 mb-2 text-center">기사님 또는 관리자이신가요?</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setLoginPhone('010-1111-1111'); setStep('login'); }}
                    className="flex-1 py-2 bg-gray-100 rounded-lg text-[10px] font-bold text-gray-600"
                  >
                    기사님 로그인
                  </button>
                  <button 
                    onClick={() => { setShowAdminModal(true); }}
                    className="flex-1 py-2 bg-gray-100 rounded-lg text-[10px] font-bold text-gray-600"
                  >
                    관리자 로그인
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'membership' && (
            <motion.div 
              key="membership"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="pb-20"
            >
              {/* [섹션1 - 히어로] */}
              <div className="relative h-[300px] -mx-6 mb-8 overflow-hidden">
                <div className="absolute inset-0 bg-[#002B5B]">
                  <img 
                    src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1000" 
                    className="w-full h-full object-cover opacity-30"
                    alt="배관 관리"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#002B5B]" />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                  <button onClick={() => setStep('home')} className="absolute top-6 left-6 text-white/80 flex items-center gap-1 text-sm">
                    <ChevronRight className="w-4 h-4 rotate-180" /> 홈으로
                  </button>
                  <div className="bg-[#FFD700] text-[#002B5B] text-[10px] font-black px-3 py-1 rounded-full mb-4 shadow-lg">
                    VIP 배관 주치의 서비스
                  </div>
                  <h2 className="text-xl font-black text-white leading-tight mb-3 break-keep">
                    갑자기 막힌 배관, 당황하지 마세요.<br/>
                    우리 집 전담 <span className="text-[#FFD700]">‘배관 주치의’</span>가 대기 중입니다.
                  </h2>
                  <p className="text-white/70 text-sm font-medium leading-relaxed">
                    월 29,900원으로 24시간 긴급출동부터 정기 점검까지.<br/>
                    배관 사고, 이제 ‘보험’보다 확실한 ‘관리’가 답입니다.
                  </p>
                </div>
              </div>

              <div className="space-y-10 px-2">
                {/* [섹션2 - 공감] */}
                <div className="text-center space-y-4">
                  <h3 className="text-xl font-bold text-[#002B5B]">"싱크대 역류, 변기 막힘...<br/>꼭 바쁜 아침이나 늦은 밤에 터지죠?"</h3>
                  <p className="text-gray-500 text-[13px] leading-relaxed break-keep">
                    배관은 집의 혈관입니다. 평소엔 모르다가 막히면 온 집안이 마비됩니다.<br/>
                    그때마다 업체 찾고, 부르는 게 값인 출장비에 속상하셨나요?<br/>
                    이제 달수배관케어가 우리 집 배관을 365일 책임집니다.
                  </p>
                </div>

                {/* [섹션3 - 비용 비교] */}
                <Card className="p-6 bg-gray-50 border-none">
                  <h4 className="text-center font-bold text-[#002B5B] mb-6">출장 한 번이면 5개월 치 본전입니다</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase">일반 업체 1회 출동</p>
                      <p className="text-lg font-black text-gray-400 line-through">150,000원~</p>
                      <p className="text-[10px] text-gray-400 mt-1">출장비 + 작업비 별도</p>
                    </div>
                    <div className="bg-[#002B5B] p-4 rounded-2xl shadow-xl border-2 border-[#FFD700]">
                      <p className="text-[10px] font-bold text-[#FFD700] mb-2 uppercase">달수 멤버십</p>
                      <p className="text-lg font-black text-white">월 29,900원</p>
                      <p className="text-[10px] text-white/60 mt-1">출장비 면제 + 작업비 할인</p>
                    </div>
                  </div>
                  <p className="text-center text-xs font-bold text-[#002B5B] mt-6">
                    "출장 한 번만 불러도 5개월 치 멤버십 비용이 빠집니다."
                  </p>
                </Card>

                {/* [섹션4 - 핵심 혜택 3가지 강조] */}
                <div className="space-y-4">
                  <h4 className="text-center font-black text-[#002B5B] text-lg">배관 주치의만의 3가지 약속</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { title: "무제한 출장비 0원", desc: "부르는 게 값인 출장비, 멤버십 회원은 언제나 0원입니다", icon: Truck },
                      { title: "연 4회 배관 건강검진", desc: "문제가 생기기 전, 전문의가 미리 찾아가 진단합니다", icon: Stethoscope },
                      { title: "30일 안심 보증", desc: "동일 증상 발생 시 책임지고 무상 재작업을 보장합니다", icon: CheckCircle2 }
                    ].map((benefit, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#002B5B]">
                          <benefit.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h5 className="font-bold text-sm text-[#002B5B]">{benefit.title}</h5>
                          <p className="text-xs text-gray-500">{benefit.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* [섹션5 - 가격 설득] */}
                <div className="text-center py-8 bg-gradient-to-b from-white to-gray-50 rounded-[32px]">
                  <p className="text-sm text-gray-500 mb-2">하루 990원. 커피 한 잔 값도 안 되는 비용으로</p>
                  <h3 className="text-2xl font-black text-[#002B5B] mb-6">
                    갑작스러운 침수 사고와<br/>
                    악취 걱정에서 해방되세요.
                  </h3>
                  <div className="inline-block bg-white px-6 py-3 rounded-2xl shadow-md border border-gray-100 mb-8">
                    <span className="text-xs font-bold text-gray-400 block mb-1">월 구독료</span>
                    <span className="text-3xl font-black text-[#002B5B]">29,900원</span>
                  </div>
                  
                  <Button 
                    className="w-full py-6 text-lg font-black shadow-2xl shadow-blue-200"
                    disabled={loading || user?.subscription?.status === 'ACTIVE'}
                    onClick={async () => {
                      if (isGuest) { setStep('login'); return; }
                      setLoading(true);
                      try {
                        const sub = await api.subscribe(user!.id, 'MONTHLY');
                        onLogin({ ...user!, subscription: sub });
                        alert('달수 배관 주치의 멤버십 가입이 완료되었습니다!');
                        setStep('home');
                      } catch (e) {
                        alert('가입 실패');
                      } finally {
                        setLoading(false);
                      }
                    }}
                  >
                    {user?.subscription?.status === 'ACTIVE' ? '이미 주치의가 배정되었습니다' : '3초만에 멤버십 가입'}
                  </Button>
                </div>

                {/* [섹션6 - 남용 방지 안내] */}
                <div className="p-6 bg-gray-100 rounded-2xl">
                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    * 본 멤버십은 실거주 가구의 쾌적한 환경을 위해 운영됩니다. 상업 시설이나 무분별한 남용 시 서비스 이용이 제한될 수 있으나, 일반적인 가정집 사용 환경이라면 아무 걱정 없이 모든 혜택을 누리실 수 있습니다.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
          {step === 'login' && (
            <motion.div 
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <button onClick={() => setStep('home')} className="text-sm text-gray-500 flex items-center gap-1">
                <ChevronRight className="w-4 h-4 rotate-180" /> 돌아가기
              </button>
              <div className="text-center">
                <div className="w-20 h-20 bg-white rounded-full p-2 shadow-lg border-2 border-[#FFD700] mx-auto mb-4 overflow-hidden">
                  <img src={DALSU_LOGO} alt="달수" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </div>
                <h3 className="text-2xl font-bold text-[#002B5B]">간편 로그인</h3>
                <p className="text-sm text-gray-500 mt-1">회원 유형을 선택하고 번호를 입력해주세요.</p>
              </div>
              
              <Card className="p-8">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setLoginRole('customer')}
                      className={`py-3 rounded-xl font-bold text-sm transition-all border-2 ${
                        loginRole === 'customer' 
                          ? 'border-[#002B5B] bg-blue-50 text-[#002B5B]' 
                          : 'border-gray-100 bg-gray-50 text-gray-400'
                      }`}
                    >
                      고객으로 시작
                    </button>
                    <button 
                      onClick={() => setLoginRole('technician')}
                      className={`py-3 rounded-xl font-bold text-sm transition-all border-2 ${
                        loginRole === 'technician' 
                          ? 'border-[#002B5B] bg-blue-50 text-[#002B5B]' 
                          : 'border-gray-100 bg-gray-50 text-gray-400'
                      }`}
                    >
                      기사님으로 시작
                    </button>
                  </div>

                  <div className="text-left">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">휴대폰 번호</label>
                    <input 
                      type="tel" 
                      placeholder="010-0000-0000"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#002B5B] outline-none transition-all"
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleQuickLogin} className="w-full py-4 text-lg" disabled={loading}>
                    {loading ? '인증 중...' : '확인'}
                  </Button>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <button onClick={() => { setLoginPhone('010-2222-2222'); setLoginRole('customer'); }} className="text-[10px] bg-gray-50 py-2 rounded-lg text-gray-500">데모 고객 번호</button>
                    <button onClick={() => { setLoginPhone('010-1111-1111'); setLoginRole('technician'); }} className="text-[10px] bg-gray-50 py-2 rounded-lg text-gray-500">데모 기사 번호</button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {step === 'category' && (
            <motion.div 
              key="category"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h3 className="text-2xl font-bold text-[#002B5B]">전체 카테고리</h3>
              <div className="grid grid-cols-2 gap-4">
                {categories.map((cat) => (
                  <Card key={cat.id} className="p-4 flex items-center gap-3 cursor-pointer hover:border-[#00AEEF] transition-all" onClick={() => handleStartDiagnosis(cat.id)}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cat.bg}`}>
                      <span className="text-2xl">{cat.emoji}</span>
                    </div>
                    <span className="font-bold text-gray-800">{cat.name}</span>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'price' && (
            <motion.div 
              key="price"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h3 className="text-2xl font-bold text-[#002B5B]">서비스 가격 정보</h3>
              <Card className="divide-y divide-gray-100">
                {categories.slice(0, 6).map((cat: any) => (
                  <div 
                    key={cat.id} 
                    className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => alert('자세한 견적은 AI 진단 또는 서비스 신청 시 확인 가능합니다.')}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{cat.emoji}</span>
                      <span className="font-bold text-gray-800">{cat.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">기본 작업비</p>
                      <p className="font-bold text-[#002B5B]">{cat.price || '견적 문의'}</p>
                    </div>
                  </div>
                ))}
              </Card>
              <p className="text-[10px] text-gray-400 text-center">※ 실제 비용은 현장 상황 및 작업 난이도에 따라 달라질 수 있습니다.</p>
            </motion.div>
          )}

          {step === 'payment' && (
            <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <button onClick={() => setStep('profile')} className="p-2 hover:bg-gray-100 rounded-full"><ChevronRight className="w-5 h-5 rotate-180" /></button>
                <h3 className="text-xl font-bold text-[#002B5B]">결제 수단 관리</h3>
              </div>
              <Card className="p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                  <CardIcon className="w-8 h-8 text-[#002B5B]" />
                </div>
                <p className="text-gray-500 text-sm">등록된 결제 수단이 없습니다.</p>
                <Button className="w-full" variant="outline">+ 새 카드 등록하기</Button>
              </Card>
            </motion.div>
          )}

          {step === 'address' && (
            <motion.div key="address" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <button onClick={() => setStep('profile')} className="p-2 hover:bg-gray-100 rounded-full"><ChevronRight className="w-5 h-5 rotate-180" /></button>
                <h3 className="text-xl font-bold text-[#002B5B]">주소지 관리</h3>
              </div>
              <Card className="p-6 space-y-4">
                <div className="flex justify-between items-start border-b border-gray-50 pb-4">
                  <div>
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full mb-1 inline-block">기본배송지</span>
                    <p className="font-bold text-gray-800">우리집</p>
                    <p className="text-xs text-gray-500 mt-1">서울시 강남구 테헤란로 123, 405호</p>
                  </div>
                  <Button variant="ghost" className="text-xs px-2 py-1">수정</Button>
                </div>
                <Button className="w-full" variant="outline">+ 새 주소 추가</Button>
              </Card>
            </motion.div>
          )}

          {step === 'notification' && (
            <motion.div key="notification" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <button onClick={() => setStep('profile')} className="p-2 hover:bg-gray-100 rounded-full"><ChevronRight className="w-5 h-5 rotate-180" /></button>
                <h3 className="text-xl font-bold text-[#002B5B]">알림 설정</h3>
              </div>
              <Card className="divide-y divide-gray-50">
                {[
                  { title: '서비스 상태 알림', desc: '예약, 출동, 완료 등 서비스 진행 상황' },
                  { title: '마케팅 혜택 알림', desc: '이벤트, 쿠폰, 멤버십 혜택 정보' },
                  { title: '야간 알림 수신', desc: '오후 9시 ~ 오전 8시 사이 알림 수신' }
                ].map((item, i) => (
                  <div key={i} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-gray-800">{item.title}</p>
                      <p className="text-[10px] text-gray-400">{item.desc}</p>
                    </div>
                    <div className="w-10 h-5 bg-blue-600 rounded-full relative">
                      <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                    </div>
                  </div>
                ))}
              </Card>
            </motion.div>
          )}

          {step === 'faq' && (
            <motion.div key="faq" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <button onClick={() => setStep('profile')} className="p-2 hover:bg-gray-100 rounded-full"><ChevronRight className="w-5 h-5 rotate-180" /></button>
                <h3 className="text-xl font-bold text-[#002B5B]">자주 묻는 질문</h3>
              </div>
              <div className="space-y-3">
                {[
                  { q: '출장비는 얼마인가요?', a: '기본 출장비는 2만원이며, 멤버십 회원은 면제됩니다.' },
                  { q: '작업 시간은 얼마나 걸리나요?', a: '단순 막힘은 30분 내외, 고압 세척 등은 1~2시간 소요됩니다.' },
                  { q: '결제는 어떻게 하나요?', a: '작업 완료 후 앱 내 등록된 카드로 결제하거나 현장 결제가 가능합니다.' },
                  { q: 'A/S 보증 기간은 어떻게 되나요?', a: '작업 완료일로부터 30일간 동일 증상에 대해 무상 A/S를 제공합니다.' }
                ].map((item, i) => (
                  <Card key={i} className="p-4">
                    <p className="font-bold text-sm text-[#002B5B] flex items-center gap-2">
                      <span className="text-[#FFD700]">Q.</span> {item.q}
                    </p>
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed pl-6">
                      {item.a}
                    </p>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'notice' && (
            <motion.div key="notice" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <button onClick={() => setStep('profile')} className="p-2 hover:bg-gray-100 rounded-full"><ChevronRight className="w-5 h-5 rotate-180" /></button>
                <h3 className="text-xl font-bold text-[#002B5B]">공지사항</h3>
              </div>
              <div className="space-y-3">
                {[
                  { title: '[안내] 설 연휴 기간 서비스 운영 안내', date: '2026.02.10', important: true },
                  { title: '[업데이트] AI 진단 기능 고도화 안내', date: '2026.01.25', important: false },
                  { title: '[이벤트] 멤버십 첫 달 1,000원 프로모션', date: '2026.01.01', important: true },
                  { title: '[안내] 서비스 이용약관 개정 안내', date: '2025.12.15', important: false }
                ].map((item, i) => (
                  <Card key={i} className="p-4 flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {item.important && <span className="text-[8px] font-black bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase">중요</span>}
                        <p className="font-bold text-sm text-gray-800">{item.title}</p>
                      </div>
                      <p className="text-[10px] text-gray-400">{item.date}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </Card>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 py-2 flex justify-around items-center z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => setStep('home')}
          className={`flex flex-col items-center gap-1 flex-1 transition-colors ${step === 'home' ? 'text-[#002B5B]' : 'text-gray-400'}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-bold">홈</span>
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => setStep('category')}
          className={`flex flex-col items-center gap-1 flex-1 transition-colors ${step === 'category' ? 'text-[#002B5B]' : 'text-gray-400'}`}
        >
          <Grid className="w-5 h-5" />
          <span className="text-[10px] font-bold">카테고리</span>
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => setStep('price')}
          className={`flex flex-col items-center gap-1 flex-1 transition-colors ${step === 'price' ? 'text-[#002B5B]' : 'text-gray-400'}`}
        >
          <Coins className="w-5 h-5" />
          <span className="text-[10px] font-bold">가격정보</span>
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => setStep('history')}
          className={`flex flex-col items-center gap-1 flex-1 transition-colors ${step === 'history' || step === 'detail' ? 'text-[#002B5B]' : 'text-gray-400'}`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px] font-bold">내예약</span>
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => setStep('profile')}
          className={`flex flex-col items-center gap-1 flex-1 transition-colors ${step === 'profile' ? 'text-[#002B5B]' : 'text-gray-400'}`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-bold">마이페이지</span>
        </motion.button>
      </nav>

      <ChatBot />
    </div>
  );
};

const TechnicianDashboard = ({ user, onLogout }: { user: UserType, onLogout: () => void }) => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasNewRequest, setHasNewRequest] = useState(false);

  const firstLoadRef = React.useRef(true);
  const prevIdsRef = React.useRef<number[]>([]);

  const loadPendingRequests = async (showAlert = true) => {
    try {
      const data = await api.getPendingRequests();
      setRequests(data);

      const newIds = data.map((req: any) => req.id);
      const prevIds = prevIdsRef.current;

      if (firstLoadRef.current) {
        prevIdsRef.current = newIds;
        firstLoadRef.current = false;
        setLoading(false);
        return;
      }

      const addedRequests = data.filter((req: any) => !prevIds.includes(req.id));

      if (addedRequests.length > 0) {
        setHasNewRequest(true);

        if (showAlert) {
          alert(`새 예약이 ${addedRequests.length}건 들어왔습니다.`);
        }
      }

      prevIdsRef.current = newIds;
    } catch (error) {
      console.error("대기 요청 불러오기 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingRequests(false);

    const interval = setInterval(() => {
      loadPendingRequests(true);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#F1F5F9] pb-24">
      <header className="bg-[#002B5B] text-white px-6 py-6 sticky top-0 z-10 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl p-1 overflow-hidden border-2 border-[#FFD700]">
              <img src={DALSU_LOGO} alt="달수" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <div>
              <h2 className="text-xl font-bold">기사님 대시보드</h2>
              <p className="text-[10px] text-white/60">오늘도 안전하게 통수하세요!</p>
            </div>
          </div>
          <button onClick={onLogout} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 bg-white/10 p-3 rounded-xl">
            <p className="text-[10px] text-white/60 uppercase font-bold">오늘 수익</p>
            <p className="text-lg font-bold">245,000원</p>
          </div>
          <div className="flex-1 bg-white/10 p-3 rounded-xl">
            <p className="text-[10px] text-white/60 uppercase font-bold">완료 작업</p>
            <p className="text-lg font-bold">3건</p>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {hasNewRequest && (
          <div className="bg-red-500 text-white px-4 py-3 rounded-2xl shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-bold text-sm">새 예약이 들어왔습니다</span>
            </div>
            <button
              onClick={() => setHasNewRequest(false)}
              className="text-xs font-bold bg-white/20 px-3 py-1 rounded-lg"
            >
              확인
            </button>
          </div>
        )}

        <div className="flex justify-between items-center">
          <h3 className="font-bold text-gray-800">실시간 호출 현황</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setHasNewRequest(false);
                loadPendingRequests(false);
              }}
              className="text-xs font-bold text-[#002B5B] bg-white px-3 py-1 rounded-lg border border-gray-200"
            >
              새로고침
            </button>
            <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">영업 중</span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">불러오는 중...</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 text-gray-400">현재 대기 중인 요청이 없습니다.</div>
        ) : (
          <div className="space-y-4">
            {requests.map((req: any) => (
              <Card key={req.id} className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                      req.urgency === 'HIGH' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {req.urgency}
                    </span>
                    <h4 className="font-bold text-lg mt-1">{req.category}</h4>
                  </div>
                  <p className="text-xs text-gray-400">{new Date(req.created_at).toLocaleTimeString()}</p>
                </div>

                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{req.location}</span>
                  </div>

                  {req.customer_name && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{req.customer_name}</span>
                    </div>
                  )}

                  {req.customer_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{req.customer_phone}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {req.customer_phone ? (
                    <Button
                      variant="outline"
                      className="flex-1 py-2 text-sm"
                      onClick={() => window.location.href = `tel:${req.customer_phone}`}
                    >
                      전화걸기
                    </Button>
                  ) : (
                    <Button variant="outline" className="flex-1 py-2 text-sm">
                      상세보기
                    </Button>
                  )}

                  <Button
                    className="flex-1 py-2 text-sm"
                    onClick={() => {
                      setHasNewRequest(false);
                      alert('수락되었습니다. 고객에게 직접 전화로 안내해주세요.');
                    }}
                  >
                    수락하기
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

const B2BDashboard = ({ user, onLogout }: { user: UserType, onLogout: () => void }) => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.getB2BStats().then(setStats);
  }, []);

  const data = [
    { name: '1월', cost: 850000 },
    { name: '2월', cost: 1250000 },
    { name: '3월', cost: 980000 },
    { name: '4월', cost: 1100000 },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-[#002B5B] min-h-screen p-6 text-white hidden md:block shadow-2xl">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-white rounded-xl p-1 overflow-hidden border-2 border-[#FFD700]">
              <img src={DALSU_LOGO} alt="달수" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <h1 className="text-xl font-black tracking-tighter text-[#FFD700]">달수 B2B</h1>
          </div>
          <nav className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl cursor-pointer">
              <LayoutDashboard className="w-5 h-5" />
              <span>대시보드</span>
            </div>
            <div className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl cursor-pointer transition-colors">
              <Building2 className="w-5 h-5" />
              <span>건물 관리</span>
            </div>
            <div className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl cursor-pointer transition-colors">
              <Clock className="w-5 h-5" />
              <span>점검 이력</span>
            </div>
            <div className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl cursor-pointer transition-colors">
              <CreditCard className="w-5 h-5" />
              <span>정산 관리</span>
            </div>
          </nav>
          <div className="absolute bottom-10 left-6 right-6">
            <button onClick={onLogout} className="flex items-center gap-3 text-white/60 hover:text-white transition-colors">
              <LogOut className="w-5 h-5" />
              <span>로그아웃</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <header className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#002B5B]">빌딩 통합 관리 시스템</h2>
              <p className="text-gray-500">현대아파트 관리사무소님, 환영합니다.</p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline">리포트 다운로드 (PDF)</Button>
              <Button>긴급 출동 요청</Button>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">누적 점검 횟수</p>
              <p className="text-3xl font-bold text-[#002B5B]">{stats?.totalInspections || 0}</p>
            </Card>
            <Card className="p-6">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">진행 중인 수리</p>
              <p className="text-3xl font-bold text-orange-500">{stats?.pendingRepairs || 0}</p>
            </Card>
            <Card className="p-6">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">이번 달 유지비</p>
              <p className="text-3xl font-bold text-[#002B5B]">{(stats?.monthlyCost || 0).toLocaleString()}원</p>
            </Card>
            <Card className="p-6">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">다음 정기 점검</p>
              <p className="text-xl font-bold text-blue-600">{stats?.nextInspection || '-'}</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-6">
              <h3 className="font-bold text-gray-800 mb-6">유지보수 비용 추이</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="cost" stroke="#002B5B" strokeWidth={3} dot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="font-bold text-gray-800 mb-6">최근 작업 이력</h3>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Wrench className="w-5 h-5 text-[#002B5B]" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">102동 지하 배관 세척</p>
                        <p className="text-xs text-gray-500">2026-02-15 · 김달수 기사</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-green-600">완료</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

const AdminConsole = ({ user, onLogout }: { user: UserType, onLogout: () => void }) => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.getAdminStats().then(setStats);
  }, []);

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
       <div className="flex">
        <aside className="w-64 bg-[#0F172A] min-h-screen p-6 text-white">
          <div className="flex items-center gap-2 mb-12">
            <ShieldCheck className="text-[#FFD700]" />
            <h1 className="text-xl font-bold">달수 어드민</h1>
          </div>
          <nav className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl cursor-pointer">
              <TrendingUp className="w-5 h-5" />
              <span>매출 현황</span>
            </div>
            <div className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl cursor-pointer">
              <User className="w-5 h-5" />
              <span>기사 관리</span>
            </div>
            <div className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl cursor-pointer">
              <AlertTriangle className="w-5 h-5" />
              <span>분쟁 해결</span>
            </div>
          </nav>
          <div className="absolute bottom-10 left-6">
            <button onClick={onLogout} className="flex items-center gap-3 text-white/60"><LogOut className="w-5 h-5" /> 로그아웃</button>
          </div>
        </aside>

        <main className="flex-1 p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">플랫폼 통합 관리</h2>
          
          <div className="grid grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <p className="text-xs font-bold text-gray-400 mb-1">총 매출</p>
              <p className="text-2xl font-bold text-blue-600">{(stats?.totalRevenue || 0).toLocaleString()}원</p>
            </Card>
            <Card className="p-6">
              <p className="text-xs font-bold text-gray-400 mb-1">활동 기사</p>
              <p className="text-2xl font-bold text-gray-800">{stats?.activeTechnicians || 0}명</p>
            </Card>
            <Card className="p-6">
              <p className="text-xs font-bold text-gray-400 mb-1">승인 대기</p>
              <p className="text-2xl font-bold text-orange-500">{stats?.pendingVerifications || 0}건</p>
            </Card>
            <Card className="p-6">
              <p className="text-xs font-bold text-gray-400 mb-1">고객 만족도</p>
              <p className="text-2xl font-bold text-green-600">{stats?.customerSatisfaction || 0} / 5.0</p>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="font-bold mb-6">최근 기사 승인 요청</h3>
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-bold text-gray-400 border-b border-gray-100">
                  <th className="pb-4">이름</th>
                  <th className="pb-4">지역</th>
                  <th className="pb-4">장비 보유</th>
                  <th className="pb-4">상태</th>
                  <th className="pb-4">액션</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-gray-50">
                  <td className="py-4 font-medium">박철수</td>
                  <td className="py-4">서울 강서구</td>
                  <td className="py-4">
                    <div className="flex gap-1">
                      <Badge type="Certified" />
                      <Badge type="Rapid Response" />
                    </div>
                  </td>
                  <td className="py-4"><span className="px-2 py-1 bg-orange-100 text-orange-600 rounded text-[10px] font-bold">검토 중</span></td>
                  <td className="py-4"><Button variant="ghost" className="text-xs py-1 px-3">상세보기</Button></td>
                </tr>
              </tbody>
            </table>
          </Card>
        </main>
       </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<UserType | null>(null);

  const handleLogout = () => {
    setUser(null);
  };

  const handleLogin = (u: UserType) => {
    setUser(u);
  };

  if (user) {
    switch (user.role) {
      case 'technician':
        return <TechnicianDashboard user={user} onLogout={handleLogout} />;
      case 'b2b':
        return <B2BDashboard user={user} onLogout={handleLogout} />;
      case 'admin':
        return <AdminConsole user={user} onLogout={handleLogout} />;
      default:
        // Already logged in as customer, will render CustomerDashboard below
        break;
    }
  }

  // Default view is CustomerDashboard (Guest or Logged-in Customer)
  return <CustomerDashboard user={user} onLogout={handleLogout} onLogin={handleLogin} />;
}
