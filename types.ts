
export enum SubscriptionTier {
  FREE = 'FREE',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY'
}

export type SupportedLanguage = 'en-US' | 'hi-IN' | 'bn-IN' | 'ta-IN' | 'te-IN' | 'kn-IN' | 'ml-IN' | 'mr-IN' | 'gu-IN' | 'pa-IN';

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  'en-US': 'English',
  'hi-IN': 'हिन्दी (Hindi)',
  'bn-IN': 'বাংলা (Bengali)',
  'ta-IN': 'தமிழ் (Tamil)',
  'te-IN': 'తెలుగు (Telugu)',
  'kn-IN': 'ಕನ್ನಡ (Kannada)',
  'ml-IN': 'മലയാളം (Malayalam)',
  'mr-IN': 'मराठी (Marathi)',
  'gu-IN': 'ગુજરાતી (Gujarati)',
  'pa-IN': 'ਪੰਜਾਬੀ (Punjabi)'
};

export const TRIGGER_PHRASES: Record<SupportedLanguage, string[]> = {
  'en-US': ["I need help right now", "This is an emergency, please help me", "I am in danger, help"],
  'hi-IN': ["मुझे अभी मदद चाहिए", "यह एक आपातकाल है मदद करें", "मैं खतरे में हूं मदद करें"],
  'bn-IN': ["আমার এখন সাহায্যের প্রয়োজন", "এটি একটি জরুরি অবস্থা সাহায্য করুন", "আমি বিপদে আছি সাহায্য করুন"],
  'ta-IN': ["எனக்கு இப்போது உதவி தேவை", "இது ஒரு அவசர நிலை எனக்கு உதவுங்கள்", "நான் ஆபத்தில் இருக்கிறேன் உதவி"],
  'te-IN': ["నాకు ఇప్పుడు సహాయం కావాలి", "ఇది అత్యవసర పరిస్థితి నాకు సహాయం చేయండి", "నేను ప్రమాదంలో ఉన్నాను సహాయం"],
  'kn-IN': ["ನನಗೆ ಈಗ ಸಹಾಯ ಬೇಕು", "ಇದು ತುರ್ತು ಪರಿಸ್ਥಿತಿ ದಯವಿಟ್ಟು ನನಗೆ ಸಹಾಯ ಮಾಡಿ", "ನಾನು ಅಪಾಯದಲ್ಲಿದ್ದೇನೆ ಸಹಾಯ ಮಾಡಿ"],
  'ml-IN': ["എനിക്ക് ഇപ്പോൾ സഹായം വേണം", "ഇതൊരു അടിയന്തര സാഹചര്യമാണ് സഹായിക്കൂ", "ഞാൻ അപകടത്തിലാണ് സഹായിക്കൂ"],
  'mr-IN': ["मला आता मदतीची गरज आहे", "ही आणीबाणी आहे कृपया मला मदत करा", "मी संकटात आहे मदत करा"],
  'gu-IN': ["મને અત્યારે મદદની જરૂર છે", "આ એક ઇમરજન્સી છે મહેરબાની કરીને મને મદદ કરો", "હું જોખમમાં છું મદદ કરો"],
  'pa-IN': ["ਮੈਨੂੰ ਹੁਣੇ ਮਦਦ ਚਾਹੀਦੀ ਹੈ", "ਇਹ ਇੱਕ ਐਮਰਜੈਂਸੀ ਹੈ ਕਿਰਪਾ ਕਰਕੇ ਮੇਰੀ ਮਦਦ ਕਰੋ", "ਮੈਂ ਖਤਰੇ ਵਿੱਚ ਹਾਂ ਮਦਦ ਕਰੋ"]
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
