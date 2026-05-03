import React, { useState, useEffect, useRef, type ReactNode } from 'react';
import { 
  Bell, 
  MessageSquare, 
  User as UserIcon, 
  Plus, 
  Send, 
  UserPlus, 
  Users, 
  History, 
  Smartphone, 
  Zap, 
  Gift, 
  Wallet, 
  CreditCard,
  MessageCircle,
  Youtube,
  Send as Telegram,
  ShoppingCart,
  Repeat,
  Clock,
  ChevronRight,
  Home,
  Monitor,
  Menu,
  X,
  LogOut,
  ShieldCheck,
  Lock,
  Smartphone as PhoneIcon,
  Settings,
  Image as ImageIcon,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './context/AuthContext';
import { useSystem } from './context/SystemContext';
import { auth, db, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithGoogle, updateEmail, updatePassword } from './lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, where, serverTimestamp, setDoc, doc, deleteDoc, getDoc, getDocs } from 'firebase/firestore';

// --- Types ---
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

const operators = [
  { id: 'GP', name: 'GP', color: 'bg-sky-500' },
  { id: 'Robi', name: 'Robi', color: 'bg-red-500' },
  { id: 'Banglalink', name: 'BL', color: 'bg-orange-500' },
  { id: 'Airtel', name: 'Airtel', color: 'bg-rose-600' },
  { id: 'Teletalk', name: 'Teletalk', color: 'bg-emerald-600' },
  { id: 'Skitto', name: 'Skitto', color: 'bg-yellow-400' },
];

// --- Utilities ---
function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  }
  const errString = JSON.stringify(errInfo);
  console.error('Firestore Error: ', errString);
  throw new Error(errString);
}

const LEVELS = [
  { id: 'personal', name: 'Personal', val: 1 },
  { id: 'retailer', name: 'Retailer', val: 2 },
  { id: 'dealer', name: 'Dealer', val: 3 },
  { id: 'dgm', name: 'DGM', val: 4 },
  { id: 'house', name: 'House', val: 5 },
  { id: 'sub-admin', name: 'Sub Admin', val: 6 },
];

// --- Components ---

const LoginScreen = ({ onSwitchToRegister }: { onSwitchToRegister: () => void }) => {
  const { settings } = useSystem();
  const [formData, setFormData] = useState({ username: '', pin: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Username can be phone or personal username
      const identifier = formData.username.includes('@') ? formData.username : `${formData.username.replace(/\s+/g, '').toLowerCase()}@mubaraktelecom.com`;
      // Internally append suffix to meet 6-char password requirement
      const internalPassword = formData.pin + "_MTSECRET";
      await signInWithEmailAndPassword(auth, identifier, internalPassword);
    } catch (err: any) {
      setError('Invalid username or account PIN');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-6 py-12 text-center font-sans">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-10 w-full flex flex-col items-center">
        <div className="w-32 h-32 mb-6 rounded-[45px] overflow-hidden shadow-2xl border-4 border-white ring-8 ring-slate-50 flex items-center justify-center bg-white transition-all hover:scale-105 active:scale-95 duration-500">
          <img 
            src={settings.logoUrl} 
            alt={settings.appName} 
            className="w-full h-full object-contain scale-110"
            referrerPolicy="no-referrer"
          />
        </div>
        <h1 className="text-4xl font-black mb-1 p-0 tracking-tighter uppercase text-slate-900 leading-tight">{settings.appName}</h1>
        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] opacity-70">Digital Connectivity Partner</p>
      </motion.div>
      
      <motion.div initial={{ y: 20, opacity: 1 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="w-full max-w-sm bg-slate-50 p-10 rounded-[60px] shadow-2xl shadow-slate-200/40 border border-slate-100">
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="text-left">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block opacity-60">Username / Phone</label>
            <input 
              required 
              placeholder="Enter username or phone" 
              className="w-full bg-white border-2 border-white rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:border-primary transition-all placeholder:text-slate-300 shadow-sm shadow-slate-100" 
              value={formData.username} 
              onChange={e => setFormData({...formData, username: e.target.value})} 
            />
          </div>
          <div className="text-left">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block opacity-60">Account PIN</label>
            <input 
              required 
              type="password" 
              placeholder="••••" 
              maxLength={4} 
              className="w-full bg-white border-2 border-white rounded-2xl px-6 py-4 text-slate-900 font-black text-center tracking-[0.5em] outline-none focus:border-primary transition-all placeholder:text-slate-300 shadow-sm shadow-slate-100" 
              value={formData.pin} 
              onChange={e => setFormData({...formData, pin: e.target.value.replace(/\D/g, '')})} 
            />
          </div>

          {error && <motion.p initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-red-500 text-[11px] font-bold bg-white p-4 rounded-2xl border border-red-100 shadow-sm text-center">{error}</motion.p>}
          
          <button disabled={loading} type="submit" className="w-full bg-primary text-white font-black py-5 rounded-[24px] shadow-xl shadow-primary/20 uppercase tracking-widest text-sm active:scale-95 transition-all mt-4 disabled:opacity-50">
            {loading ? 'Verifying...' : 'Access Portal'}
          </button>

          <div className="relative flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">OR</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          <button 
            type="button"
            onClick={async () => {
              try {
                setLoading(true);
                await signInWithGoogle();
              } catch (err: any) {
                setError('Google Sign-in failed. Please try again.');
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="w-full bg-white border-2 border-slate-100 text-slate-700 font-black py-4 rounded-[24px] shadow-sm flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-xs uppercase tracking-widest">Sign in with Google</span>
          </button>

        </form>

        <button onClick={onSwitchToRegister} className="mt-8 text-slate-400 text-[11px] font-black hover:text-primary transition-colors block w-full text-center uppercase tracking-widest">
          New here? <span className="text-primary underline">Register Account</span>
        </button>
      </motion.div>

      <div className="mt-16 opacity-30 text-center w-full">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Powered by Antigravity Cloud</p>
      </div>
    </div>
  );
};

const RegistrationScreen = ({ onSwitchToLogin, onRegisterSuccess }: { onSwitchToLogin: () => void, onRegisterSuccess: () => void }) => {
  const { settings } = useSystem();
  const [formData, setFormData] = useState({ displayName: '', username: '', email: '', phone: '', pin: '', nid: '', dob: '', level: 'personal' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const levelSettings = settings.levelSettings || {};

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.pin.length !== 4) return setError('PIN must be 4 digits');
    if (!formData.username) return setError('Username is required');
    
    setLoading(true);
    setError(null);
    try {
      // Use username-based email mapping for Auth
      const authEmail = `${formData.username.replace(/\s+/g, '').toLowerCase()}@mubaraktelecom.com`;
      // Internally append suffix to meet 6-char password requirement
      const internalPassword = formData.pin + "_MTSECRET";
      
      const userCredential = await createUserWithEmailAndPassword(auth, authEmail, internalPassword);
      
      // Create profile
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        displayName: formData.displayName,
        username: formData.username,
        email: formData.email,
        phoneNumber: formData.phone,
        nid: formData.nid,
        dob: formData.dob,
        level: formData.level,
        pin: formData.pin,
        balance: 0,
        mainBalance: 0,
        driveBalance: 0,
        createdAt: serverTimestamp()
      });
      onRegisterSuccess();
    } catch (err: any) {
      if (err.message.includes('auth/operation-not-allowed')) {
        setError('Enable Email/Password in Firebase Console: Authentication > Sign-in method.');
      } else {
        setError(err.message.includes('email-already-in-use') ? 'Username already taken' : err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-6 py-12 font-sans overflow-y-auto">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-10 w-full animate-in fade-in slide-in-from-top-4 duration-700">
        <h2 className="text-4xl font-black text-slate-900 mb-1 tracking-tighter uppercase leading-none">Create Account</h2>
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] opacity-60">{settings.appName} Network</p>
      </motion.div>

      <motion.div initial={{ y: 20, opacity: 1 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-md bg-slate-50 p-8 rounded-[60px] shadow-2xl shadow-slate-200/40 border border-slate-100">
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-left">
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block opacity-60">Full Name</label>
              <input required className="w-full bg-white border-2 border-white rounded-2xl px-5 py-3 text-slate-900 font-bold outline-none focus:border-primary transition-all shadow-sm shadow-slate-50" value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} />
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block opacity-60">Username</label>
              <input required placeholder="Handle" className="w-full bg-white border-2 border-white rounded-2xl px-5 py-3 text-slate-900 font-bold outline-none focus:border-primary transition-all shadow-sm shadow-slate-50" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-left">
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block opacity-60">Email Address</label>
              <input required type="email" placeholder="mail@site.com" className="w-full bg-white border-2 border-white rounded-2xl px-5 py-3 text-slate-900 font-bold outline-none focus:border-primary transition-all shadow-sm shadow-slate-50" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block opacity-60">Phone</label>
              <input required placeholder="01XXXXXXXXX" className="w-full bg-white border-2 border-white rounded-2xl px-5 py-3 text-slate-900 font-bold outline-none focus:border-primary transition-all shadow-sm shadow-slate-50" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-left">
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block opacity-60">NID Number</label>
              <input required placeholder="12345678" className="w-full bg-white border-2 border-white rounded-2xl px-5 py-3 text-slate-900 font-bold outline-none focus:border-primary transition-all shadow-sm shadow-slate-50" value={formData.nid} onChange={e => setFormData({...formData, nid: e.target.value})} />
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block opacity-60">DOB</label>
              <input required type="date" className="w-full bg-white border-2 border-white rounded-2xl px-5 py-3 text-slate-900 font-bold outline-none focus:border-primary transition-all shadow-sm shadow-slate-50 font-sans" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
            </div>
          </div>

          <div className="text-left">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block opacity-60">Account PIN (4 Digit)</label>
            <input required maxLength={4} className="w-full bg-white border-2 border-white rounded-2xl px-5 py-4 text-slate-900 font-black text-center tracking-[0.5em] outline-none focus:border-primary transition-all shadow-sm shadow-slate-50" value={formData.pin} onChange={e => setFormData({...formData, pin: e.target.value.replace(/\D/g, '')})} />
          </div>

          <div className="text-left">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block opacity-60">Account Tier</label>
            <div className="grid grid-cols-3 gap-2">
              {LEVELS.map(l => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setFormData({...formData, level: l.id})}
                  className={`p-3 rounded-2xl text-[9px] font-black uppercase tracking-tighter border-2 transition-all flex flex-col items-center justify-center gap-1 ${formData.level === l.id ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20' : 'border-white bg-white text-slate-400 shadow-sm'}`}
                >
                  {l.name}
                  <span className={`text-[8px] opacity-70 ${formData.level === l.id ? 'text-white' : 'text-slate-400'}`}>৳{levelSettings[l.id]?.registrationCost || 0}</span>
                </button>
              ))}
            </div>
          </div>

          {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-[10px] font-bold text-center bg-white p-3 rounded-xl border border-red-100 shadow-sm">{error}</motion.p>}

          <button disabled={loading} type="submit" className="w-full bg-primary text-white font-black py-5 rounded-[24px] shadow-xl shadow-primary/20 uppercase tracking-widest text-sm active:scale-95 transition-all mt-4 disabled:opacity-50">
            {loading ? 'Processing...' : 'Register Network'}
          </button>
        </form>

        <button onClick={onSwitchToLogin} className="w-full mt-8 text-slate-400 text-[11px] font-black hover:text-primary transition-colors text-center uppercase tracking-widest">
          Already a member? <span className="text-primary underline">Login Here</span>
        </button>
      </motion.div>

      <div className="mt-12 opacity-30 text-center w-full">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Powered by Antigravity Cloud</p>
      </div>
    </div>
  );
};

const DateTimePrayerSection = () => {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // English Date
  const engDate = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const engDay = date.toLocaleDateString('en-GB', { weekday: 'long' });
  
  // Bengali Date (Bangla Calendar)
  const bnDate = new Intl.DateTimeFormat('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  const bnDay = new Intl.DateTimeFormat('bn-BD', { weekday: 'long' }).format(date);

  const prayerTimes = [
    { name: 'ফজর', time: '৪:১৮' },
    { name: 'যোহর', time: '১২:০৬' },
    { name: 'আসর', time: '৪:৩৩' },
    { name: 'মাগরিব', time: '৬:২৭' },
    { name: 'এশা', time: '৭:৪৭' },
  ];

  return (
    <div className="px-6 mb-8 mt-2 relative z-20 -mt-10">
      <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-slate-200/50 border border-slate-50 flex flex-col gap-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-xs font-black text-slate-800">{engDate}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{engDay}</p>
          </div>
          <div className="text-right space-y-1">
            <h3 className="text-xs font-black text-primary">{bnDate}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{bnDay}</p>
          </div>
        </div>

        <div className="flex justify-between items-center bg-slate-50 rounded-3xl p-5 border border-slate-100 overflow-x-auto scrollbar-none gap-4">
          {prayerTimes.map((p, i) => (
            <div key={i} className="flex flex-col items-center gap-1 min-w-[55px]">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{p.name}</span>
              <span className="text-[11px] font-black text-slate-800">{p.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Header = ({ profile, logoUrl }: { profile: any, logoUrl?: string }) => (
  <header className="bg-primary pt-6 pb-20 px-6 rounded-b-[40px] relative z-10">
    <div className="flex justify-between items-center text-white">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-white/30 overflow-hidden">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
          ) : (
            <Smartphone size={20} className="text-primary" />
          )}
        </div>
        <h1 className="text-xl font-black tracking-tight">Mubarak Telecom</h1>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative text-white/90">
          <MessageSquare size={22} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center border-2 border-primary font-bold">1</span>
        </button>
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30 shadow-md">
          <img 
            src={profile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.uid || 'user'}`} 
            alt="Profile" 
            className="w-full h-full object-cover bg-white/20"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </div>
  </header>
);

const BalanceCard = ({ profile, onAddBalance, onSendMoney, onAddUser, onMyUsers, runWithPin }: { profile: any, onAddBalance: () => void, onSendMoney: () => void, onAddUser: () => void, onMyUsers: () => void, runWithPin: (action: () => void) => void }) => {
  const [showMain, setShowMain] = useState(false);
  const [showDrive, setShowDrive] = useState(false);
  const { settings } = useSystem();

  return (
    <div className="px-5 -mt-14 relative z-20">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-[32px] p-6 shadow-xl border border-slate-100"
      >
        <div className="grid grid-cols-2 gap-4 items-center mb-6">
          <div className="space-y-0.5">
            <h2 className="text-secondary font-black text-sm uppercase tracking-tight">My account</h2>
            <p className="text-cyan-600 font-bold text-[11px] tracking-wide truncate">{profile?.phoneNumber || 'Setup Required'}</p>
          </div>
          
          <div className="text-right">
            <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest leading-none mb-1">My Level</p>
            <p className="text-[11px] font-black text-orange-400 capitalize">{profile?.level || 'user'}</p>
          </div>
        </div>

        <div className={`grid ${settings.isDualBalanceEnabled ? 'grid-cols-2' : 'grid-cols-1'} gap-3 mb-8`}>
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowMain(!showMain)}
            className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 py-3 px-4 rounded-2xl shadow-sm justify-center group relative overflow-hidden"
          >
            <div className="w-8 h-8 rounded-xl bg-cyan-500 flex items-center justify-center text-white text-sm font-black shadow-lg shadow-cyan-500/20">৳</div>
            <div className="text-left">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1">Main Balance</span>
              <span className="text-xs font-black text-slate-700 whitespace-nowrap">
                {showMain ? `৳${(profile?.mainBalance ?? profile?.balance ?? 0).toLocaleString()}` : 'Tap for Balance'}
              </span>
            </div>
            {showMain && <motion.div layoutId="main-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500" />}
          </motion.button>

          {settings.isDualBalanceEnabled && (
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDrive(!showDrive)}
              className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 py-3 px-4 rounded-2xl shadow-sm justify-center group relative overflow-hidden"
            >
              <div className="w-8 h-8 rounded-xl bg-rose-500 flex items-center justify-center text-white text-sm font-black shadow-lg shadow-rose-500/20">৳</div>
              <div className="text-left">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1">Drive Balance</span>
                <span className="text-xs font-black text-slate-700 whitespace-nowrap">
                  {showDrive ? `৳${(profile?.driveBalance ?? 0).toLocaleString()}` : 'Tap for Balance'}
                </span>
              </div>
              {showDrive && <motion.div layoutId="drive-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500" />}
            </motion.button>
          )}
        </div>

        <div className="grid grid-cols-4 gap-4">
          <ServiceIcon label="Add Balance" icon={<Plus size={24} strokeWidth={3} />} colorClass="text-red-500" bgColorClass="bg-white border-2 border-slate-50" onClick={onAddBalance} />
          <ServiceIcon label="Send Money" icon={<Send size={24} strokeWidth={3} />} colorClass="text-blue-500" bgColorClass="bg-white border-2 border-slate-50" onClick={onSendMoney} />
          <ServiceIcon label="Add User" icon={<UserPlus size={24} strokeWidth={3} />} colorClass="text-orange-500" bgColorClass="bg-white border-2 border-slate-50" onClick={onAddUser} />
          <ServiceIcon label="My users" icon={<Users size={24} strokeWidth={3} />} colorClass="text-cyan-600" bgColorClass="bg-white border-2 border-slate-50" onClick={onMyUsers} />
        </div>
      </motion.div>
    </div>
  );
};

const Banner = ({ banners }: { banners: string[] }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [banners]);

  const currentBanner = banners[index] || "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=800";

  return (
    <div className="px-5 mt-6">
      <div className="relative rounded-[32px] overflow-hidden aspect-[21/9] shadow-xl border-4 border-white">
        <AnimatePresence mode="wait">
          <motion.img 
            key={currentBanner}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            src={currentBanner} 
            alt="Promo" 
            className="w-full h-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`}></div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ServiceSection = ({ title, showHistory = false, children, extra }: { title: string, showHistory?: boolean, children: ReactNode, extra?: ReactNode }) => (
  <section className="px-6 mt-8">
    <div className="flex justify-between items-end mb-4 px-1">
      <h3 className="text-primary font-black text-base tracking-tight">{title}</h3>
      <div className="flex items-center gap-3">
        {extra}
        {showHistory && (
          <button className="flex items-center text-primary text-[11px] font-black hover:underline uppercase tracking-widest gap-0.5">
            History <ChevronRight size={14} strokeWidth={3} />
          </button>
        )}
      </div>
    </div>
    <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-slate-200/50 border border-slate-50">
      <div className="grid grid-cols-4 gap-y-10 gap-x-4">
        {children}
      </div>
    </div>
  </section>
);

const ServiceIcon = ({ icon, label, colorClass, bgColorClass, onClick }: { icon: ReactNode, label: string, colorClass: string, bgColorClass: string, onClick?: () => void }) => (
  <motion.div 
    whileHover={{ y: -3 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className="flex flex-col items-center gap-3 cursor-pointer group"
  >
    <div className={`${bgColorClass} ${colorClass} w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md group-hover:shadow-lg`}>
      {icon}
    </div>
    <span className="text-[11px] font-black text-slate-500 text-center leading-none uppercase tracking-tighter h-4 flex items-center">{label}</span>
  </motion.div>
);

const OfferList = ({ isAdmin, activeType, onTypeChange, onBuy, onEdit, offers, loading }: { isAdmin?: boolean, activeType: 'drive' | 'regular', onTypeChange: (type: 'drive' | 'regular') => void, onBuy: (offer: any) => void, onEdit?: (offer: any) => void, offers: any[], loading?: boolean }) => {
  const [activeOperator, setActiveOperator] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price-low' | 'price-high' | 'title'>('newest');

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this offer?')) {
      try { await deleteDoc(doc(db, 'offers', id)); } 
      catch (error) { handleFirestoreError(error, OperationType.DELETE, `offers/${id}`); }
    }
  };

  const toggleStatus = async (offer: any) => {
    try {
      await setDoc(doc(db, 'offers', offer.id), { isActive: !offer.isActive }, { merge: true });
    } catch (error) { handleFirestoreError(error, OperationType.UPDATE, `offers/${offer.id}`); }
  };

  const sortedAndFiltered = offers
    .filter(o => 
      o.type === activeType && 
      (isAdmin || o.isActive !== false) &&
      (!activeOperator || o.operator === activeOperator) && 
      (activeCategory === 'all' || o.category === activeCategory)
    )
    .sort((a, b) => {
      const getNetPrice = (o: any) => (o.regularPrice || o.price || 0) - (o.commission || 0);
      switch (sortBy) {
        case 'newest': return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
        case 'oldest': return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
        case 'price-low': return getNetPrice(a) - getNetPrice(b);
        case 'price-high': return getNetPrice(b) - getNetPrice(a);
        case 'title': return a.title.localeCompare(b.title);
        default: return 0;
      }
    });

  return (
    <div className="px-6 py-8 space-y-8">
      <div className="flex bg-slate-100 p-1.5 rounded-[20px] shadow-inner">
        <button onClick={() => onTypeChange('drive')} className={`flex-1 py-3 rounded-[15px] font-black text-xs uppercase tracking-widest transition-all ${activeType === 'drive' ? 'bg-white text-primary shadow-md' : 'text-slate-400'}`}>Drive Packs</button>
        <button onClick={() => onTypeChange('regular')} className={`flex-1 py-3 rounded-[15px] font-black text-xs uppercase tracking-widest transition-all ${activeType === 'regular' ? 'bg-white text-primary shadow-md' : 'text-slate-400'}`}>Regular Packs</button>
      </div>

      <div className="grid grid-cols-6 gap-3">
        {operators.map(op => (
          <button key={op.id} onClick={() => setActiveOperator(activeOperator === op.id ? null : op.id)} className={`flex flex-col items-center gap-1.5 p-1 transition-all ${activeOperator === op.id ? 'opacity-100 scale-110' : 'opacity-30 grayscale'}`}>
            <div className={`w-10 h-10 ${op.color} rounded-full flex items-center justify-center text-white text-[10px] font-black shadow-lg`}>{op.id}</div>
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-tighter">{op.id}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between border-b-2 border-slate-50 pr-2">
        <div className="flex gap-6 pb-2 px-1 overflow-x-auto scrollbar-none">
          {[
            { id: 'all', label: 'All' },
            { id: 'internet', label: 'ইন্টারনেট' },
            { id: 'minute', label: 'মিনিট' },
            { id: 'bundle', label: 'ব্যান্ডেল' }
          ].map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`pb-2 whitespace-nowrap font-black uppercase text-[11px] tracking-widest transition-all border-b-4 ${activeCategory === cat.id ? 'border-primary text-primary' : 'border-transparent text-slate-300'}`}>{cat.label}</button>
          ))}
        </div>
        <div className="flex items-center gap-1 pb-2">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 outline-none bg-transparent appearance-none cursor-pointer hover:text-primary transition-colors pr-2"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="price-low">Price: Low</option>
            <option value="price-high">Price: High</option>
            <option value="title">Title</option>
          </select>
        </div>
      </div>

      <div className="space-y-4 min-h-[160px]">
        {loading ? (
          <div className="flex flex-col items-center py-10 gap-3 opacity-30">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full" />
            <p className="text-[10px] font-black uppercase tracking-widest">Loading Deals</p>
          </div>
        ) : sortedAndFiltered.length === 0 ? (
          <p className="text-center text-slate-400 font-bold py-10 text-sm">No offers available for this category.</p>
        ) : sortedAndFiltered.map(offer => {
            const regularPrice = offer.regularPrice || offer.price || 0;
            const commission = offer.commission || 0;
            const netPrice = regularPrice - commission;

            return (
              <motion.div key={offer.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-3xl p-5 flex items-center justify-between border-2 border-slate-50 shadow-sm relative overflow-hidden group">
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${operators.find(o => o.id === offer.operator)?.color || 'bg-slate-300'}`} />
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-black text-slate-800 text-sm leading-tight group-hover:text-primary transition-colors">{offer.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                       <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{offer.category}</p>
                       {commission > 0 && <span className="text-[9px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">৳{commission} CashBack</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex flex-col items-end">
                    <p className="text-slate-300 font-bold text-[10px] line-through leading-none">৳{regularPrice}</p>
                    <p className="text-primary font-black text-lg">৳{netPrice}</p>
                  </div>
                  <div className="flex gap-2 mt-1">
                    {isAdmin && (
                      <div className="flex flex-col gap-2 mr-2">
                        <button 
                          onClick={() => toggleStatus(offer)} 
                          className={`text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest transition-all ${offer.isActive !== false ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}
                        >
                          {offer.isActive !== false ? 'Active' : 'Deactive'}
                        </button>
                      </div>
                    )}
                    {isAdmin && (
                      <>
                        <button onClick={() => onEdit?.(offer)} className="text-blue-400 hover:text-blue-600 transition-colors flex items-center gap-1 text-[10px] font-bold"><Plus size={14} className="rotate-45" /> Edit</button>
                        <button onClick={() => handleDelete(offer.id)} className="text-red-400 hover:text-red-600 transition-colors flex items-center gap-1 text-[10px] font-bold"><X size={14} /> Del</button>
                      </>
                    )}
                    <button 
                      onClick={() => onBuy({ ...offer, netPrice })}
                      disabled={offer.isActive === false && !isAdmin}
                      className="bg-primary text-white text-[10px] font-black px-5 py-2 rounded-full shadow-lg shadow-primary/20 uppercase tracking-widest active:scale-95 transition-transform disabled:opacity-50"
                    >
                      Buy
                    </button>
                  </div>
                </div>
              </motion.div>
            );
        })}
      </div>
    </div>
  );
};

// --- Modals ---

const AdminModal = ({ onClose, editingOffer, offers, setEditingOffer }: { onClose: () => void, editingOffer?: any, offers: any[], setEditingOffer: (o: any) => void }) => {
  const { settings, updateSettings } = useSystem();
  const [tab, setTab] = useState<'offer' | 'settings'>(editingOffer ? 'offer' : 'offer');
  const [manageOperator, setManageOperator] = useState('GP');
  const [selectedOfferIds, setSelectedOfferIds] = useState<string[]>([]);
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    regularPrice: '', 
    commission: '', 
    operator: 'GP', 
    type: 'drive', 
    category: 'internet',
    isActive: true
  });

  useEffect(() => {
    if (editingOffer) {
      setFormData({
        title: editingOffer.title || '',
        description: editingOffer.description || '',
        regularPrice: (editingOffer.regularPrice || editingOffer.price || '').toString(),
        commission: (editingOffer.commission || 0).toString(),
        operator: editingOffer.operator || 'GP',
        type: editingOffer.type || 'drive',
        category: editingOffer.category || 'internet',
        isActive: editingOffer.isActive ?? true
      });
    } else {
      setFormData({
        title: '',
        description: '',
        regularPrice: '',
        commission: '',
        operator: 'GP',
        type: 'drive',
        category: 'internet',
        isActive: true
      });
    }
  }, [editingOffer]);

  const [systemSettings, setSystemSettings] = useState({
    appName: settings.appName,
    adminEmail: settings.adminEmail,
    adminPassword: '', // New field
    primaryColor: settings.primaryColor,
    logoUrl: settings.logoUrl || '',
    isDualBalanceEnabled: settings.isDualBalanceEnabled ?? false,
    whatsapp: settings.whatsapp || '',
    telegram: settings.telegram || '',
    youtube: settings.youtube || '',
    shopping: settings.shopping || '',
    mainBalanceCommission: settings.mainBalanceCommission || 0
  });

  const [levelSettings, setLevelSettings] = useState<Record<string, any>>(settings.levelSettings || {
    personal: { mainCommission: 0, driveCommission: 0, registrationCost: 0 },
    retailer: { mainCommission: 0, driveCommission: 0, registrationCost: 0 },
    dealer: { mainCommission: 0, driveCommission: 0, registrationCost: 0 },
    dgm: { mainCommission: 0, driveCommission: 0, registrationCost: 0 },
    house: { mainCommission: 0, driveCommission: 0, registrationCost: 0 },
    'sub-admin': { mainCommission: 0, driveCommission: 0, registrationCost: 0 }
  });

  const handleBulkStatus = async (active: boolean) => {
    if (selectedOfferIds.length === 0) return;
    try {
      const batch = selectedOfferIds.map(id => setDoc(doc(db, 'offers', id), { isActive: active, updatedAt: serverTimestamp() }, { merge: true }));
      await Promise.all(batch);
      setSelectedOfferIds([]);
      alert(`Updated ${selectedOfferIds.length} offers`);
    } catch (error) { alert('Bulk update failed'); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const regPrice = parseFloat(formData.regularPrice);
      if (isNaN(regPrice)) {
        alert('Please enter a valid price');
        return;
      }
      const comm = parseFloat(formData.commission) || 0;
      const payload = { 
        ...formData, 
        regularPrice: regPrice, 
        commission: comm,
        price: regPrice - comm,
        updatedAt: serverTimestamp() 
      };
      
      if (editingOffer) {
        await setDoc(doc(db, 'offers', editingOffer.id), payload, { merge: true });
        alert('Offer updated successfully!');
      } else {
        await addDoc(collection(db, 'offers'), { ...payload, createdAt: serverTimestamp() });
        alert('Offer added successfully!');
      }
      onClose();
    } catch (error: any) { 
      alert('Failed to save offer: ' + error.message);
      handleFirestoreError(error, editingOffer ? OperationType.UPDATE : OperationType.CREATE, editingOffer ? `offers/${editingOffer.id}` : 'offers'); 
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Update Auth Email if changed
      if (systemSettings.adminEmail !== settings.adminEmail && auth.currentUser) {
        try {
          await updateEmail(auth.currentUser, systemSettings.adminEmail);
        } catch (err: any) {
          if (err.code === 'auth/requires-recent-login') {
            alert('Re-authentication required. Please logout and login again to change email.');
            return;
          }
          throw err;
        }
      }

      // 2. Update Auth Password if provided
      if (systemSettings.adminPassword && auth.currentUser) {
        try {
          await updatePassword(auth.currentUser, systemSettings.adminPassword);
        } catch (err: any) {
          if (err.code === 'auth/requires-recent-login') {
            alert('Re-authentication required. Please logout and login again to change password.');
            return;
          }
          throw err;
        }
      }

      // 3. Update Firestore settings
      const { adminPassword, ...settingsToSave } = systemSettings;
      await updateSettings({ ...settingsToSave, levelSettings });
      
      setSystemSettings({ ...systemSettings, adminPassword: '' });
      alert('Admin credentials and system settings updated successfully!');
    } catch (error: any) {
      console.error(error);
      alert('Failed to update settings: ' + error.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6 overflow-y-auto">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[40px] w-full max-w-md p-8 shadow-2xl relative my-auto">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
        
        <div className="flex gap-4 mb-8 border-b-2 border-slate-50">
          <button onClick={() => setTab('offer')} className={`pb-3 font-black uppercase text-xs tracking-widest border-b-4 transition-all ${tab === 'offer' ? 'border-primary text-primary' : 'border-transparent text-slate-300'}`}>
            {editingOffer ? 'Edit Offer' : 'Add Offer'}
          </button>
          <button onClick={() => setTab('settings')} className={`pb-3 font-black uppercase text-xs tracking-widest border-b-4 transition-all ${tab === 'settings' ? 'border-primary text-primary' : 'border-transparent text-slate-300'}`}>
            System
          </button>
        </div>

        {tab === 'offer' ? (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required placeholder="Offer Title (e.g. 100GB)" className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 outline-none focus:border-primary transition-all font-bold text-sm" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <select className="px-5 py-4 rounded-2xl border-2 border-slate-50 outline-none focus:border-primary font-bold appearance-none bg-slate-50 text-xs" value={formData.operator} onChange={e => setFormData({...formData, operator: e.target.value})}>
                  {operators.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
                </select>
                <select className="px-5 py-4 rounded-2xl border-2 border-slate-50 outline-none focus:border-primary font-bold appearance-none bg-slate-50 text-xs" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="drive">Drive</option>
                  <option value="regular">Regular</option>
                </select>
              </div>
              <select className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 outline-none focus:border-primary font-bold appearance-none bg-slate-50 text-xs" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option value="internet">ইন্টারনেট (Internet)</option>
                <option value="minute">মিনিট (Minute)</option>
                <option value="bundle">ব্যান্ডেল (Bundle)</option>
              </select>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-2 rounded-2xl">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-3 mb-1 block">Regular Price</label>
                  <input required type="number" placeholder="৳" className="w-full px-3 py-2 bg-transparent outline-none font-black text-primary text-xl" value={formData.regularPrice} onChange={e => setFormData({...formData, regularPrice: e.target.value})} />
                </div>
                <div className="bg-emerald-50 p-2 rounded-2xl">
                  <label className="text-[9px] font-black text-emerald-400 uppercase ml-3 mb-1 block">Commission</label>
                  <input required type="number" placeholder="৳" className="w-full px-3 py-2 bg-transparent outline-none font-black text-emerald-600 text-xl" value={formData.commission} onChange={e => setFormData({...formData, commission: e.target.value})} />
                </div>
              </div>
              <div className="p-4 bg-slate-900 rounded-3xl flex justify-between items-center text-white">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Offer Net Price:</span>
                <span className="text-2xl font-black">৳{(parseFloat(formData.regularPrice) || 0) - (parseFloat(formData.commission) || 0)}</span>
              </div>
              <textarea placeholder="Details..." className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 outline-none focus:border-primary font-bold text-sm" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              
              <div className="flex items-center justify-between px-2 bg-slate-50 p-4 rounded-3xl">
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Offer Status</span>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                  className={`w-14 h-7 rounded-full relative transition-all duration-300 ${formData.isActive ? 'bg-primary' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${formData.isActive ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              <button type="submit" className="w-full bg-primary text-white font-black py-5 rounded-[24px] shadow-xl shadow-primary/30 uppercase tracking-widest active:scale-95 transition-all">
                {editingOffer ? 'Update Offer' : 'Publish Live'}
              </button>
            </form>
            
            <div className="mt-10 space-y-4 pt-10 border-t border-slate-50">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Assets</h3>
                  <select 
                    className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1 text-[10px] font-black uppercase text-primary outline-none"
                    value={manageOperator} 
                    onChange={e => setManageOperator(e.target.value)}
                  >
                    {operators.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
                  </select>
                </div>
                
                <div className="flex gap-2">
                  <button onClick={() => handleBulkStatus(true)} className="flex-1 bg-emerald-50 text-emerald-600 text-[8px] font-black py-2 rounded-xl border border-emerald-100 uppercase tracking-widest">Activate All</button>
                  <button onClick={() => handleBulkStatus(false)} className="flex-1 bg-rose-50 text-rose-600 text-[8px] font-black py-2 rounded-xl border border-rose-100 uppercase tracking-widest">Offline All</button>
                </div>
              </div>

              <div className="space-y-2">
                {offers.filter(o => o.operator === manageOperator).map(o => (
                  <div key={o.id} className={`bg-slate-50 p-4 rounded-2xl flex items-center justify-between border transition-all ${selectedOfferIds.includes(o.id) ? 'border-primary bg-primary/5' : 'border-slate-100'}`}>
                    <div className="flex items-center gap-3 flex-1">
                      <input 
                        type="checkbox" 
                        checked={selectedOfferIds.includes(o.id)} 
                        onChange={() => setSelectedOfferIds(prev => prev.includes(o.id) ? prev.filter(id => id !== o.id) : [...prev, o.id])}
                        className="w-4 h-4 rounded border-slate-200 text-primary focus:ring-primary"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-slate-800 line-clamp-1">{o.title}</span>
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${o.isActive !== false ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                            {o.isActive !== false ? 'Active' : 'Offline'}
                          </span>
                        </div>
                        <p className="text-[9px] font-bold text-slate-400">৳{o.regularPrice || o.price} | Com: ৳{o.commission || 0}</p>
                      </div>
                    </div>
                    <button onClick={() => { setEditingOffer(o); setTab('offer'); }} className="p-2 text-slate-400 hover:text-blue-500 transition-colors">
                      <Plus size={14} className="rotate-45" />
                    </button>
                  </div>
                ))}
                {offers.filter(o => o.operator === manageOperator).length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">No existing offers for {manageOperator}</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <form onSubmit={handleSettingsSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">App Name</label>
              <input required className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 outline-none focus:border-primary font-bold text-sm" value={systemSettings.appName} onChange={e => setSystemSettings({...systemSettings, appName: e.target.value})} />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Admin Email</label>
              <input required type="email" className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 outline-none focus:border-primary font-bold text-sm" value={systemSettings.adminEmail} onChange={e => setSystemSettings({...systemSettings, adminEmail: e.target.value})} />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">New Password (Optional)</label>
              <input type="password" placeholder="Leave blank to keep current" className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 outline-none focus:border-primary font-bold text-sm" value={systemSettings.adminPassword} onChange={e => setSystemSettings({...systemSettings, adminPassword: e.target.value})} />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Theme Color (Hex)</label>
              <div className="flex gap-4 items-center">
                <input required type="text" className="flex-1 px-5 py-4 rounded-2xl border-2 border-slate-50 outline-none focus:border-primary font-bold text-sm" value={systemSettings.primaryColor} onChange={e => setSystemSettings({...systemSettings, primaryColor: e.target.value})} />
                <div className="w-12 h-12 rounded-xl border-2 border-slate-100 shadow-sm" style={{ backgroundColor: systemSettings.primaryColor }} />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Logo URL</label>
              <input required className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 outline-none focus:border-primary font-bold text-sm" value={systemSettings.logoUrl} onChange={e => setSystemSettings({...systemSettings, logoUrl: e.target.value})} />
            </div>
            <div className="flex items-center justify-between px-2 bg-slate-50 p-4 rounded-3xl">
              <div>
                <span className="text-xs font-black text-slate-800 uppercase tracking-widest block">Dual Balance System</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Enable Main & Drive balances</span>
              </div>
              <button 
                type="button"
                onClick={() => setSystemSettings({...systemSettings, isDualBalanceEnabled: !systemSettings.isDualBalanceEnabled})}
                className={`w-14 h-7 rounded-full relative transition-all duration-300 ${systemSettings.isDualBalanceEnabled ? 'bg-primary' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${systemSettings.isDualBalanceEnabled ? 'right-1' : 'left-1'}`} />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-3xl space-y-4">
              <span className="text-xs font-black text-slate-800 uppercase tracking-widest block px-1">Social Links</span>
              <input placeholder="WhatsApp URL" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold" value={systemSettings.whatsapp} onChange={e => setSystemSettings({...systemSettings, whatsapp: e.target.value})} />
              <input placeholder="Telegram URL" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold" value={systemSettings.telegram} onChange={e => setSystemSettings({...systemSettings, telegram: e.target.value})} />
              <input placeholder="YouTube URL" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold" value={systemSettings.youtube} onChange={e => setSystemSettings({...systemSettings, youtube: e.target.value})} />
              <input placeholder="Shopping URL" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold" value={systemSettings.shopping} onChange={e => setSystemSettings({...systemSettings, shopping: e.target.value})} />
            </div>

            <div className="bg-emerald-50 p-4 rounded-3xl">
              <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-2 px-1">Global Main Balance Commission (%)</label>
              <input type="number" step="0.01" className="w-full px-5 py-4 rounded-2xl border-2 border-emerald-100 outline-none focus:border-primary font-black text-emerald-700 bg-white" value={systemSettings.mainBalanceCommission} onChange={e => setSystemSettings({...systemSettings, mainBalanceCommission: parseFloat(e.target.value) || 0})} />
              <p className="text-[8px] font-bold text-emerald-600/60 mt-2 px-1">Used if level commission is 0</p>
            </div>
            
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest px-1">Level Management</h3>
              {Object.entries(levelSettings).map(([level, config]: [string, any]) => (
                <div key={level} className="bg-slate-50 p-5 rounded-3xl space-y-4 border border-slate-100">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{level}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Configuration</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Main Com %</label>
                      <input 
                        type="number" 
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-black" 
                        value={config.mainCommission} 
                        onChange={e => setLevelSettings({...levelSettings, [level]: {...config, mainCommission: parseFloat(e.target.value) || 0}})} 
                      />
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Drive Com %</label>
                      <input 
                        type="number" 
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-black" 
                        value={config.driveCommission} 
                        onChange={e => setLevelSettings({...levelSettings, [level]: {...config, driveCommission: parseFloat(e.target.value) || 0}})} 
                      />
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Cost (৳)</label>
                      <input 
                        type="number" 
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-black" 
                        value={config.registrationCost} 
                        onChange={e => setLevelSettings({...levelSettings, [level]: {...config, registrationCost: parseFloat(e.target.value) || 0}})} 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button type="submit" className="w-full bg-primary text-white font-black py-5 rounded-[24px] shadow-xl shadow-primary/30 uppercase tracking-widest active:scale-95 transition-all mt-4">Save Changes</button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

const BillPaymentModal = ({ type, label, onClose }: { type: string, label: string, onClose: () => void }) => {
  const { user, profile } = useAuth();
  const [formData, setFormData] = useState({ number: '', amount: '', note: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    const amount = parseFloat(formData.amount);
    const currentMainBalance = profile.mainBalance ?? profile.balance ?? 0;
    
    if (currentMainBalance < amount) {
      alert('Insufficient balance!');
      return;
    }

    setLoading(true);
    try {
      await setDoc(doc(db, 'users', user.uid), { 
        mainBalance: currentMainBalance - amount,
        balance: currentMainBalance - amount 
      }, { merge: true });
      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        userName: profile.displayName,
        userPhone: profile.phoneNumber,
        type: 'bill_payment',
        balanceType: 'mainBalance',
        serviceType: type,
        serviceLabel: label,
        targetNumber: formData.number,
        amount: amount,
        note: formData.note,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      alert(`${label} request submitted successfully!`);
      onClose();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'transactions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[40px] w-full max-w-sm p-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
        <h2 className="text-xl font-black mb-1 uppercase tracking-tight text-slate-800">{label}</h2>
        <p className="text-[10px] font-bold text-slate-400 mb-6 uppercase tracking-widest">Premium Payment Service</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-left">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Account / Phone No</label>
            <input required placeholder="Enter details..." className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 outline-none focus:border-primary font-bold text-sm" value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} />
          </div>
          <div className="text-left">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Amount</label>
            <div className="relative">
               <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 font-bold">৳</span>
               <input required type="number" placeholder="0.00" className="w-full pl-10 pr-5 py-4 rounded-2xl border-2 border-slate-50 outline-none focus:border-primary font-black text-lg text-primary" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
            </div>
          </div>
          <div className="text-left">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Reference / Note (Optional)</label>
            <input placeholder="Personal / Bill ID" className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 outline-none focus:border-primary font-bold text-sm" value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} />
          </div>
          <button disabled={loading} type="submit" className="w-full bg-primary text-white font-black py-5 rounded-[24px] shadow-xl shadow-primary/30 uppercase tracking-widest active:scale-95 transition-all mt-2 disabled:opacity-50">
            {loading ? 'Processing...' : `Submit ${label}`}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const PurchaseModal = ({ offer, balance, onClose, onConfirm }: { offer: any, balance: number, onClose: () => void, onConfirm: (number: string) => void }) => {
  const [number, setNumber] = useState('');
  const netPrice = offer.netPrice || offer.price;
  const isInsufficient = balance < netPrice;
  
  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[40px] w-full max-w-sm p-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
        <h2 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tight">Enter Number</h2>
        <p className="text-[10px] font-bold text-slate-400 mb-6 uppercase tracking-widest">Recipient Mobile Number</p>
        
        <div className="space-y-6">
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
             <input 
              autoFocus
              type="tel" 
              placeholder="017XXXXXXXX" 
              className="w-full bg-transparent outline-none font-black text-2xl text-center tracking-widest text-primary" 
              value={number} 
              onChange={e => setNumber(e.target.value)} 
             />
          </div>
          
          <div className="bg-slate-900 rounded-3xl p-5 text-white">
            <div className="flex justify-between text-[10px] font-black uppercase opacity-50 mb-1">
              <span>Offer</span>
              <span>Price</span>
            </div>
            <div className="flex justify-between font-black">
              <span className="truncate max-w-[150px]">{offer.title}</span>
              <span>৳{netPrice}</span>
            </div>
            <div className="mt-3 pt-3 border-t border-white/10 flex justify-between items-center">
              <span className="text-[10px] font-black uppercase opacity-50">Your Balance</span>
              <span className={`font-black ${isInsufficient ? 'text-red-400' : 'text-emerald-400'}`}>৳{balance}</span>
            </div>
          </div>

          {isInsufficient && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-50 border border-red-100 rounded-2xl">
              <p className="text-red-500 text-[10px] font-black uppercase text-center">Insufficient Balance! Please top up.</p>
            </motion.div>
          )}
          
          <button 
            disabled={number.length < 11 || isInsufficient}
            onClick={() => onConfirm(number)} 
            className="w-full bg-primary text-white font-black py-5 rounded-[24px] shadow-xl shadow-primary/30 uppercase tracking-widest active:scale-95 transition-all disabled:opacity-30"
          >
            {isInsufficient ? 'Low Balance' : 'Confirm Purchase'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const TransactionHistoryModal = ({ onClose }: { onClose: () => void }) => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'transactions'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (s) => {
      setLogs(s.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'transactions'));
    return unsub;
  }, [user]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[40px] w-full max-w-md p-8 shadow-2xl relative h-[70vh] flex flex-col">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
        <h2 className="text-xl font-black mb-1 uppercase tracking-tight text-slate-800">History</h2>
        <p className="text-[10px] font-bold text-slate-400 mb-6 uppercase tracking-widest">My Transaction Records</p>
        
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-none">
          {loading ? (
            <div className="flex justify-center py-10"><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>
          ) : logs.length === 0 ? (
            <div className="text-center py-20">
               <History size={48} className="mx-auto text-slate-100 mb-4" />
               <p className="text-xs font-bold text-slate-300 uppercase tracking-widest italic">No history found</p>
            </div>
          ) : logs.map(log => (
            <div key={log.id} className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-slate-800">{log.offerTitle || log.serviceLabel || (log.operator ? `${log.operator} Recharge` : 'Transaction')}</h4>
                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{log.targetNumber || 'System'}</p>
                <p className="text-[8px] font-bold text-slate-300 mt-1 uppercase tracking-tighter">
                  {log.createdAt?.toDate().toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-primary block">৳{log.amount}</span>
                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest inline-block mt-1 ${
                  log.status === 'success' ? 'bg-emerald-100 text-emerald-600' :
                  log.status === 'failed' ? 'bg-rose-100 text-rose-600' :
                  'bg-amber-100 text-amber-600'
                }`}>
                  {log.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

const MobileRechargeModal = ({ onClose }: { onClose: () => void }) => {
  const { user, profile } = useAuth();
  const [formData, setFormData] = useState({ number: '', amount: '', operator: 'GP', type: 'Prepaid' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    const amount = parseFloat(formData.amount);
    const currentMainBalance = profile.mainBalance ?? profile.balance ?? 0;
    
    if (currentMainBalance < amount) {
      alert('Insufficient balance!');
      return;
    }

    setLoading(true);
    try {
      await setDoc(doc(db, 'users', user.uid), { 
        mainBalance: currentMainBalance - amount,
        balance: currentMainBalance - amount 
      }, { merge: true });
      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        userName: profile.displayName,
        userPhone: profile.phoneNumber,
        type: 'recharge',
        balanceType: 'mainBalance',
        operator: formData.operator,
        targetNumber: formData.number,
        amount: amount,
        rechargeType: formData.type,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      alert('Recharge request submitted successfully!');
      onClose();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'transactions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[40px] w-full max-w-sm p-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
        <h2 className="text-xl font-black mb-1 uppercase tracking-tight text-slate-800">Mobile Recharge</h2>
        <p className="text-[10px] font-bold text-slate-400 mb-6 uppercase tracking-widest">Instant Top-up Service</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-left">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Mobile Number</label>
            <input required placeholder="01XXXXXXXXX" className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 outline-none focus:border-primary font-bold text-sm" value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4 text-left">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Operator</label>
              <select className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 outline-none focus:border-primary font-bold appearance-none bg-slate-50 text-xs" value={formData.operator} onChange={e => setFormData({...formData, operator: e.target.value})}>
                {operators.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Type</label>
              <select className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 outline-none focus:border-primary font-bold appearance-none bg-slate-50 text-xs" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option value="Prepaid">Prepaid</option>
                <option value="Postpaid">Postpaid</option>
                <option value="Skitto">Skitto</option>
              </select>
            </div>
          </div>
          <div className="text-left">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Amount</label>
            <div className="relative">
               <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 font-bold">৳</span>
               <input required type="number" placeholder="0.00" className="w-full pl-10 pr-5 py-4 rounded-2xl border-2 border-slate-50 outline-none focus:border-primary font-black text-lg text-primary" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
            </div>
          </div>
          <button disabled={loading} type="submit" className="w-full bg-primary text-white font-black py-5 rounded-[24px] shadow-xl shadow-primary/30 uppercase tracking-widest active:scale-95 transition-all mt-2 disabled:opacity-50">
            {loading ? 'Processing...' : 'Recharge Now'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const ChatModal = ({ user, onClose }: { user: any, onClose: () => void }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'chats'), 
      where('userId', '==', user.uid), 
      orderBy('createdAt', 'asc')
    );
    const unsub = onSnapshot(q, (s) => {
      setMessages(s.docs.map(d => ({ id: d.id, ...d.data() })));
      setTimeout(() => scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight), 100);
    });
    return unsub;
  }, [user.uid]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      await addDoc(collection(db, 'chats'), {
        userId: user.uid,
        userName: user.displayName,
        text: newMessage,
        isAdmin: !!user.isAdmin,
        createdAt: serverTimestamp()
      });
      setNewMessage('');
    } catch (error) { console.error(error); }
  };

  return (
    <div className="fixed inset-0 z-[160] flex flex-col bg-white md:max-w-md md:mx-auto md:shadow-2xl">
      <div className="bg-primary p-6 text-white flex justify-between items-center rounded-b-[40px]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-black">?</div>
          <div>
            <h3 className="font-black text-sm uppercase tracking-tight">Live Support</h3>
            <p className="text-[10px] opacity-70">Always Online</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.isAdmin ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[80%] p-4 rounded-3xl text-sm font-bold ${m.isAdmin ? 'bg-slate-100 text-slate-800 rounded-bl-none' : 'bg-primary text-white rounded-br-none'}`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="p-6 border-t border-slate-100 flex gap-3">
        <input 
          placeholder="Type message..." 
          className="flex-1 bg-slate-50 rounded-2xl px-6 py-4 outline-none focus:ring-2 ring-primary/20 font-bold" 
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
        />
        <button type="submit" className="bg-primary text-white p-4 rounded-2xl shadow-lg active:scale-90 transition-transform"><CheckCircle2 /></button>
      </form>
    </div>
  );
};

const SendMoneyModal = ({ onClose }: { onClose: () => void }) => {
  const { user, profile } = useAuth();
  const [formData, setFormData] = useState({ targetNumber: '', amount: '', pin: '' });
  const [loading, setLoading] = useState(false);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    if (formData.pin !== profile.pin) return alert('Invalid PIN');
    
    const amount = parseFloat(formData.amount);
    const balanceKey = 'mainBalance';
    const currentBalance = profile[balanceKey] ?? profile.balance ?? 0;

    if (currentBalance < amount) return alert('Insufficient Balance');

    setLoading(true);
    try {
      const q = query(collection(db, 'users'), where('phoneNumber', '==', formData.targetNumber));
      const s = await getDocs(q);
      if (s.empty) throw new Error('Recipient not found');
      const recipient = { id: s.docs[0].id, ...s.docs[0].data() as any };

      const senderUpdates: any = { [balanceKey]: currentBalance - amount };
      if (balanceKey === 'mainBalance') senderUpdates.balance = currentBalance - amount;
      await setDoc(doc(db, 'users', user.uid), senderUpdates, { merge: true });

      const recBalance = recipient[balanceKey] ?? recipient.balance ?? 0;
      const recUpdates: any = { [balanceKey]: recBalance + amount };
      if (balanceKey === 'mainBalance') recUpdates.balance = recBalance + amount;
      await setDoc(doc(db, 'users', recipient.id), recUpdates, { merge: true });

      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        type: 'send-money',
        amount,
        recipient: formData.targetNumber,
        status: 'success',
        createdAt: serverTimestamp()
      });

      alert('Money Transferred Successfully!');
      onClose();
    } catch (err: any) { alert(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[40px] w-full max-w-md p-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
        <h2 className="text-xl font-black mb-1 uppercase tracking-tight text-slate-800">Send Money</h2>
        <p className="text-[10px] font-bold text-slate-400 mb-8 uppercase tracking-widest">Main Balance Transfer</p>

        <form onSubmit={handleTransfer} className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Recipient Number</label>
            <input required placeholder="017XXXXXXXX" className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 outline-none focus:border-primary font-bold text-sm" value={formData.targetNumber} onChange={e => setFormData({...formData, targetNumber: e.target.value})} />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Amount (৳)</label>
            <input required type="number" placeholder="500" className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 outline-none focus:border-primary font-black text-primary text-xl" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Your PIN</label>
            <input required type="password" maxLength={4} placeholder="••••" className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 outline-none focus:border-primary font-black tracking-[1em] text-center" value={formData.pin} onChange={e => setFormData({...formData, pin: e.target.value.replace(/\D/g, '')})} />
          </div>
          <button disabled={loading} type="submit" className="w-full bg-primary text-white font-black py-5 rounded-[24px] shadow-xl shadow-primary/30 uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50">
            {loading ? 'Processing...' : 'Transfer Now'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const UserManagementModal = ({ onClose, defaultTab = 'list' }: { onClose: () => void, defaultTab?: 'list' | 'add' }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [tab, setTab] = useState(defaultTab);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({ displayName: '', phoneNumber: '', balance: '', mainBalance: '', driveBalance: '', level: 'user', pin: '' });
  const [addFormData, setAddFormData] = useState({ username: '', phoneNumber: '', displayName: '', pin: '', level: 'retailer' });
  const { settings } = useSystem();

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'users'));
    return () => unsubscribe();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const mb = parseFloat(editFormData.mainBalance.toString()) || 0;
      const db_val = parseFloat(editFormData.driveBalance.toString()) || 0;
      
      await setDoc(doc(db, 'users', editingUser.id), { 
        ...editFormData, 
        mainBalance: mb,
        driveBalance: db_val,
        balance: mb 
      }, { merge: true });
      setEditingUser(null);
    } catch (error) { handleFirestoreError(error, OperationType.UPDATE, `users/${editingUser.id}`); }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const q = query(collection(db, 'users'), where('phoneNumber', '==', addFormData.phoneNumber));
      const s = await getDocs(q);
      if (!s.empty) throw new Error('Phone number already registered');

      await addDoc(collection(db, 'users'), {
        ...addFormData,
        username: addFormData.username || addFormData.phoneNumber,
        uid: '', 
        balance: 0,
        mainBalance: 0,
        driveBalance: 0,
        isAdmin: false,
        createdAt: serverTimestamp()
      });
      alert('User added to records. Note: User must still register with this phone number to access account.');
      setTab('list');
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[40px] w-full max-w-md h-[85vh] flex flex-col p-8 shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-black uppercase tracking-tight">Admin | User Manager</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
        </div>

        <div className="flex gap-4 mb-6 bg-slate-50 p-1.5 rounded-2xl">
          <button onClick={() => { setTab('list'); setEditingUser(null); }} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${tab === 'list' ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`}>User List</button>
          <button onClick={() => { setTab('add'); setEditingUser(null); }} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${tab === 'add' ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`}>Add User</button>
        </div>

        {editingUser ? (
          <form onSubmit={handleUpdate} className="flex-1 overflow-y-auto space-y-6 pr-1 scrollbar-none">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Full Name</label>
              <input className="w-full px-5 py-4 border-2 border-slate-50 rounded-2xl font-bold" value={editFormData.displayName} onChange={e => setEditFormData({...editFormData, displayName: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Phone</label>
                <input className="w-full px-5 py-4 border-2 border-slate-50 rounded-2xl font-bold" value={editFormData.phoneNumber} onChange={e => setEditFormData({...editFormData, phoneNumber: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Main Balance</label>
                <input type="number" className="w-full px-5 py-4 border-2 border-slate-50 rounded-2xl font-black text-primary" value={editFormData.mainBalance} onChange={e => setEditFormData({...editFormData, mainBalance: e.target.value})} />
              </div>
            </div>
            {settings.isDualBalanceEnabled && (
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Drive Balance</label>
                <input type="number" className="w-full px-5 py-4 border-2 border-slate-50 rounded-2xl font-black text-rose-500" value={editFormData.driveBalance} onChange={e => setEditFormData({...editFormData, driveBalance: e.target.value})} />
              </div>
            )}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Reset PIN (4 Digits)</label>
              <input className="w-full px-5 py-4 border-2 border-slate-50 rounded-2xl font-black tracking-[1em] text-center" maxLength={4} value={editFormData.pin} onChange={e => setEditFormData({...editFormData, pin: e.target.value.replace(/\D/g, '')})} />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Member Class</label>
              <select className="w-full px-5 py-4 border-2 border-slate-50 rounded-2xl font-black appearance-none bg-slate-50" value={editFormData.level} onChange={e => setEditFormData({...editFormData, level: e.target.value})}>
                <option value="user">USER</option>
                <option value="reseller">RESELLER</option>
                <option value="dealer">DEALER</option>
                <option value="vip-parent">VIP PARENT</option>
              </select>
            </div>
            <div className="flex gap-4 pt-6">
              <button type="button" onClick={() => setEditingUser(null)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold">CANCEL</button>
              <button type="submit" className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black tracking-widest shadow-lg shadow-primary/20">SAVE</button>
            </div>
          </form>
        ) : tab === 'add' ? (
          <form onSubmit={handleAddUser} className="flex-1 overflow-y-auto space-y-6 pr-1 scrollbar-none">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block text-primary">Display Name</label>
              <input required placeholder="Full Name" className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 outline-none focus:border-primary font-bold text-sm" value={addFormData.displayName} onChange={e => setAddFormData({...addFormData, displayName: e.target.value})} />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Phone Number</label>
              <input required placeholder="017XXXXXXXX" className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 outline-none focus:border-primary font-bold text-sm tracking-wide" value={addFormData.phoneNumber} onChange={e => setAddFormData({...addFormData, phoneNumber: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Set PIN</label>
                <input required placeholder="4 Digits" maxLength={4} className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 outline-none focus:border-primary font-black tracking-widest text-center" value={addFormData.pin} onChange={e => setAddFormData({...addFormData, pin: e.target.value.replace(/\D/g, '')})} />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Level</label>
                <select className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 outline-none focus:border-primary font-bold appearance-none bg-slate-50 text-xs" value={addFormData.level} onChange={e => setAddFormData({...addFormData, level: e.target.value})}>
                  <option value="retailer">Retailer</option>
                  <option value="dealer">Dealer</option>
                  <option value="reseller">Reseller</option>
                  <option value="sub-admin">Sub-Admin</option>
                </select>
              </div>
            </div>
            <button type="submit" className="w-full bg-primary text-white font-black py-5 rounded-[24px] shadow-xl shadow-primary/30 uppercase tracking-widest active:scale-95 transition-all mt-4">Create Account</button>
            <p className="text-[9px] font-medium text-slate-400 text-center uppercase tracking-tighter px-4">After creation, user should register with this phone number to access.</p>
          </form>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-none">
            {loading ? <p className="text-center py-10 opacity-30 text-xs font-black uppercase">Scanning Network...</p> : users.map(user => (
              <div key={user.id} className="bg-slate-50/50 p-5 rounded-[24px] flex items-center justify-between border-2 border-slate-50 hover:border-primary/20 transition-all">
                <div className="max-w-[70%]">
                  <p className="font-black text-slate-800 text-sm leading-tight truncate">{user.displayName}</p>
                  <p className="text-[10px] text-cyan-500 font-black mt-0.5">{user.phoneNumber || 'NO PHONE'}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[9px] font-black bg-white border border-slate-200 px-1.5 py-0.5 rounded text-orange-500 uppercase tracking-widest">{user.level || 'user'}</span>
                    <span className="text-xs font-black text-primary">Main: ৳{user.mainBalance ?? user.balance ?? 0}</span>
                    {settings.isDualBalanceEnabled && <span className="text-xs font-black text-rose-500">Drive: ৳{user.driveBalance ?? 0}</span>}
                  </div>
                </div>
                <button onClick={() => { setEditingUser(user); setEditFormData({ displayName: user.displayName, phoneNumber: user.phoneNumber, balance: user.balance?.toString(), mainBalance: (user.mainBalance ?? user.balance ?? 0).toString(), driveBalance: (user.driveBalance ?? 0).toString(), level: user.level, pin: user.pin }); }} className="bg-white shadow-sm border border-slate-100 px-4 py-2.5 rounded-xl text-[10px] font-black text-primary uppercase">Manage</button>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

const NoticeConfigModal = ({ onClose }: { onClose: () => void }) => {
  const [data, setData] = useState({ notice: '', loginNotice: '' });
  
  useEffect(() => {
    getDoc(doc(db, 'configs', 'global')).then(s => s.exists() && setData(s.data() as any));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'configs', 'global'), data, { merge: true });
      onClose();
    } catch (error) { handleFirestoreError(error, OperationType.UPDATE, 'configs'); }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[40px] w-full max-w-sm p-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
        <h2 className="text-xl font-black mb-8 uppercase tracking-tight">Notice Board</h2>
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Home Alert Notice</label>
            <textarea className="w-full px-5 py-4 border-2 border-slate-50 rounded-2xl font-bold h-24" value={data.notice} onChange={e => setData({...data, notice: e.target.value})} />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Login Page Notice</label>
            <textarea className="w-full px-5 py-4 border-2 border-slate-50 rounded-2xl font-bold h-24" value={data.loginNotice} onChange={e => setData({...data, loginNotice: e.target.value})} />
          </div>
          <button type="submit" className="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-all">Update Notices</button>
        </form>
      </motion.div>
    </div>
  );
};

const PaymentConfigModal = ({ onClose }: { onClose: () => void }) => {
  const [data, setData] = useState({ bkash: '', nagad: '', rocket: '' });
  
  useEffect(() => {
    getDoc(doc(db, 'configs', 'global')).then(s => s.exists() && setData(s.data() as any));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'configs', 'global'), data, { merge: true });
      onClose();
    } catch (error) { handleFirestoreError(error, OperationType.UPDATE, 'configs'); }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[40px] w-full max-w-sm p-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
        <h2 className="text-xl font-black mb-8 uppercase tracking-tight">Payment Setup</h2>
        <form onSubmit={handleSave} className="space-y-6">
          {['bkash', 'nagad', 'rocket'].map(key => (
            <div key={key}>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block capitalize">{key} Personal Number</label>
              <input className="w-full px-5 py-4 border-2 border-slate-50 rounded-2xl font-black" value={(data as any)[key]} onChange={e => setData({...data, [key]: e.target.value})} />
            </div>
          ))}
          <button type="submit" className="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-all">Update Cloud Nos.</button>
        </form>
      </motion.div>
    </div>
  );
};

const DesignConfigModal = ({ onClose }: { onClose: () => void }) => {
  const [data, setData] = useState({ logoUrl: '', banners: [] as string[], whatsapp: '', telegram: '', youtube: '', shopping: '' });
  const [newBanner, setNewBanner] = useState('');
  
  useEffect(() => {
    getDoc(doc(db, 'configs', 'global')).then(s => s.exists() && setData(s.data() as any));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'configs', 'global'), data, { merge: true });
      onClose();
    } catch (error) { handleFirestoreError(error, OperationType.UPDATE, 'configs'); }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[40px] w-full max-w-md p-8 shadow-2xl relative h-[85vh] flex flex-col">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
        <h2 className="text-xl font-black mb-8 uppercase tracking-tight">Social & Branding</h2>
        
        <div className="flex-1 overflow-y-auto space-y-8 scrollbar-none pr-1 pb-6">
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company Assets</h3>
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Logo URL</label>
              <input className="w-full px-5 py-4 border-2 border-slate-50 rounded-2xl font-bold text-xs" value={data.logoUrl} onChange={e => setData({...data, logoUrl: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">WhatsApp Number</label>
                <input placeholder="88017..." className="w-full px-5 py-4 border-2 border-slate-50 rounded-2xl font-bold text-xs" value={data.whatsapp} onChange={e => setData({...data, whatsapp: e.target.value})} />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Telegram Link</label>
                <input placeholder="https://t.me/..." className="w-full px-5 py-4 border-2 border-slate-50 rounded-2xl font-bold text-xs" value={data.telegram} onChange={e => setData({...data, telegram: e.target.value})} />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">YouTube Channel</label>
                <input placeholder="https://youtube.com/..." className="w-full px-5 py-4 border-2 border-slate-50 rounded-2xl font-bold text-xs" value={data.youtube} onChange={e => setData({...data, youtube: e.target.value})} />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Shopping Site</label>
                <input placeholder="https://..." className="w-full px-5 py-4 border-2 border-slate-50 rounded-2xl font-bold text-xs" value={data.shopping} onChange={e => setData({...data, shopping: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="border-t pt-8">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-4 block">Promo Banners ({data.banners?.length}/10)</label>
            <div className="flex gap-2 mb-6">
              <input placeholder="Enter Image URL" className="flex-1 bg-slate-50 rounded-2xl px-5 py-4 text-xs font-bold border-2 border-transparent focus:border-primary/20 outline-none" value={newBanner} onChange={e => setNewBanner(e.target.value)} />
              <button 
                type="button" 
                onClick={() => { if(newBanner) { setData({...data, banners: [...(data.banners || []), newBanner]}); setNewBanner(''); } }} 
                className="bg-primary text-white p-4 rounded-2xl shadow-lg active:scale-90 transition-transform"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {data.banners?.map((url, i) => (
                <div key={i} className="relative aspect-[21/9] rounded-3xl overflow-hidden group border-4 border-slate-50 shadow-sm">
                  <img src={url} className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => setData({...data, banners: data.banners.filter((_, idx) => idx !== i)})} 
                    className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t">
          <button onClick={handleSave} className="w-full bg-primary text-white font-black py-5 rounded-[24px] shadow-2xl active:scale-95 transition-all uppercase tracking-widest">Update Cloud Assets</button>
        </div>
      </motion.div>
    </div>
  );
};

const PricingConfigModal = ({ onClose }: { onClose: () => void }) => {
  const [levelConfigs, setLevelConfigs] = useState<any>({});
  
  useEffect(() => {
    getDoc(doc(db, 'configs', 'levels')).then(s => {
      if (s.exists()) setLevelConfigs(s.data());
      else setLevelConfigs(LEVELS.reduce((acc, curr) => ({ ...acc, [curr.id]: { charge: 0, commission: 0 } }), {}));
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'configs', 'levels'), levelConfigs);
      onClose();
    } catch (error) { handleFirestoreError(error, OperationType.UPDATE, 'configs'); }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[40px] w-full max-w-sm p-8 shadow-2xl relative h-[80vh] flex flex-col">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
        <h2 className="text-xl font-black mb-8 uppercase tracking-tight">Pricing & Comm</h2>
        <form onSubmit={handleSave} className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 scrollbar-none pb-6">
            {LEVELS.map(l => (
              <div key={l.id} className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-3 ml-1">{l.name} Configuration</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-2xl border border-slate-100">
                    <label className="text-[8px] font-black text-slate-300 uppercase tracking-widest block mb-1">Charge (৳)</label>
                    <input type="number" className="w-full text-sm font-black outline-none" value={levelConfigs[l.id]?.charge || 0} onChange={e => setLevelConfigs({...levelConfigs, [l.id]: { ...levelConfigs[l.id], charge: parseFloat(e.target.value) }})} />
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-slate-100">
                    <label className="text-[8px] font-black text-slate-300 uppercase tracking-widest block mb-1">Comm (%)</label>
                    <input type="number" step="0.01" className="w-full text-sm font-black outline-none" value={levelConfigs[l.id]?.commission || 0} onChange={e => setLevelConfigs({...levelConfigs, [l.id]: { ...levelConfigs[l.id], commission: parseFloat(e.target.value) }})} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button type="submit" className="w-full bg-slate-900 text-white font-black py-5 rounded-[24px] shadow-2xl uppercase tracking-widest active:scale-95 transition-all mt-4">Update All Levels</button>
        </form>
      </motion.div>
    </div>
  );
};
const AdminChatModal = ({ onClose }: { onClose: () => void }) => {
  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any | null>(null);

  useEffect(() => {
    // Group chats by userId to show a list of active users
    const unsub = onSnapshot(collection(db, 'chats'), (s) => {
      const allMsgs = s.docs.map(d => ({ id: d.id, ...d.data() }));
      const userGroups: Record<string, any> = {};
      allMsgs.forEach((m: any) => {
        if (!userGroups[m.userId] || (m.createdAt?.toMillis() || 0) > (userGroups[m.userId].lastAt || 0)) {
          userGroups[m.userId] = { 
            userId: m.userId, 
            userName: m.userName, 
            lastMsg: m.text, 
            lastAt: m.createdAt?.toMillis() || 0 
          };
        }
      });
      setChats(Object.values(userGroups).sort((a,b) => b.lastAt - a.lastAt));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'chats'));
    return unsub;
  }, []);

  return (
    <div className="fixed inset-0 z-[200] bg-white flex flex-col md:max-w-4xl md:mx-auto md:shadow-2xl">
      <div className="bg-slate-900 text-white p-6 flex justify-between items-center rounded-b-[40px]">
         <h2 className="text-xl font-black uppercase tracking-tight">Chat Support Center</h2>
         <button onClick={() => activeChat ? setActiveChat(null) : onClose()} className="p-2 hover:bg-white/10 rounded-full"><ArrowLeft /></button>
      </div>

      {!activeChat ? (
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {chats.map(c => (
            <div key={c.userId} onClick={() => setActiveChat({ uid: c.userId, displayName: c.userName })} className="bg-slate-50 p-6 rounded-[32px] flex items-center justify-between cursor-pointer hover:bg-slate-100 border border-slate-100 transition-all active:scale-95 shadow-sm">
               <div>
                  <h4 className="font-black text-slate-800 text-sm uppercase">{c.userName}</h4>
                  <p className="text-xs text-slate-500 font-bold truncate max-w-[200px] mt-1">{c.lastMsg}</p>
               </div>
               <div className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center text-primary"><MessageSquare size={18} /></div>
            </div>
          ))}
          {chats.length === 0 && <div className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest text-xs">No active chats</div>}
        </div>
      ) : (
        <ChatModal user={activeChat} onClose={() => setActiveChat(null)} />
      )}
    </div>
  );
};

const AutoRechargeModal = ({ onClose }: { onClose: () => void }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    targetNumber: '',
    amount: '',
    operator: 'GP',
    frequency: 'daily',
    threshold: '100',
    isActive: true
  });

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'autoRecharges'), where('userId', '==', user.uid));
    const unsub = onSnapshot(q, (s) => {
      setTasks(s.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await addDoc(collection(db, 'autoRecharges'), {
        ...formData,
        userId: user.uid,
        amount: parseFloat(formData.amount),
        threshold: formData.frequency === 'threshold' ? parseFloat(formData.threshold) : 0,
        createdAt: serverTimestamp(),
        lastRun: null
      });
      setIsAdding(false);
      setFormData({ targetNumber: '', amount: '', operator: 'GP', frequency: 'daily', threshold: '100', isActive: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'autoRecharges');
    }
  };

  const toggleTask = async (task: any) => {
    try {
      await setDoc(doc(db, 'autoRecharges', task.id), { isActive: !task.isActive }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'autoRecharges');
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'autoRecharges', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'autoRecharges');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[40px] w-full max-w-sm p-8 shadow-2xl relative max-h-[85vh] flex flex-col font-sans">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-all active:scale-90"><X size={20} /></button>
        <h2 className="text-xl font-black mb-6 uppercase tracking-tight flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-xl">
             <Repeat className="text-emerald-600" size={24} strokeWidth={3} />
          </div>
          Auto Recharge
        </h2>

        {!isAdding ? (
          <>
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-none pb-4">
              {tasks.length === 0 ? (
                <div className="text-center py-12 px-6 bg-slate-50/50 rounded-[32px] border border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Clock className="text-slate-300" size={28} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">No Auto Recharge<br/>Tasks Configured</p>
                </div>
              ) : (
                tasks.map(task => (
                  <div key={task.id} className="bg-white border-2 border-slate-50 p-5 rounded-[32px] relative group hover:border-emerald-100 transition-colors shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[8px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full uppercase tracking-widest">{task.operator}</span>
                          <span className="text-[8px] font-black bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-widest">{task.frequency}</span>
                        </div>
                        <h4 className="font-black text-slate-800 tracking-wider text-base">{task.targetNumber}</h4>
                      </div>
                      <button onClick={() => toggleTask(task)} className={`w-12 h-6 rounded-full relative transition-all duration-300 ${task.isActive ? 'bg-emerald-500' : 'bg-slate-200 shadow-inner'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${task.isActive ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-baseline gap-1">
                        <span className="text-slate-400 text-xs font-black">৳</span>
                        <span className="text-2xl font-black text-slate-900 tracking-tight">{task.amount}</span>
                      </div>
                      <button onClick={() => deleteTask(task.id)} className="w-8 h-8 flex items-center justify-center text-red-400 hover:bg-red-50 rounded-full transition-all active:scale-90">
                        <X size={16} strokeWidth={3} />
                      </button>
                    </div>
                    {task.frequency === 'threshold' && (
                       <div className="mt-3 pt-3 border-t border-slate-50 flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                         <Zap size={10} className="text-amber-500" />
                         Trigger below ৳{task.threshold}
                       </div>
                    )}
                  </div>
                ))
              )}
            </div>
            <div className="pt-4 border-t border-slate-100">
               <button onClick={() => setIsAdding(true)} className="w-full bg-primary text-white font-black py-5 rounded-[24px] shadow-xl shadow-primary/20 active:scale-95 transition-all uppercase tracking-widest text-xs">Setup New Task</button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSave} className="space-y-5 overflow-y-auto pr-1 scrollbar-none flex-1">
            <div className="bg-slate-50 p-4 rounded-3xl">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Mobile Number</label>
              <input required placeholder="01XXX XXXXXX" className="w-full bg-transparent outline-none font-black text-lg text-slate-800 placeholder:text-slate-300" value={formData.targetNumber} onChange={e => setFormData({...formData, targetNumber: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-3xl">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Amount</label>
                <div className="flex items-center gap-1">
                   <span className="font-black text-slate-300 text-lg">৳</span>
                   <input required type="number" placeholder="20" className="w-full bg-transparent outline-none font-black text-lg text-slate-800" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-3xl">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Operator</label>
                <select className="w-full bg-transparent outline-none font-black text-slate-800 appearance-none text-sm" value={formData.operator} onChange={e => setFormData({...formData, operator: e.target.value})}>
                  {operators.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
                </select>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-3xl">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Recurrance Mode</label>
              <select className="w-full bg-transparent outline-none font-black text-slate-800 appearance-none text-sm" value={formData.frequency} onChange={e => setFormData({...formData, frequency: e.target.value})}>
                <option value="threshold">Low Balance Alert</option>
                <option value="daily">Daily Schedule</option>
                <option value="weekly">Weekly Schedule</option>
                <option value="monthly">Monthly Schedule</option>
              </select>
            </div>
            {formData.frequency === 'threshold' && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-50 p-4 rounded-3xl border border-amber-100">
                <label className="text-[10px] font-black text-amber-600/60 uppercase tracking-widest ml-1 mb-2 block">Trigger at Threshold (৳)</label>
                <input required type="number" className="w-full bg-transparent outline-none font-black text-lg text-amber-900 font-mono" value={formData.threshold} onChange={e => setFormData({...formData, threshold: e.target.value})} />
              </motion.div>
            )}
            <div className="flex gap-4 pt-6">
              <button type="button" onClick={() => setIsAdding(false)} className="flex-1 bg-slate-50 text-slate-400 font-black py-5 rounded-[24px] uppercase tracking-widest text-xs active:scale-95 transition-all">Cancel</button>
              <button type="submit" className="flex-[2] bg-primary text-white font-black py-5 rounded-[24px] shadow-xl shadow-primary/20 active:scale-95 transition-all uppercase tracking-widest text-xs">Create Task</button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

const PinVerifyModal = ({ userPin, onSuccess, onClose }: { userPin: string, onSuccess: () => void, onClose: () => void }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === userPin) onSuccess();
    else { setError(true); setPin(''); setTimeout(() => setError(false), 1500); }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/80 backdrop-blur-lg p-6">
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-[48px] w-full max-w-xs p-10 shadow-2xl text-center border-t-4 border-primary relative">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} className="text-slate-300" /></button>
        <div className={`w-20 h-20 bg-slate-50 flex items-center justify-center mx-auto mb-8 rounded-full transition-all duration-300 ${error ? 'text-red-500 bg-red-50 animate-bounce' : 'text-primary border-4 border-slate-50 shadow-inner'}`}>
          {error ? <AlertCircle size={40} strokeWidth={3} /> : <Lock size={40} strokeWidth={3} />}
        </div>
        <h3 className="font-black text-2xl mb-2 tracking-tight">Access Gate</h3>
        <p className="text-xs font-bold text-slate-400 mb-10 px-2 leading-relaxed">Please Input Your Secret 4-Digit Security PIN.</p>
        <form onSubmit={handleVerify} className="space-y-8">
          <input autoFocus type="password" maxLength={4} className="w-full text-5xl font-black tracking-[0.5em] text-center border-b-4 border-slate-100 focus:border-primary outline-none py-4 transition-all" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ''))} />
          <div className="flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 font-black text-slate-300 py-3 uppercase tracking-widest text-[11px] hover:text-slate-500 transition-colors">Cancel</button>
            <button type="submit" className="flex-[3] bg-primary text-white font-black py-5 rounded-[24px] shadow-2xl shadow-primary/40 uppercase tracking-widest text-sm active:scale-95 transition-all">Verify</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const ProfileModal = ({ profile, onClose }: { profile: any, onClose: () => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ 
    displayName: profile?.displayName || '', 
    photoURL: profile?.photoURL || '' 
  });
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.uid) return;
    setLoading(true);
    try {
      await setDoc(doc(db, 'users', profile.uid), formData, { merge: true });
      setIsEditing(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${profile.uid}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 800000) {
      alert('ছবিটি অনেক বড়। দয়া করে ৮০০ কেবি এর নিচের ছবি দিন (Image too large, keep under 800KB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({ ...prev, photoURL: event.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[40px] w-full max-w-sm p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
        
        <div className="text-center space-y-6">
          <div className="relative w-24 h-24 mx-auto">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-50 shadow-lg relative group">
              <img 
                src={formData.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.uid}`} 
                alt="Avatar" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
              {isEditing && (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera className="text-white" size={24} />
                </button>
              )}
            </div>
            {isEditing && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 bg-primary text-white p-2 rounded-full shadow-lg border-2 border-white active:scale-90 transition-all"
              >
                <Camera size={14} />
              </button>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload} 
            />
          </div>

          {isEditing ? (
            <form onSubmit={handleUpdate} className="space-y-4 text-left">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Full Name</label>
                <input 
                  required 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold" 
                  value={formData.displayName} 
                  onChange={e => setFormData({...formData, displayName: e.target.value})} 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Photo URL (Optional)</label>
                <input 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold" 
                  placeholder="https://example.com/photo.jpg"
                  value={formData.photoURL.startsWith('data:') ? 'Image uploaded from device' : formData.photoURL} 
                  onChange={e => setFormData({...formData, photoURL: e.target.value})} 
                  disabled={formData.photoURL.startsWith('data:')}
                />
                {formData.photoURL.startsWith('data:') && (
                  <button 
                    type="button" 
                    onClick={() => setFormData({...formData, photoURL: ''})}
                    className="text-[8px] font-black text-red-500 uppercase mt-1 ml-1"
                  >
                    Clear uploaded image
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)} 
                  className="flex-1 py-3 text-slate-400 font-black text-[10px] uppercase"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 bg-primary text-white py-3 rounded-xl font-black text-[10px] uppercase shadow-lg shadow-primary/20"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <>
              <div>
                <h2 className="text-2xl font-black text-slate-800">{profile?.displayName}</h2>
                <p className="text-sm font-bold text-primary uppercase tracking-widest">{profile?.level}</p>
              </div>

              <div className="bg-slate-50 p-6 rounded-3xl space-y-4 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Phone</span>
                  <span className="font-bold text-slate-700">{profile?.phoneNumber}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200 pt-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Balance</span>
                  <span className="font-black text-emerald-500">৳{profile?.balance?.toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-slate-100 text-slate-600 font-black py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all text-sm uppercase"
                >
                  Edit Profile
                </button>
                <button 
                  onClick={() => auth.signOut()} 
                  className="w-full bg-red-50 text-red-500 font-black py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all text-sm uppercase"
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const ChangePinModal = ({ profile, onClose }: { profile: any, onClose: () => void }) => {
  const [formData, setFormData] = useState({ oldPin: '', newPin: '', confirmPin: '' });
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.oldPin !== profile.pin) return alert('Current PIN is incorrect');
    if (formData.newPin !== formData.confirmPin) return alert('New PINs do not match');
    if (formData.newPin.length !== 4) return alert('PIN must be 4 digits');

    setLoading(true);
    try {
      await setDoc(doc(db, 'users', profile.uid), { pin: formData.newPin }, { merge: true });
      alert('PIN updated successfully');
      onClose();
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[40px] w-full max-w-sm p-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
        <h2 className="text-xl font-black mb-6 uppercase tracking-tight">Security PIN</h2>
        <form onSubmit={handleUpdate} className="space-y-4">
          <input required type="password" maxLength={4} placeholder="Current PIN" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-black text-center tracking-[1em]" value={formData.oldPin} onChange={e => setFormData({...formData, oldPin: e.target.value.replace(/\D/g, '')})} />
          <input required type="password" maxLength={4} placeholder="New PIN" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-black text-center tracking-[1em]" value={formData.newPin} onChange={e => setFormData({...formData, newPin: e.target.value.replace(/\D/g, '')})} />
          <input required type="password" maxLength={4} placeholder="Confirm New PIN" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-black text-center tracking-[1em]" value={formData.confirmPin} onChange={e => setFormData({...formData, confirmPin: e.target.value.replace(/\D/g, '')})} />
          <button disabled={loading} type="submit" className="w-full bg-primary text-white font-black py-5 rounded-[24px] shadow-xl uppercase tracking-widest active:scale-95 transition-all">Update PIN</button>
        </form>
      </motion.div>
    </div>
  );
};

const ChangePasswordModal = ({ onClose }: { onClose: () => void }) => {
  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) return alert('Passwords do not match');
    if (formData.newPassword.length < 6) return alert('Password must be at least 6 characters');

    setLoading(true);
    try {
      // In a real app we'd need updatePassword(auth.currentUser!, formData.newPassword)
      // but it might require re-authentication. For now, alert that it's a demo or requires support.
      alert('Password update requires secure re-authentication. Please contact support for password reset.');
      onClose();
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[40px] w-full max-w-sm p-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
        <h2 className="text-xl font-black mb-6 uppercase tracking-tight">Change Password</h2>
        <form onSubmit={handleUpdate} className="space-y-4">
          <input required type="password" placeholder="New Password" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold" value={formData.newPassword} onChange={e => setFormData({...formData, newPassword: e.target.value})} />
          <input required type="password" placeholder="Confirm Password" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
          <button disabled={loading} type="submit" className="w-full bg-primary text-white font-black py-5 rounded-[24px] shadow-xl uppercase tracking-widest active:scale-95 transition-all">Update Security</button>
        </form>
      </motion.div>
    </div>
  );
};

const OrderManagementModal = ({ onClose }: { onClose: () => void }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [cancelReason, setCancelReason] = useState<Record<string, string>>({});

  useEffect(() => {
    const q = query(collection(db, 'transactions'), where('type', 'in', ['offer_purchase', 'bill_payment', 'recharge']), orderBy('createdAt', 'desc'));
    const unsubOrders = onSnapshot(q, (s) => {
      setOrders(s.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'transactions'));
    const unsubUsers = onSnapshot(collection(db, 'users'), (s) => {
      const uMap: Record<string, any> = {};
      s.docs.forEach(d => { uMap[d.id] = d.data(); });
      setUsers(uMap);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'users'));
    return () => { unsubOrders(); unsubUsers(); };
  }, []);

  const handleStatusUpdate = async (order: any, status: 'success' | 'failed') => {
    try {
      const reason = cancelReason[order.id] || '';
      
      // If failing, refund user balance
      if (status === 'failed') {
        const userProfile = users[order.userId];
        if (userProfile) {
          const newBalance = (userProfile.balance || 0) + order.amount;
          await setDoc(doc(db, 'users', order.userId), { balance: newBalance }, { merge: true });
          
          await addDoc(collection(db, 'transactions'), {
            userId: order.userId,
            type: 'refund',
            amount: order.amount,
            note: `Refund for order ${order.id}: ${reason}`,
            status: 'success',
            createdAt: serverTimestamp()
          });
        }
      }

      await setDoc(doc(db, 'transactions', order.id), { 
        status, 
        adminMsg: reason,
        processedAt: serverTimestamp() 
      }, { merge: true });

      alert(`Order marked as ${status}`);
    } catch (error) { handleFirestoreError(error, OperationType.UPDATE, 'transactions'); }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[40px] w-full max-w-2xl h-[85vh] p-8 shadow-2xl flex flex-col relative">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
        <h2 className="text-xl font-black mb-8 uppercase tracking-tight">Order Management</h2>
        
        <div className="flex-1 overflow-y-auto space-y-4 scrollbar-none pr-1">
          {loading ? <p className="text-center py-10 opacity-50">Loading...</p> : 
           orders.filter(o => o.status === 'pending' || o.status === 'processing' || !o.status).length === 0 ? <p className="text-center py-10 opacity-50 font-bold">No active orders</p> :
           orders.filter(o => o.status === 'pending' || o.status === 'processing' || !o.status).map(order => (
            <div key={order.id} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-black text-slate-800">{order.offerTitle || order.serviceLabel || (order.operator ? `${order.operator} Recharge` : 'Payment')}</h4>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Recipient: <span className="text-primary text-xs font-black">{order.targetNumber || 'N/A'}</span></p>
                  <p className="text-[10px] font-bold text-slate-400">User: {users[order.userId]?.displayName || 'Unknown'}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-primary">৳{order.amount}</p>
                  {order.commission > 0 && <p className="text-[9px] font-black text-emerald-500">Comm: ৳{order.commission}</p>}
                </div>
              </div>
              
              <div className="pt-2">
                <input 
                  placeholder="Reason for failure/message..." 
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold"
                  value={cancelReason[order.id] || ''}
                  onChange={(e) => setCancelReason({...cancelReason, [order.id]: e.target.value})}
                />
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => handleStatusUpdate(order, 'success')} 
                  className="flex-1 bg-emerald-500 text-white font-black py-4 rounded-2xl text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  DELIVERED (SUCCESS)
                </button>
                <button 
                  onClick={() => handleStatusUpdate(order, 'failed')} 
                  className="flex-1 bg-red-500 text-white font-black py-4 rounded-2xl text-xs shadow-lg shadow-red-500/20 active:scale-95 transition-all"
                >
                  CANCEL & REFUND
                </button>
              </div>
            </div>
          ))}

          <div className="mt-10 pt-10 border-t border-slate-100">
             <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-6">Recent History</h3>
             <div className="space-y-3">
               {orders.filter(o => o.status === 'success' || o.status === 'failed').slice(0, 10).map(o => (
                 <div key={o.id} className="flex justify-between items-center bg-slate-50/50 p-4 rounded-2xl">
                    <div className="text-xs">
                       <p className="font-black text-slate-700">{o.offerTitle}</p>
                       <p className="text-[9px] opacity-60">{o.targetNumber} • {new Date(o.createdAt?.seconds * 1000).toLocaleString()}</p>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${o.status === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                       {o.status}
                    </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const BalanceRequestsModal = ({ onClose }: { onClose: () => void }) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [users, setUsers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const { settings } = useSystem();

  useEffect(() => {
    const unsubReq = onSnapshot(query(collection(db, 'balanceRequests'), orderBy('createdAt', 'desc')), (s) => {
      setRequests(s.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'balanceRequests'));
    const unsubUsers = onSnapshot(collection(db, 'users'), (s) => {
      const uMap: Record<string, any> = {};
      s.docs.forEach(d => { uMap[d.id] = d.data(); });
      setUsers(uMap);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'users'));
    return () => { unsubReq(); unsubUsers(); };
  }, []);

  const handleApprove = async (req: any) => {
    const userProfile = users[req.userId];
    if (!userProfile) return alert('User not found');
    
    try {
      const balanceType = req.balanceType || 'mainBalance';
      const level = userProfile.level || 'personal';
      const levelConfig = settings.levelSettings?.[level];
      
      let commissionRate = 0;
      if (balanceType === 'mainBalance') {
        commissionRate = levelConfig?.mainCommission ?? (settings.mainBalanceCommission || 0);
      } else if (balanceType === 'driveBalance') {
        commissionRate = levelConfig?.driveCommission ?? 0;
      }

      const commissionAmount = (req.amount * commissionRate) / 100;
      const totalToAdd = req.amount + commissionAmount;

      const currentBalance = userProfile[balanceType] ?? (balanceType === 'mainBalance' ? userProfile.balance : 0) ?? 0;
      const newBalanceValue = currentBalance + totalToAdd;
      
      const updates: any = { [balanceType]: newBalanceValue };
      if (balanceType === 'mainBalance') updates.balance = newBalanceValue;

      await setDoc(doc(db, 'users', req.userId), updates, { merge: true });
      
      await setDoc(doc(db, 'balanceRequests', req.id), { status: 'success', approvedAt: serverTimestamp() }, { merge: true });
      
      await addDoc(collection(db, 'transactions'), {
        userId: req.userId,
        type: 'add-balance',
        balanceType: balanceType,
        amount: req.amount,
        commission: commissionAmount,
        totalAdded: totalToAdd,
        method: req.method,
        status: 'success',
        createdAt: serverTimestamp()
      });
      
      alert(`Approved! Added ৳${req.amount} + ৳${commissionAmount} commission.`);
    } catch (error) { handleFirestoreError(error, OperationType.UPDATE, 'balanceRequests'); }
  };

  const handleReject = async (req: any) => {
    try {
      await setDoc(doc(db, 'balanceRequests', req.id), { status: 'failed', rejectedAt: serverTimestamp() }, { merge: true });
      alert('Request rejected');
    } catch (error) { handleFirestoreError(error, OperationType.UPDATE, 'balanceRequests'); }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[40px] w-full max-w-lg h-[80vh] p-8 shadow-2xl flex flex-col relative">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
        <h2 className="text-xl font-black mb-8 uppercase tracking-tight">Deposit Requests</h2>
        
        <div className="flex-1 overflow-y-auto space-y-4 scrollbar-none pr-1">
          {loading ? <p className="text-center py-10 opacity-50">Loading...</p> : 
           requests.filter(r => r.status === 'pending').length === 0 ? <p className="text-center py-10 opacity-50 font-bold">No pending requests</p> :
           requests.filter(r => r.status === 'pending').map(req => (
            <div key={req.id} className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black uppercase text-[10px]">
                    {req.method?.slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800">{users[req.userId]?.displayName || 'Unknown'}</p>
                    <p className="text-[10px] font-bold text-slate-400 capitalize">
                      {req.method} • {req.trxId} • <span className="text-primary">{req.balanceType === 'driveBalance' ? 'DRIVE' : 'MAIN'}</span>
                    </p>
                  </div>
                </div>
                <p className="text-lg font-black text-primary">৳{req.amount}</p>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => handleApprove(req)} className="flex-1 bg-emerald-500 text-white font-black py-3 rounded-xl text-[10px] shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">APPROVE</button>
                <button onClick={() => handleReject(req)} className="flex-1 bg-red-50 text-red-500 font-black py-3 rounded-xl text-[10px] active:scale-95 transition-all">REJECT</button>
              </div>
            </div>
          ))}
          
          <div className="mt-10 pt-10 border-t border-slate-100">
             <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Resolved Recently</h3>
             {requests.filter(r => r.status !== 'pending').slice(0, 5).map(req => (
               <div key={req.id} className="flex justify-between items-center py-3 opacity-60">
                 <div className="text-xs">
                   <p className="font-bold">{users[req.userId]?.displayName}</p>
                   <p className="text-[9px] opacity-70">৳{req.amount} • {req.status}</p>
                 </div>
                 <div className={`p-1.5 rounded-full ${req.status === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                   {req.status === 'success' ? <CheckCircle2 size={12} /> : <X size={12} />}
                 </div>
               </div>
             ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const AddBalanceModal = ({ onClose }: { onClose: () => void }) => {
  const [config, setConfig] = useState<any>(null);
  const [formData, setFormData] = useState({ amount: '', method: 'bkash', trxId: '', balanceType: 'mainBalance' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [copied, setCopied] = useState(false);
  const { settings } = useSystem();

  useEffect(() => {
    getDoc(doc(db, 'configs', 'global')).then(s => s.exists() && setConfig(s.data()));
  }, []);

  const handleCopy = (text: string | undefined) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      await addDoc(collection(db, 'balanceRequests'), {
        ...formData,
        amount: parseFloat(formData.amount),
        userId: auth.currentUser?.uid,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setStatus('success');
      setTimeout(onClose, 2000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'balanceRequests');
      setStatus('idle');
    }
  };

  const paymentNumber = config?.[formData.method] || 'Not Configured';

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[40px] w-full max-w-md p-8 shadow-2xl relative overflow-hidden">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors z-10"><X size={20} /></button>
        
        {status === 'success' ? (
          <div className="py-20 text-center space-y-6">
             <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
                <CheckCircle2 size={40} />
             </div>
             <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-800">REQUEST SENT</h2>
                <p className="text-sm font-bold text-slate-400">Balance will be added after checking.</p>
             </div>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-tight">Add Balance</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {settings.isDualBalanceEnabled && (
                <div className="flex gap-2 p-1.5 bg-slate-50 rounded-2xl">
                  {[
                    { id: 'mainBalance', name: 'Main Balance' },
                    { id: 'driveBalance', name: 'Drive Balance' }
                  ].map(bt => (
                    <button 
                      key={bt.id} 
                      type="button" 
                      onClick={() => setFormData({...formData, balanceType: bt.id})} 
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${formData.balanceType === bt.id ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`}
                    >
                      {bt.name}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-2 p-1.5 bg-slate-50 rounded-2xl">
                {['bkash', 'nagad', 'rocket'].map(m => (
                  <button key={m} type="button" onClick={() => setFormData({...formData, method: m})} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${formData.method === m ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`}>{m}</button>
                ))}
              </div>

              <div className="bg-primary/5 rounded-3xl p-5 border border-primary/10 relative">
                 <label className="text-[9px] font-black text-primary/60 uppercase tracking-widest block mb-2">Send Money to this Number:</label>
                 <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <span className="text-lg font-black text-slate-800 font-mono tracking-wider">{paymentNumber}</span>
                    <button type="button" onClick={() => handleCopy(paymentNumber)} className="bg-primary text-white p-2 rounded-lg active:scale-90 transition-transform">
                      {copied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                 </div>
                 <p className="text-[10px] font-bold text-slate-400 mt-3 px-1 italic">Please use "Send Money" option from your app.</p>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Amount (৳)</label>
                  <input required type="number" placeholder="0.00" className="w-full bg-transparent outline-none font-black text-xl text-slate-800" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Transaction ID (TrxID)</label>
                  <input required placeholder="Enter TrxID" className="w-full bg-transparent outline-none font-black text-slate-800" value={formData.trxId} onChange={e => setFormData({...formData, trxId: e.target.value})} />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                 <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[8px]">1</div>
                    <span>Send money to the {formData.method} number above.</span>
                 </div>
                 <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[8px]">2</div>
                    <span>Copy the Transaction ID from the confirmed message.</span>
                 </div>
                 <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[8px]">3</div>
                    <span>Enter Amount and TrxID correctly and Click Submit.</span>
                 </div>
              </div>

              <button disabled={status === 'submitting'} type="submit" className="w-full bg-primary text-white font-black py-5 rounded-[24px] shadow-xl shadow-primary/30 uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50">
                {status === 'submitting' ? 'Submitting...' : 'Confirm Deposit'}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};

const BottomNav = ({ onLogsOpen }: { onLogsOpen: () => void }) => (
  <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white/90 backdrop-blur-xl border-t border-slate-50 py-5 px-10 flex justify-between items-center z-40 rounded-t-[40px] shadow-2xl text-slate-300">
    <button className="flex flex-col items-center gap-1.5 text-primary"><Home size={24} strokeWidth={2.5} /><span className="text-[10px] font-black uppercase tracking-tighter">Home</span></button>
    <button className="flex flex-col items-center gap-1.5 hover:text-primary transition-colors"><Monitor size={24} strokeWidth={2.5} /><span className="text-[10px] font-black uppercase tracking-tighter">Offers</span></button>
    <button onClick={onLogsOpen} className="flex flex-col items-center gap-1.5 hover:text-primary transition-colors"><History size={24} strokeWidth={2.5} /><span className="text-[10px] font-black uppercase tracking-tighter">Logs</span></button>
    <button className="flex flex-col items-center gap-1.5 hover:text-primary transition-colors"><Menu size={24} strokeWidth={2.5} /><span className="text-[10px] font-black uppercase tracking-tighter">More</span></button>
  </nav>
);

// --- App Root ---

export default function App() {
  const { user, profile, loading: authLoading } = useAuth();
  const { settings, updateSettings, loading: systemLoading } = useSystem();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isUserManagerOpen, setIsUserManagerOpen] = useState(false);
  const [isUserAddOpen, setIsUserAddOpen] = useState(false);
  const [isSendMoneyOpen, setIsSendMoneyOpen] = useState(false);
  const [isOrderMgmtOpen, setIsOrderMgmtOpen] = useState(false);
  const [isAddBalanceOpen, setIsAddBalanceOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<any>(null);
  const [isBrandingOpen, setIsBrandingOpen] = useState(false);
  const [isNoticeConfigOpen, setIsNoticeConfigOpen] = useState(false);
  const [isPaymentConfigOpen, setIsPaymentConfigOpen] = useState(false);
  const [isPricingConfigOpen, setIsPricingConfigOpen] = useState(false);
  const [isAutoRechargeOpen, setIsAutoRechargeOpen] = useState(false);
  const [isAdminChatOpen, setIsAdminChatOpen] = useState(false);
  const [isBalanceRequestOpen, setIsBalanceRequestOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [pinChallenge, setPinChallenge] = useState<{ action: () => void } | null>(null);
  const [isMobileRechargeOpen, setIsMobileRechargeOpen] = useState(false);
  const [activeOfferType, setActiveOfferType] = useState<'drive' | 'regular'>('drive');
  const offerListRef = useRef<HTMLDivElement>(null);
  const [globalNotice, setGlobalNotice] = useState<string | null>(null);
  const [config, setConfig] = useState<any>(null);
  const [billType, setBillType] = useState<{ type: string, label: string } | null>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'offers'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOffers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoadingOffers(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'offers');
      setLoadingOffers(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'configs', 'global'), (s) => {
      if (s.exists()) {
        const d = s.data();
        setGlobalNotice(d.notice || d.loginNotice || null);
        setConfig(d);
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'configs/global'));
    return unsub;
  }, []);

  useEffect(() => {
    // Legacy check removed as we use registration flow now
  }, [profile]);

  const runWithPin = (action: () => void) => {
    if (!profile?.pin) { action(); return; }
    setPinChallenge({ action });
  };

  const scrollToOffers = (type: 'drive' | 'regular') => {
    setActiveOfferType(type);
    offerListRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (authLoading || systemLoading) return <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]"><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full shadow-lg" /></div>;
  
  if (!user) {
    return authView === 'login' 
      ? <LoginScreen onSwitchToRegister={() => setAuthView('register')} /> 
      : <RegistrationScreen onSwitchToLogin={() => setAuthView('login')} onRegisterSuccess={() => setIsUnlocked(true)} />;
  }

  if (!isUnlocked && profile?.pin) {
    return (
      <PinVerifyModal 
        userPin={profile.pin} 
        onSuccess={() => setIsUnlocked(true)} 
        onClose={() => auth.signOut()} 
      />
    );
  }

  return (
    <div className="min-h-screen max-w-lg mx-auto bg-[#F8FAFC] pb-36 font-sans selection:bg-primary selection:text-white overflow-x-hidden">
      <Header profile={profile} logoUrl={config?.logoUrl} />
      <DateTimePrayerSection />
      <BalanceCard 
        profile={profile} 
        onAddBalance={() => setIsAddBalanceOpen(true)} 
        onSendMoney={() => setIsSendMoneyOpen(true)}
        onAddUser={() => setIsUserAddOpen(true)}
        onMyUsers={() => setIsUserManagerOpen(true)}
        runWithPin={runWithPin} 
      />
      
      {globalNotice && (
        <div className="px-6 mb-6">
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary/5 border border-primary/10 p-5 rounded-[32px] flex items-start gap-4 relative overflow-hidden group"
          >
            <div className="bg-primary text-white p-3 rounded-2xl shadow-lg shadow-primary/20">
              <AlertCircle size={20} strokeWidth={3} />
            </div>
            <div className="flex-1">
               <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Notice Update</h4>
               <p className="text-xs font-bold text-slate-600 leading-relaxed pr-6">{globalNotice}</p>
            </div>
          </motion.div>
        </div>
      )}

      <ServiceSection title="Recharge & Bill Payments" showHistory>
        <ServiceIcon label="Mobile Recharge" icon={<Smartphone size={24} strokeWidth={3} />} colorClass="text-indigo-600" bgColorClass="bg-white border-2 border-slate-50 shadow-sm" onClick={() => setIsMobileRechargeOpen(true)} />
        <ServiceIcon label="Auto Task" icon={<Repeat size={24} strokeWidth={3} />} colorClass="text-emerald-600" bgColorClass="bg-white border-2 border-slate-50 shadow-sm" onClick={() => setIsAutoRechargeOpen(true)} />
        <ServiceIcon label="Drive Offer" icon={<Zap size={24} strokeWidth={3} />} colorClass="text-rose-500" bgColorClass="bg-white border-2 border-slate-50 shadow-sm" onClick={() => scrollToOffers('drive')} />
        <ServiceIcon label="Regular Offer" icon={<Gift size={24} strokeWidth={3} />} colorClass="text-orange-500" bgColorClass="bg-white border-2 border-slate-50 shadow-sm" onClick={() => scrollToOffers('regular')} />
        <ServiceIcon label="History" icon={<History size={24} strokeWidth={3} />} colorClass="text-purple-600" bgColorClass="bg-white border-2 border-slate-50 shadow-sm" onClick={() => setIsLogsOpen(true)} />
        <ServiceIcon label="Pay Bill" icon={<Wallet size={24} strokeWidth={3} />} colorClass="text-amber-600" bgColorClass="bg-white border-2 border-slate-50 shadow-sm" onClick={() => setBillType({ type: 'utility', label: 'Utility Bill Pay' })} />
        <ServiceIcon label="Banking" icon={<Home size={24} strokeWidth={3} />} colorClass="text-sky-600" bgColorClass="bg-white border-2 border-slate-50 shadow-sm" onClick={() => setBillType({ type: 'banking', label: 'Bank Transfer' })} />
        <ServiceIcon label="Bkash (P)" icon={<CreditCard size={24} strokeWidth={3} />} colorClass="text-pink-500" bgColorClass="bg-white border-2 border-slate-50 shadow-sm" onClick={() => setBillType({ type: 'bkash', label: 'Bkash Payment' })} />
        <ServiceIcon label="Nagad (P)" icon={<CreditCard size={24} strokeWidth={3} />} colorClass="text-orange-600" bgColorClass="bg-white border-2 border-slate-50 shadow-sm" onClick={() => setBillType({ type: 'nagad', label: 'Nagad Payment' })} />
        <ServiceIcon label="Rocket (P)" icon={<CreditCard size={24} strokeWidth={3} />} colorClass="text-purple-700" bgColorClass="bg-white border-2 border-slate-50 shadow-sm" onClick={() => setBillType({ type: 'rocket', label: 'Rocket Payment' })} />
        <ServiceIcon label="Cellfin" icon={<Smartphone size={24} strokeWidth={3} />} colorClass="text-blue-600" bgColorClass="bg-white border-2 border-slate-50 shadow-sm" onClick={() => setBillType({ type: 'cellfin', label: 'Cellfin Service' })} />
        <ServiceIcon label="mCash" icon={<Wallet size={24} strokeWidth={3} />} colorClass="text-teal-600" bgColorClass="bg-white border-2 border-slate-50 shadow-sm" onClick={() => setBillType({ type: 'mcash', label: 'mCash Service' })} />
        <ServiceIcon label="SureCash" icon={<CheckCircle2 size={24} strokeWidth={3} />} colorClass="text-cyan-600" bgColorClass="bg-white border-2 border-slate-50 shadow-sm" onClick={() => setBillType({ type: 'surecash', label: 'SureCash Service' })} />
      </ServiceSection>

      <Banner banners={config?.banners || []} />
      <div ref={offerListRef}>
        <OfferList 
          activeType={activeOfferType}
          onTypeChange={setActiveOfferType}
          isAdmin={profile?.isAdmin} 
          offers={offers}
          loading={loadingOffers}
          onBuy={(offer) => runWithPin(() => setSelectedOffer(offer))} 
          onEdit={(offer) => {
            setEditingOffer(offer);
            setIsAdminPanelOpen(true);
          }}
        />
      </div>

      {profile?.isAdmin && (
        <ServiceSection title="Admin Controls">
          <ServiceIcon label="Orders" icon={<ShoppingCart size={26} strokeWidth={3} />} colorClass="text-indigo-600" bgColorClass="bg-indigo-50" onClick={() => runWithPin(() => setIsOrderMgmtOpen(true))} />
          <ServiceIcon label="Users" icon={<Users size={26} strokeWidth={3} />} colorClass="text-cyan-600" bgColorClass="bg-cyan-50" onClick={() => runWithPin(() => setIsUserManagerOpen(true))} />
          <ServiceIcon label="Requests" icon={<CreditCard size={26} strokeWidth={3} />} colorClass="text-amber-600" bgColorClass="bg-amber-50" onClick={() => runWithPin(() => setIsBalanceRequestOpen(true))} />
          <ServiceIcon label="Offers" icon={<Zap size={26} strokeWidth={3} />} colorClass="text-emerald-600" bgColorClass="bg-emerald-50" onClick={() => runWithPin(() => setIsAdminPanelOpen(true))} />
          <ServiceIcon label="Notice" icon={<Bell size={26} strokeWidth={3} />} colorClass="text-purple-600" bgColorClass="bg-purple-50" onClick={() => runWithPin(() => setIsNoticeConfigOpen(true))} />
          <ServiceIcon label="Payment No" icon={<Smartphone size={26} strokeWidth={3} />} colorClass="text-pink-600" bgColorClass="bg-pink-50" onClick={() => runWithPin(() => setIsPaymentConfigOpen(true))} />
          <ServiceIcon label="Branding" icon={<ImageIcon size={26} strokeWidth={3} />} colorClass="text-blue-600" bgColorClass="bg-blue-50" onClick={() => runWithPin(() => setIsBrandingOpen(true))} />
          <ServiceIcon label="Live Chat" icon={<MessageSquare size={26} strokeWidth={3} />} colorClass="text-emerald-600" bgColorClass="bg-emerald-50" onClick={() => runWithPin(() => setIsAdminChatOpen(true))} />
          <ServiceIcon label="Levels" icon={<ShieldCheck size={26} strokeWidth={3} />} colorClass="text-amber-600" bgColorClass="bg-amber-50" onClick={() => runWithPin(() => setIsPricingConfigOpen(true))} />
          <ServiceIcon label="Logout" icon={<LogOut size={26} strokeWidth={3} />} colorClass="text-red-500" bgColorClass="bg-red-50" onClick={() => auth.signOut()} />
        </ServiceSection>
      )}

      <ServiceSection title="Link & Service">
        <ServiceIcon label="WhatsApp" icon={<MessageCircle strokeWidth={3} />} colorClass="text-green-500" bgColorClass="bg-white border border-slate-100" onClick={() => settings.whatsapp && window.open(`https://wa.me/${settings.whatsapp.replace(/\+/g, '')}`, '_blank')} />
        <ServiceIcon label="Live Chat" icon={<MessageSquare strokeWidth={3} />} colorClass="text-indigo-500" bgColorClass="bg-white border border-slate-100" onClick={() => setIsChatOpen(true)} />
        <ServiceIcon label="Telegram" icon={<Telegram strokeWidth={3} />} colorClass="text-sky-500" bgColorClass="bg-white border border-slate-100" onClick={() => settings.telegram && window.open(settings.telegram, '_blank')} />
        <ServiceIcon label="YouTube" icon={<Youtube strokeWidth={3} />} colorClass="text-red-500" bgColorClass="bg-white border border-slate-100" onClick={() => settings.youtube && window.open(settings.youtube, '_blank')} />
        <ServiceIcon label="Shopping" icon={<ShoppingCart strokeWidth={3} />} colorClass="text-red-500" bgColorClass="bg-white border border-slate-100" onClick={() => settings.shopping && window.open(settings.shopping, '_blank')} />
        <ServiceIcon label="Password" icon={<Lock strokeWidth={3} />} colorClass="text-indigo-500" bgColorClass="bg-white border border-slate-100" onClick={() => setIsPasswordModalOpen(true)} />
        <ServiceIcon label="PIN" icon={<ShieldCheck strokeWidth={3} />} colorClass="text-amber-500" bgColorClass="bg-white border border-slate-100" onClick={() => setIsPinModalOpen(true)} />
        <ServiceIcon label="Profile" icon={<UserIcon strokeWidth={3} />} colorClass="text-blue-500" bgColorClass="bg-white border border-slate-100" onClick={() => setIsProfileModalOpen(true)} />
      </ServiceSection>

      <BottomNav onLogsOpen={() => setIsLogsOpen(true)} />

      {isUserManagerOpen && <UserManagementModal onClose={() => setIsUserManagerOpen(false)} />}
      {isUserAddOpen && <UserManagementModal defaultTab="add" onClose={() => setIsUserAddOpen(false)} />}
      {isSendMoneyOpen && <SendMoneyModal onClose={() => setIsSendMoneyOpen(false)} />}
      {isOrderMgmtOpen && <OrderManagementModal onClose={() => setIsOrderMgmtOpen(false)} />}
      {isBalanceRequestOpen && <BalanceRequestsModal onClose={() => setIsBalanceRequestOpen(false)} />}
      {isAddBalanceOpen && <AddBalanceModal onClose={() => setIsAddBalanceOpen(false)} />}
      {isAdminPanelOpen && (
        <AdminModal 
          onClose={() => {
            setIsAdminPanelOpen(false);
            setEditingOffer(null);
          }} 
          editingOffer={editingOffer}
          offers={offers}
          setEditingOffer={setEditingOffer}
        />
      )}
      {isBrandingOpen && <DesignConfigModal onClose={() => setIsBrandingOpen(false)} />}
      {isNoticeConfigOpen && <NoticeConfigModal onClose={() => setIsNoticeConfigOpen(false)} />}
      {isPaymentConfigOpen && <PaymentConfigModal onClose={() => setIsPaymentConfigOpen(false)} />}
      {isPricingConfigOpen && <PricingConfigModal onClose={() => setIsPricingConfigOpen(false)} />}
      {isAutoRechargeOpen && <AutoRechargeModal onClose={() => setIsAutoRechargeOpen(false)} />}
      {isAdminChatOpen && <AdminChatModal onClose={() => setIsAdminChatOpen(false)} />}
      {isPasswordModalOpen && <ChangePasswordModal onClose={() => setIsPasswordModalOpen(false)} />}
      {isPinModalOpen && <ChangePinModal profile={profile} onClose={() => setIsPinModalOpen(false)} />}
      {isMobileRechargeOpen && <MobileRechargeModal onClose={() => setIsMobileRechargeOpen(false)} />}
      {isProfileModalOpen && <ProfileModal profile={profile} onClose={() => setIsProfileModalOpen(false)} />}
      {isChatOpen && <ChatModal user={profile} onClose={() => setIsChatOpen(false)} />}
      {isLogsOpen && <TransactionHistoryModal onClose={() => setIsLogsOpen(false)} />}
      {billType && <BillPaymentModal type={billType.type} label={billType.label} onClose={() => setBillType(null)} />}

      {selectedOffer && (
        <PurchaseModal 
          offer={selectedOffer} 
          balance={
            settings.isDualBalanceEnabled 
              ? (selectedOffer.type === 'drive' ? (profile?.driveBalance || 0) : (profile?.mainBalance ?? profile?.balance ?? 0))
              : (profile?.mainBalance ?? profile?.balance ?? 0)
          }
          onClose={() => setSelectedOffer(null)} 
          onConfirm={async (number) => {
            const netPrice = selectedOffer.netPrice || selectedOffer.price;
            const isDrive = selectedOffer.type === 'drive';
            const balanceKey = (settings.isDualBalanceEnabled && isDrive) ? 'driveBalance' : 'mainBalance';
            const currentBalance = (balanceKey === 'driveBalance') 
              ? (profile?.driveBalance || 0) 
              : (profile?.mainBalance ?? profile?.balance ?? 0);

            if (currentBalance < netPrice) {
              alert('Insufficient Balance!');
              return;
            }
            try {
              const updates: any = { [balanceKey]: currentBalance - netPrice };
              // Keep legacy balance in sync if updating mainBalance
              if (balanceKey === 'mainBalance') updates.balance = currentBalance - netPrice;
              
              await setDoc(doc(db, 'users', profile.uid), updates, { merge: true });
              await addDoc(collection(db, 'transactions'), {
                userId: profile.uid,
                type: 'offer_purchase',
                offerId: selectedOffer.id,
                offerTitle: selectedOffer.title,
                targetNumber: number,
                amount: netPrice,
                balanceType: balanceKey,
                regularPrice: selectedOffer.regularPrice || selectedOffer.price,
                commission: selectedOffer.commission || 0,
                status: 'pending',
                createdAt: serverTimestamp()
              });
              setSelectedOffer(null);
              alert('Order placed successfully!');
            } catch (e) {
              console.error(e);
              alert('Failed to place order.');
            }
          }}
        />
      )}

      <AnimatePresence>
        {pinChallenge && (
          <PinVerifyModal 
            userPin={profile?.pin || ''} 
            onSuccess={() => { const a = pinChallenge.action; setPinChallenge(null); a(); }} 
            onClose={() => setPinChallenge(null)} 
          />
        )}
        {globalNotice && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-32 left-6 right-6 z-[250] bg-white rounded-[32px] p-8 shadow-2xl border-2 border-primary/20">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-1 rounded-lg">Alert</span>
              <button onClick={() => setGlobalNotice(null)} className="text-slate-300 hover:text-slate-500 transition-colors"><X size={20} /></button>
            </div>
            <p className="text-sm font-bold text-slate-800 leading-relaxed pr-2">{globalNotice}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
