export enum SubscriptionTier {
  FREE = 'FREE',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY'
}

export type SupportedLanguage = 'en' | 'hi' | 'bn' | 'ta' | 'te' | 'kn' | 'ml' | 'mr' | 'gu' | 'pa';

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  'en': 'English',
  'hi': 'हिंदी',
  'bn': 'বাংলা',
  'ta': 'தமிழ்',
  'te': 'తెలుగు',
  'kn': 'ಕನ್ನಡ',
  'ml': 'മലയാളം',
  'mr': 'मराठी',
  'gu': 'ગુજરાતી',
  'pa': 'ਪੰਜਾਬੀ'
};

export const TRIGGER_PHRASES: Record<SupportedLanguage, string[]> = {
  'en': [
    "i need help right now",
    "please help me",
    "i am not safe"
  ],
  'hi': [
    "मुझे अभी मदद चाहिए",
    "कृपया मेरी मदद करें",
    "मैं सुरक्षित नहीं हूँ"
  ],
  'bn': [
    "আমার সাহায্য দরকার",
    "দয়া করে আমাকে সাহায্য করুন",
    "আমি নিরাপদ নই"
  ],
  'ta': [
    "எனக்கு உதவி வேண்டும்",
    "தயவு செய்து உதவுங்கள்",
    "நான் பாதுகாப்பில் இல்லை"
  ],
  'te': [
    "నాకు సహాయం కావాలి",
    "దయచేసి సహాయం చేయండి",
    "నేను సురక్షితంగా లేను"
  ],
  'kn': [
    "ನನಗೆ ಸಹಾಯ ಬೇಕು",
    "ದಯವಿಟ್ಟು ಸಹಾಯ ಮಾಡಿ",
    "ನಾನು ಸುರಕ್ಷಿತವಾಗಿಲ್ಲ"
  ],
  'ml': [
    "എനിക്ക് സഹായം വേണം",
    "ദയവായി സഹായിക്കൂ",
    "ഞാൻ സുരക്ഷിതനല്ല"
  ],
  'mr': [
    "मला मदत हवी आहे",
    "कृपया मदत करा",
    "मी सुरक्षित नाही"
  ],
  'gu': [
    "મને મદદ જોઈએ છે",
    "કૃપા કરીને મદદ કરો",
    "હું સુરક્ષિત નથી"
  ],
  'pa': [
    "ਮੈਨੂੰ ਮਦਦ ਚਾਹੀਦੀ ਹੈ",
    "ਕਿਰਪਾ ਕਰਕੇ ਮਦਦ ਕਰੋ",
    "ਮੈਂ ਸੁਰੱਖਿਅਤ ਨਹੀਂ ਹਾਂ"
  ]
};

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: number;
  isVerified: boolean;
  preferredLanguage: SupportedLanguage;
  policeContact?: string;
  ambulanceContact?: string;
  subscription: {
    tier: SubscriptionTier;
    expiresAt: number;
    activatedAt: number;
    hasUsedTrial: boolean;
  };
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
  isPrimary: boolean;
}

export interface AlertLog {
  id: string;
  timestamp: number;
  triggerPhrase: string;
  status: 'sent' | 'failed';
  type: 'emergency' | 'help';
  details?: string;
}
