import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { PhoneFrame } from './components/PhoneFrame';
import { VoiceVisualizer } from './components/VoiceVisualizer';
import { backend } from './services/apiService';
import { voiceService } from './services/voiceService';
import { UserProfile, EmergencyContact, AlertLog, TRIGGER_PHRASES, SubscriptionTier, SupportedLanguage, LANGUAGE_LABELS } from './types';
import { 
  Shield, Users, CreditCard, History, Radio, User, Trash2, Plus, Bell, X, Check, 
  Clock, Sparkles, Mail, Smartphone, PhoneCall, BrainCircuit, Activity, LogOut, 
  Lock, ArrowRight, AlertTriangle, ShieldCheck, MailCheck, RefreshCcw, Languages, 
  ChevronRight, Ban, Power, Calendar, CreditCard as CardIcon, LockKeyhole, QrCode, ScanLine,
  Zap, MapPin, Building, Info, Star, Siren, Cross
} from 'lucide-react';

// --- Constants for Sponsored Areas ---
const SPONSORED_ZONES = [
  { name: 'Mumbai Metropolitan District', lat: 19.0760, lng: 72.8777, radius: 50 },
  { name: 'Delhi NCR Safety Zone', lat: 28.6139, lng: 77.2090, radius: 40 }
];

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// --- Google Play Billing Simulator ---
const GooglePlayBilling: React.FC<{
  tier: SubscriptionTier;
  onStatusChange: (status: 'PURCHASED' | 'PENDING' | 'CANCELED' | 'FAILED') => void;
  onClose: () => void;
}> = ({ tier, onStatusChange, onClose }) => {
  const [step, setStep] = useState<'info' | 'processing' | 'result'>('info');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'qr'>('card');
  const [status, setStatus] = useState<'PURCHASED' | 'PENDING' | 'CANCELED' | 'FAILED' | null>(null);
  
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const price = tier === SubscriptionTier.MONTHLY ? '₹99.00' : '₹499.00';
  const planName = tier === SubscriptionTier.MONTHLY ? 'Monthly Guardian' : 'Annual Shield';

  const isCardValid = useMemo(() => {
    return cardNumber.replace(/\s/g, '').length === 16 && expiry.length === 5 && cvv.length === 3;
  }, [cardNumber, expiry, cvv]);

  const handlePay = () => {
    setStep('processing');
    setTimeout(() => {
      const success = Math.random() > 0.05;
      const finalStatus = success ? 'PURCHASED' : 'FAILED';
      setStatus(finalStatus);
      setStep('result');
      onStatusChange(finalStatus);
    }, 2500);
  };

  const formatCardNumber = (val: string) => {
    const v = val.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : v;
  };

  const formatExpiry = (val: string) => {
    const v = val.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) return v.substring(0, 2) + '/' + v.substring(2, 4);
    return v;
  };

  return (
    <div className="absolute inset-0 z-[100] flex items-end justify-center bg-black/80 p-0 animate-in fade-in duration-300">
      <div className="w-full bg-slate-900 rounded-t-[2.5rem] border-t border-slate-700 p-6 pb-10 animate-in slide-in-from-bottom duration-300 max-h-[90%] overflow-y-auto text-white text-left text-left">
        <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mb-6" />
        
        {step === 'info' && (
          <div className="space-y-5 text-left text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
                  <Shield className="text-red-500 w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-sm text-white">Google Play</h3>
                  <p className="text-[10px] text-slate-400">Secure Checkout</p>
                </div>
              </div>
              <p className="text-xs font-black text-white bg-slate-800 px-3 py-1 rounded-full">{price}</p>
            </div>
            
            <div className="flex bg-slate-800 p-1 rounded-xl">
              <button onClick={() => setPaymentMethod('card')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${paymentMethod === 'card' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                <CardIcon className="w-3 h-3" /> Card
              </button>
              <button onClick={() => setPaymentMethod('qr')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${paymentMethod === 'qr' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                <QrCode className="w-3 h-3" /> Scan QR
              </button>
            </div>

            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 text-left text-left">
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Purchasing</p>
              <p className="text-sm font-bold text-white">{planName}</p>
            </div>

            {paymentMethod === 'card' ? (
              <div className="space-y-3 animate-in fade-in slide-in-from-left-2 duration-200">
                <div className="relative">
                  <CardIcon className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input type="text" placeholder="0000 0000 0000 0000" value={cardNumber} onChange={(e) => setCardNumber(formatCardNumber(e.target.value))} maxLength={19} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 pl-10 text-xs text-white focus:border-blue-500 outline-none transition" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input type="text" placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(formatExpiry(e.target.value))} maxLength={5} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 pl-10 text-xs text-white focus:border-blue-500 outline-none transition" />
                  </div>
                  <div className="relative">
                    <LockKeyhole className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input type="password" placeholder="CVV" value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))} maxLength={3} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 pl-10 text-xs text-white focus:border-blue-500 outline-none transition" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 py-2 animate-in fade-in slide-in-from-right-2 duration-200">
                <div 
                  onClick={handlePay}
                  className="bg-white p-4 rounded-2xl shadow-xl relative group cursor-pointer transition-transform hover:scale-105"
                >
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=pay-help-safety-${tier}`} alt="QR" className="w-28 h-28" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/60 text-blue-600">
                    <Check className="w-8 h-8 animate-bounce" />
                    <p className="text-[8px] font-black uppercase tracking-tighter">Confirm Payment</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-400">Scan QR to pay with any UPI app</p>
                  <p className="text-[8px] text-slate-500 mt-2 uppercase font-black tracking-widest">Tap QR to verify payment</p>
                </div>
              </div>
            )}

            <div className="pt-4 space-y-3">
              {paymentMethod === 'card' && (
                <button 
                  onClick={handlePay}
                  disabled={!isCardValid}
                  className={`w-full py-4 rounded-2xl font-black text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${ isCardValid ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-600'}`}
                >
                  {isCardValid ? `PAY NOW • ${price}` : 'ENTER CARD DETAILS'}
                </button>
              )}
              <button onClick={onClose} className="w-full text-slate-500 font-bold py-2 text-[10px] uppercase tracking-widest transition hover:text-slate-300">CANCEL</button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="py-20 flex flex-col items-center justify-center space-y-4 text-center">
            <RefreshCcw className="w-12 h-12 text-blue-500 animate-spin" />
            <p className="text-sm font-black text-white tracking-tight text-center">Verifying Payment Status...</p>
            <p className="text-[9px] text-slate-500 animate-pulse uppercase tracking-widest">Encrypting Bank Handshake</p>
          </div>
        )}

        {step === 'result' && (
          <div className="py-8 flex flex-col items-center justify-center space-y-5 text-center text-center">
            {status === 'PURCHASED' ? (
              <>
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
                  <Check className="w-8 h-8 text-green-500" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-black text-white text-center">Payment Successful</h3>
                  <p className="text-xs text-slate-400 mt-2 px-8 leading-relaxed text-center">Your account has been upgraded. Protection is now active.</p>
                  <div className="mt-8 flex flex-col items-center gap-2">
                    <RefreshCcw className="w-4 h-4 text-green-500 animate-spin" />
                    <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest text-center">Syncing status... redirecting</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
                  <X className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-black text-white text-center text-center">Payment Failed</h3>
                <p className="text-xs text-slate-400 mt-2 px-8 text-center text-center">Transaction was declined by the bank.</p>
                <button onClick={onClose} className="w-full bg-slate-800 text-white font-black py-4 rounded-2xl mt-4">BACK TO PLANS</button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main App ---
const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [alerts, setAlerts] = useState<AlertLog[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [activeTab, setActiveTab] = useState<'monitor' | 'contacts' | 'sub' | 'history'>('monitor');
  const [lastTriggered, setLastTriggered] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCalling, setIsCalling] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);

  const [showBilling, setShowBilling] = useState(false);
  const [pendingTier, setPendingTier] = useState<SubscriptionTier | null>(null);

  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPolice, setNewPolice] = useState('');
  const [newAmbulance, setNewAmbulance] = useState('');

  const [sponsoredArea, setSponsoredArea] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [contactWarning, setContactWarning] = useState<string | null>(null);

  const isSubscriptionActive = useMemo(() => {
    if (!user) return false;
    if (sponsoredArea) return true;
    return user.subscription.expiresAt > Date.now();
  }, [user, currentTime, sponsoredArea]);

  const hasExpired = useMemo(() => {
    if (!user) return false;
    if (sponsoredArea) return false;
    return user.subscription.hasUsedTrial && user.subscription.expiresAt < Date.now();
  }, [user, currentTime, sponsoredArea]);

  const currentPhrases = useMemo(() => {
    if (!user) return TRIGGER_PHRASES['en'];
    return TRIGGER_PHRASES[user.preferredLanguage];
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const checkSponsoredArea = useCallback(() => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        let foundZone = null;
        for (const zone of SPONSORED_ZONES) {
          const dist = calculateDistance(latitude, longitude, zone.lat, zone.lng);
          if (dist <= zone.radius) {
            foundZone = zone.name;
            break;
          }
        }
        setSponsoredArea(foundZone);
        setIsLocating(false);
      },
      (err) => {
        console.warn('Location check failed:', err.message);
        setIsLocating(false);
      },
      { enableHighAccuracy: false, timeout: 5000 }
    );
  }, []);

  useEffect(() => {
    const checkStatus = async () => {
      const savedAuth = localStorage.getItem('help_app_auth');
      const savedVerified = localStorage.getItem('help_app_verified');
      if (savedAuth === 'true') {
        const profile = await backend.getProfile();
        const userContacts = await backend.getContacts();
        const history = await backend.getAlertHistory();
        setUser(profile);
        setContacts(userContacts);
        setAlerts(history);
        setNewPolice(profile.policeContact || '');
        setNewAmbulance(profile.ambulanceContact || '');
        setIsAuthenticated(true);
        setIsVerified(savedVerified === 'true' || profile.isVerified);
        checkSponsoredArea();
      } else {
        setIsAuthenticated(false);
        setIsVerified(false);
      }
    };
    checkStatus();
  }, [checkSponsoredArea]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('help_app_auth', 'true');
    const profile = await backend.getProfile();
    setUser(profile);
    setContacts(await backend.getContacts());
    setAlerts(await backend.getAlertHistory());
    setIsAuthenticated(true);
    checkSponsoredArea();
  };

  const handleVerify = async () => {
    const updatedUser = await backend.verifyAccount();
    setUser(updatedUser);
    setIsVerified(true);
    localStorage.setItem('help_app_verified', 'true');
  };

  const handleSignOut = () => {
    localStorage.removeItem('help_app_auth');
    localStorage.removeItem('help_app_verified');
    setIsAuthenticated(false);
    setIsVerified(false);
    setSponsoredArea(null);
    voiceService.stop();
    setIsListening(false);
  };

  const changeLanguage = async (lang: SupportedLanguage) => {
    const updatedUser = await backend.updateLanguage(lang);
    setUser(updatedUser);
    if (isListening) {
      voiceService.stop();
      voiceService.start(lang, handleTrigger, (status) => setIsListening(status === 'listening'));
    }
  };

  const analyzeIntent = useCallback(async (phrase: string) => {
    setIsAnalyzing(true);
    setAiAnalysisResult("AI ANALYZING...");
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `The user spoke an emergency trigger phrase: "${phrase}". Evaluate context. Confirm if emergency. Response JSON.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: { isEmergency: { type: Type.BOOLEAN }, summary: { type: Type.STRING } },
            required: ["isEmergency", "summary"]
          }
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (e) {
      return { isEmergency: true, summary: "Distress signal verified." };
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const handleTrigger = useCallback(async (phrase: string) => {
    if (!isSubscriptionActive || contacts.length === 0) return;
    setLastTriggered(phrase);
    const assessment = await analyzeIntent(phrase);
    if (assessment.isEmergency) {
      setAiAnalysisResult(assessment.summary);
      setIsCalling(true);
      const newAlert = await backend.triggerEmergency(phrase);
      setAlerts(prev => [newAlert, ...prev]);
      setTimeout(() => { setLastTriggered(null); setIsCalling(false); setAiAnalysisResult(null); }, 8000);
    } else {
      setAiAnalysisResult(assessment.summary);
      setTimeout(() => { setLastTriggered(null); setAiAnalysisResult(null); }, 3000);
    }
  }, [isSubscriptionActive, analyzeIntent, contacts]);

  const saveNewContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;
    
    if (contacts.length >= 5) {
      alert("Maximum 5 contacts allowed for this MVP.");
      return;
    }

    try {
      const contact = await backend.addContact({ 
        name: newName, 
        phone: newPhone, 
        relation: 'Circle Member' 
      });
      setContacts(prev => [...prev, contact]);
      setNewName('');
      setNewPhone('');
      setIsAddingContact(false);
      setContactWarning(null);
    } catch (err) {
      console.error("Failed to add contact", err);
    }
  };

  const toggleListening = () => {
    if (!isSubscriptionActive) { setActiveTab('sub'); return; }
    
    if (contacts.length === 0) {
      setContactWarning("Add at least 1 contact to activate protection.");
      setActiveTab('contacts');
      setTimeout(() => setContactWarning(null), 3000);
      return;
    }

    if (isListening) { 
      voiceService.stop(); 
      setIsListening(false); 
    } else {
      voiceService.start(user?.preferredLanguage || 'en', handleTrigger, s => setIsListening(s === 'listening'));
    }
  };

  const handleUpdateSpecial = () => {
    backend.updateSpecialContacts(newPolice, newAmbulance).then(updated => {
      setUser(updated);
    });
  };

  const startUpgradeFlow = (tier: SubscriptionTier) => {
    setPendingTier(tier);
    setShowBilling(true);
  };

  const handleBillingStatus = async (status: 'PURCHASED' | 'PENDING' | 'CANCELED' | 'FAILED') => {
    if (status === 'PURCHASED' && pendingTier) {
      const updatedUser = await backend.buySubscription(pendingTier);
      setUser(updatedUser);
      setTimeout(() => {
        setShowBilling(false);
        setActiveTab('monitor');
      }, 2000);
    }
  };

  const activateTrial = async () => {
    const updatedUser = await backend.activateTrial();
    setUser(updatedUser);
    setActiveTab('monitor');
  };

  if (isAuthenticated === null) return null;

  return (
    <div className="min-h-screen p-4 flex items-center justify-center bg-slate-950 text-left text-left">
      <div className="w-full max-w-[400px]">
        <PhoneFrame>
          <div className={`${sponsoredArea ? 'bg-blue-600/90' : 'bg-green-600/90'} text-white text-[10px] py-1.5 px-3 flex items-center justify-center gap-2 font-black tracking-widest uppercase z-50`}>
             {sponsoredArea ? <Building className="w-3 h-3 fill-current" /> : <Zap className="w-3 h-3 fill-current" />}
             {sponsoredArea ? 'Covered by District Program' : 'Listening for help…'}
          </div>

          {!isAuthenticated ? (
            <div className="flex-1 flex flex-col p-8 bg-slate-900 text-left text-left">
              <div className="mt-8 mb-10 text-center text-left text-left">
                <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4"><Shield className="w-10 h-10 text-white" /></div>
                <h2 className="text-2xl font-black text-white text-center text-center">Help</h2>
                <p className="text-slate-400 text-xs mt-2 text-center text-center">AI Zero-Touch Emergency Platform</p>
              </div>
              <form onSubmit={handleSignIn} className="space-y-4">
                <input type="email" required value={authEmail} onChange={e => setAuthEmail(e.target.value)} placeholder="Email" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white outline-none focus:border-blue-500" />
                <input type="password" required value={authPassword} onChange={e => setAuthPassword(e.target.value)} placeholder="Password" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white outline-none focus:border-blue-500" />
                <button type="submit" className="w-full bg-red-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 mt-4 transition hover:bg-red-700">Create Account <ArrowRight className="w-4 h-4" /></button>
              </form>
            </div>
          ) : !isVerified ? (
            <div className="flex-1 flex flex-col p-8 bg-slate-900 text-center text-center justify-center">
              <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-500"><MailCheck className="w-10 h-10 animate-pulse" /></div>
              <h2 className="text-xl font-bold text-white text-center text-center">Verify Identity</h2>
              <p className="text-slate-400 text-xs mt-3 mb-8 text-center text-center">Link sent to {user?.email}</p>
              <button onClick={handleVerify} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition">Simulate Verification</button>
            </div>
          ) : (
            <>
              {showBilling && pendingTier && <GooglePlayBilling tier={pendingTier} onStatusChange={handleBillingStatus} onClose={() => setShowBilling(false)} />}
              
              {lastTriggered && (
                <div className={`absolute top-12 left-4 right-4 p-4 rounded-xl shadow-2xl z-[60] border-2 border-white/20 animate-in slide-in-from-top ${aiAnalysisResult?.includes("Verified") || isCalling ? 'bg-red-600' : 'bg-slate-700'}`}>
                  <div className="flex items-center gap-3">
                    <div className="bg-white rounded-full p-1 animate-pulse"><Bell className="w-5 h-5 text-red-600" /></div>
                    <div className="text-xs flex-1 text-left text-left text-left text-left">
                      <p className="font-black text-white uppercase text-left">Triggered</p>
                      <p className="text-white/80 font-bold truncate text-left">{aiAnalysisResult || "Evaluating..."}</p>
                    </div>
                    <button onClick={() => setLastTriggered(null)} className="bg-white/20 p-2 rounded-lg text-[10px] font-bold text-white">STOP</button>
                  </div>
                </div>
              )}
              
              <div className="p-5 pb-2 flex justify-between items-center text-white text-left text-left text-left">
                <div className="text-left text-left text-left">
                  <h2 className="text-xl font-black tracking-tighter flex items-center gap-2"><Shield className="w-5 h-5 text-red-500" /> Help</h2>
                  <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" /> {currentTime.toLocaleTimeString()}</div>
                </div>
                <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${isListening ? 'bg-green-500/10 text-green-500' : 'bg-slate-700 text-slate-500'}`}>{isListening ? 'Active' : 'Standby'}</div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 pb-20 text-white text-left text-left text-left">
                {activeTab === 'monitor' && (
                  <div className="space-y-6 mt-4 text-left text-left text-left text-left text-left">
                    {sponsoredArea && (
                      <div className="bg-blue-600/10 border border-blue-500/30 p-3 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-left-2 text-left text-left text-left">
                        <MapPin className="w-5 h-5 text-blue-400 shrink-0" />
                        <div className="text-left text-left text-left">
                          <p className="text-[10px] font-black uppercase text-blue-400">Sponsored Area Active</p>
                          <p className="text-[11px] font-bold text-white">{sponsoredArea}</p>
                        </div>
                      </div>
                    )}

                    {contacts.length === 0 && (
                      <div className="bg-amber-900/20 border border-amber-500/30 p-3 rounded-2xl flex items-center gap-3 animate-in pulse duration-1000 text-left text-left text-left">
                        <Info className="w-5 h-5 text-amber-400 shrink-0" />
                        <div className="text-left text-left text-left">
                          <p className="text-[10px] font-black uppercase text-amber-400">Setup Required</p>
                          <p className="text-[11px] font-bold text-white">Add 1 contact to activate protection</p>
                        </div>
                      </div>
                    )}

                    <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/50 flex items-center justify-between gap-3 group text-left text-left text-left">
                       <div className="flex items-center gap-2 text-left text-left text-left">
                         <Languages className="w-4 h-4 text-blue-400" />
                         <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Listening Language</span>
                       </div>
                       <select 
                          value={user?.preferredLanguage} 
                          onChange={(e) => changeLanguage(e.target.value as SupportedLanguage)}
                          className="bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg outline-none border border-slate-700 focus:border-blue-500 transition-all cursor-pointer"
                        >
                          {Object.entries(LANGUAGE_LABELS).map(([code, label]) => (
                            <option key={code} value={code as SupportedLanguage}>{label}</option>
                          ))}
                        </select>
                    </div>

                    {hasExpired && !sponsoredArea ? (
                      <div className="bg-red-950/40 border border-red-500/40 p-6 rounded-3xl text-center text-left text-left text-left">
                        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                        <h3 className="font-bold text-red-400 text-center">Protection Disabled</h3>
                        <p className="text-[10px] text-slate-400 mt-2 text-center">Renew to enable zero-touch monitoring.</p>
                        <button onClick={() => setActiveTab('sub')} className="w-full bg-red-600 text-white py-3 rounded-2xl font-bold text-sm mt-6 hover:bg-red-700 transition shadow-lg shadow-red-950/50">Renew Now</button>
                      </div>
                    ) : (!isSubscriptionActive && !user?.subscription.hasUsedTrial && !sponsoredArea) ? (
                      <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-3xl text-center text-left text-left text-left">
                        <ShieldCheck className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                        <h3 className="font-bold text-center">Welcome, {user?.name.split(' ')[0]}</h3>
                        <p className="text-[10px] text-slate-400 mt-2 text-center">Activate free trial or upgrade to start protection.</p>
                        <button onClick={() => setActiveTab('sub')} className="w-full bg-blue-600 text-white py-3 rounded-2xl font-bold text-sm mt-6 hover:bg-blue-700 transition text-center text-center text-center">Select Plan</button>
                      </div>
                    ) : (
                      <>
                        <div className="relative mx-auto w-40 h-40 flex items-center justify-center">
                          <div onClick={toggleListening} className={`absolute inset-0 rounded-full border-[6px] flex items-center justify-center cursor-pointer transition-all duration-500 ${isListening ? 'border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.2)] bg-red-500/5 scale-105' : 'border-slate-800 bg-slate-800/20'}`}>
                            {isCalling ? <PhoneCall className="w-14 h-14 text-red-500 animate-pulse" /> : isAnalyzing ? <BrainCircuit className="w-14 h-14 text-blue-400 animate-pulse" /> : <Radio className={`w-14 h-14 ${isListening ? 'text-red-500' : 'text-slate-700'}`} />}
                          </div>
                        </div>
                        <div className="text-center">
                          <h3 className="text-sm font-bold uppercase tracking-widest text-center">{isListening ? 'Protection Active' : 'System Idle'}</h3>
                          <p className="text-[10px] text-slate-400 mt-1 text-center">Say a trigger phrase or tap to toggle</p>
                        </div>
                        <div className="h-8"><VoiceVisualizer isActive={isListening && !isCalling && !isAnalyzing} /></div>
                      </>
                    )}

                    <div className="bg-slate-800/30 p-4 rounded-2xl border border-slate-700/50 space-y-3 text-left text-left text-left">
                       <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 text-left">
                         <Zap className="w-3 h-3 text-red-500" /> Current Trigger Phrases
                       </h4>
                       <div className="space-y-2 text-left text-left text-left">
                         {currentPhrases.map((phrase, idx) => (
                           <div key={idx} className="flex items-start gap-2 bg-slate-900/50 p-2 rounded-xl border border-slate-700/30 transition-colors hover:border-slate-600 text-left text-left text-left">
                             <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                             <p className="text-[11px] font-medium text-slate-300 italic">"{phrase}"</p>
                           </div>
                         ))}
                       </div>
                    </div>
                  </div>
                )}

                {activeTab === 'contacts' && (
                  <div className="space-y-6 mt-4 text-left text-left text-left">
                    <div className="flex justify-between items-center text-left text-left text-left text-left text-left">
                      <h3 className="font-bold text-left">Emergency Circle</h3>
                      {contacts.length < 5 && (
                        <button onClick={() => setIsAddingContact(true)} className="p-1 bg-red-600 rounded-full">
                          <Plus className="w-4 h-4 text-white" />
                        </button>
                      )}
                    </div>
                    
                    {contactWarning && (
                      <div className="bg-red-500/10 border border-red-500/30 p-2 rounded-xl text-[10px] text-red-400 font-bold animate-bounce text-left text-left text-left">
                        {contactWarning}
                      </div>
                    )}

                    {isAddingContact && (
                      <form onSubmit={saveNewContact} className="bg-slate-800 p-4 rounded-2xl border border-red-500/20 space-y-3 text-left text-left text-left text-left text-left">
                        <input type="text" placeholder="Name" required value={newName} onChange={e => setNewName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-sm text-white outline-none" />
                        <input type="tel" placeholder="Phone" required value={newPhone} onChange={e => setNewPhone(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-sm text-white outline-none" />
                        <button type="submit" className="w-full bg-red-600 text-white py-2 rounded-xl text-xs font-bold">Add Contact</button>
                      </form>
                    )}
                    
                    {contacts.length === 0 ? (
                      <div className="bg-slate-800/30 p-8 rounded-3xl border border-dashed border-slate-700 text-center text-left text-left text-left">
                        <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-xs text-slate-500 leading-relaxed text-center">Your circle is empty.<br/>Add at least 1 contact to activate AI protection.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 text-left text-left text-left">
                        {contacts.map(c => (
                          <div key={c.id} className={`bg-slate-800/50 p-3 rounded-2xl flex justify-between items-center border transition-all ${c.isPrimary ? 'border-blue-500/50 shadow-lg shadow-blue-500/5' : 'border-slate-700/50'}`}>
                            <div className="text-left flex-1 text-left text-left text-left">
                              <div className="flex items-center gap-2 text-left text-left text-left">
                                <p className="text-sm font-bold">{c.name}</p>
                                {c.isPrimary && <Star className="w-3 h-3 fill-blue-500 text-blue-500" />}
                              </div>
                              <p className="text-[10px] text-slate-500">{c.phone}</p>
                            </div>
                            <div className="flex items-center gap-2 text-left text-left text-left">
                              {!c.isPrimary && (
                                <button 
                                  onClick={() => backend.setPrimaryContact(c.id).then(() => backend.getContacts().then(setContacts))}
                                  className="text-[8px] font-black uppercase text-blue-400 px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20"
                                >
                                  Set Primary
                                </button>
                              )}
                              <button onClick={() => backend.deleteContact(c.id).then(() => backend.getContacts().then(setContacts))} className="text-slate-500 hover:text-red-400 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Optional Contacts Section */}
                    <div className="space-y-4 pt-4 border-t border-slate-800 text-left text-left text-left">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-left">Optional Public Services</h4>
                      <div className="space-y-3 text-left text-left text-left">
                        <div className="flex items-center gap-3 bg-slate-800/40 p-3 rounded-2xl border border-slate-700/30 text-left text-left text-left text-left text-left text-left">
                          <Siren className="w-5 h-5 text-red-400" />
                          <input 
                            type="tel" 
                            placeholder="Local Police (Optional)" 
                            value={newPolice} 
                            onChange={e => setNewPolice(e.target.value)}
                            onBlur={handleUpdateSpecial}
                            className="bg-transparent text-sm text-white outline-none w-full"
                          />
                        </div>
                        <div className="flex items-center gap-3 bg-slate-800/40 p-3 rounded-2xl border border-slate-700/30 text-left text-left text-left text-left text-left text-left">
                          <Cross className="w-5 h-5 text-green-400" />
                          <input 
                            type="tel" 
                            placeholder="Local Ambulance (Optional)" 
                            value={newAmbulance} 
                            onChange={e => setNewAmbulance(e.target.value)}
                            onBlur={handleUpdateSpecial}
                            className="bg-transparent text-sm text-white outline-none w-full"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 p-3 bg-slate-800/20 rounded-2xl border border-slate-700/30 text-left text-left text-left text-left text-left">
                      <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Response Protocol</p>
                      <ul className="text-[9px] text-slate-600 space-y-1 list-disc pl-3 text-left text-left text-left">
                        <li>Primary contact receives a direct voice call.</li>
                        <li>Other contacts & public services get SMS alerts.</li>
                        <li>Actions only occur for contacts you explicitly add.</li>
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'sub' && (
                  <div className="space-y-5 mt-4 text-left text-left text-left">
                    <div className="bg-slate-800 p-5 rounded-3xl text-center relative overflow-hidden text-left text-left text-left text-left text-left">
                      <button onClick={handleSignOut} className="absolute top-4 right-4 text-slate-500 hover:text-red-500 transition"><LogOut className="w-4 h-4" /></button>
                      <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3"><User className="w-6 h-6 text-slate-400" /></div>
                      <p className="font-black text-white text-center">{user?.name}</p>
                      {sponsoredArea ? (
                        <div className="mt-4 text-left bg-blue-600/10 p-4 rounded-2xl space-y-2 border border-blue-500/30 text-left text-left text-left text-left text-left">
                          <p className="text-[10px] uppercase font-black tracking-widest text-blue-400 flex justify-between items-center text-left">District Program <Building className="w-3 h-3" /></p>
                          <p className="text-sm font-bold text-white text-left">Full Protection Active</p>
                          <p className="text-[9px] text-blue-300 text-left">Your safety is covered by {sponsoredArea}.</p>
                        </div>
                      ) : isSubscriptionActive ? (
                        <div className="mt-4 text-left bg-slate-900/50 p-4 rounded-2xl space-y-2 border border-slate-700/50 text-left text-left text-left text-left text-left">
                          <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 flex justify-between items-center text-left">Active Plan <Check className="w-3 h-3 text-green-500" /></p>
                          <p className="text-sm font-bold text-blue-400 text-left">{user?.subscription.tier === SubscriptionTier.FREE ? 'Trial Shield' : user?.subscription.tier}</p>
                          <div className="pt-2 grid grid-cols-2 gap-2 text-left">
                             <div className="text-left"><p className="text-[8px] text-slate-500 uppercase">Started</p><p className="text-[10px] font-mono text-white">{new Date(user?.subscription.activatedAt || 0).toLocaleDateString()}</p></div>
                             <div className="text-left"><p className="text-[8px] text-slate-500 uppercase">Expires</p><p className="text-[10px] font-mono text-white">{new Date(user?.subscription.expiresAt || 0).toLocaleDateString()}</p></div>
                          </div>
                        </div>
                      ) : (
                        <button onClick={activateTrial} className="w-full bg-red-600 text-white py-3 rounded-2xl text-xs font-black mt-4 shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 transition hover:bg-red-700 text-left text-left text-left text-left text-left text-left text-left"><Sparkles className="w-4 h-4" /> START FREE TRIAL</button>
                      )}
                    </div>
                    
                    {!sponsoredArea && (
                      <div className="space-y-3 animate-in fade-in duration-500 text-left text-left text-left">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1 text-left">Upgrade Plans</h4>
                        <button onClick={() => startUpgradeFlow(SubscriptionTier.MONTHLY)} className="w-full bg-slate-800 border border-slate-700 p-4 rounded-2xl text-left flex justify-between items-center hover:border-blue-500 transition text-white text-left text-left text-left">
                          <div className="text-left text-left text-left"><p className="font-bold text-sm">Monthly Guardian</p><p className="text-xs text-slate-500">₹99 / month</p></div>
                          <ChevronRight className="w-4 h-4 text-slate-500" />
                        </button>
                        <button onClick={() => startUpgradeFlow(SubscriptionTier.YEARLY)} className="w-full bg-slate-800 border border-blue-500/30 p-4 rounded-2xl text-left flex justify-between items-center relative overflow-hidden group text-white text-left text-left text-left text-left text-left">
                          <div className="absolute top-0 right-0 bg-blue-600 px-2 py-0.5 text-[8px] font-black uppercase text-left text-left text-left">Save 80%</div>
                          <div className="text-left text-left text-left"><p className="font-bold text-sm">Annual Shield</p><p className="text-xs text-slate-500">₹499 / year</p></div>
                          <ChevronRight className="w-4 h-4 text-slate-500" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="space-y-4 mt-4 text-white text-left text-left text-left">
                    <h3 className="font-bold text-left text-left text-left text-left text-left">Incident Logs</h3>
                    <div className="space-y-3 text-left text-left text-left">
                      {alerts.length === 0 ? <p className="text-[10px] text-slate-500 text-center py-10">No alerts triggered yet.</p> : 
                        alerts.map(a => (
                          <div key={a.id} className="bg-slate-800/50 p-3 rounded-2xl border-l-4 border-l-red-500 border border-slate-700/50 transition-transform hover:scale-[1.02] text-left text-left text-left">
                            <div className="flex justify-between items-start text-left text-left text-left">
                              <p className="text-xs font-bold">Trigger: "{a.triggerPhrase}"</p>
                              <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${a.type === 'emergency' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                {a.type}
                              </span>
                            </div>
                            <p className="text-[9px] text-slate-500 mt-1 font-mono flex items-center gap-1 text-left text-left text-left text-left text-left text-left text-left"><Clock className="w-2.5 h-2.5" /> {new Date(a.timestamp).toLocaleString()}</p>
                            {a.details && <p className="text-[8px] text-slate-400 mt-2 leading-relaxed text-left italic text-left text-left text-left text-left text-left text-left">{a.details}</p>}
                            <div className="mt-2 text-[8px] font-black uppercase tracking-widest text-green-500 text-left text-left text-left text-left text-left text-left text-left text-left text-left">Alert Dispatched ✔</div>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-16 bg-slate-800 border-t border-slate-700 flex justify-around items-center z-50">
                <button onClick={() => setActiveTab('monitor')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'monitor' ? 'text-red-500' : 'text-slate-500'}`}><Shield className="w-5 h-5" /><span className="text-[7px] font-black uppercase tracking-tighter text-left text-left text-left text-left text-left text-left">Safe</span></button>
                <button onClick={() => setActiveTab('contacts')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'contacts' ? 'text-red-500' : 'text-slate-500'}`}><Users className="w-5 h-5" /><span className="text-[7px] font-black uppercase tracking-tighter text-left text-left text-left text-left text-left text-left">Circle</span></button>
                <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'history' ? 'text-red-500' : 'text-slate-500'}`}><History className="w-5 h-5" /><span className="text-[7px] font-black uppercase tracking-tighter text-left text-left text-left text-left text-left text-left text-left">Logs</span></button>
                <button onClick={() => setActiveTab('sub')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'sub' ? 'text-red-500' : 'text-slate-500'}`}><User className="w-5 h-5" /><span className="text-[7px] font-black uppercase tracking-tighter text-left text-left text-left text-left text-left text-left">Pro</span></button>
              </div>
            </>
          )}
        </PhoneFrame>
      </div>
    </div>
  );
};

export default App;
