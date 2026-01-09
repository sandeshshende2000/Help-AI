import { TRIGGER_PHRASES, SupportedLanguage } from '../types';

/**
 * ARCHITECTURE NOTE:
 * In Flutter, this would use 'speech_to_text' with a background service.
 * For this web-based MVP simulator, we use the browser's Web Speech API.
 */

type OnTriggerCallback = (phrase: string) => void;
type OnStatusChange = (status: 'listening' | 'stopped' | 'error') => void;

// Mapping internal 2-letter codes to browser recognition locales
const BROWSER_LANG_MAP: Record<SupportedLanguage, string> = {
  'en': 'en-US',
  'hi': 'hi-IN',
  'bn': 'bn-IN',
  'ta': 'ta-IN',
  'te': 'te-IN',
  'kn': 'kn-IN',
  'ml': 'ml-IN',
  'mr': 'mr-IN',
  'gu': 'gu-IN',
  'pa': 'pa-IN'
};

class VoiceService {
  private recognition: any = null;
  private isListening: boolean = false;
  private onTrigger: OnTriggerCallback | null = null;
  private onStatus: OnStatusChange | null = null;
  private lastTriggerTime: number = 0;
  private COOLDOWN_MS = 10000;
  private restartTimeout: any = null;
  private currentLanguage: SupportedLanguage = 'en';

  constructor() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;

      this.recognition.onresult = (event: any) => {
        let latestTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          latestTranscript += event.results[i][0].transcript;
        }
        this.checkForTrigger(latestTranscript);
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          this.safeRestart();
        }
      };

      this.recognition.onerror = (event: any) => {
        if (event.error === 'no-speech') {
          console.debug('VoiceService: No speech detected, restarting session...');
        } else {
          console.warn('VoiceService: Speech recognition error', event.error);
          this.onStatus?.('error');
        }
        if (this.isListening && event.error !== 'not-allowed') {
          this.safeRestart();
        }
      };
    }
  }

  private normalize(text: string): string {
    return text
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "") // remove punctuation
      .replace(/\s{2,}/g, " ") // normalize whitespace
      .trim();
  }

  private safeRestart() {
    if (this.restartTimeout) clearTimeout(this.restartTimeout);
    this.restartTimeout = setTimeout(() => {
      if (this.isListening && this.recognition) {
        try {
          this.recognition.lang = BROWSER_LANG_MAP[this.currentLanguage];
          this.recognition.start();
          this.onStatus?.('listening');
        } catch (e) {
          console.debug('VoiceService: Restart attempt ignored');
        }
      }
    }, 300);
  }

  private checkForTrigger(transcript: string) {
    const now = Date.now();
    if (now - this.lastTriggerTime < this.COOLDOWN_MS) return;

    const normalizedTranscript = this.normalize(transcript);
    const phrases = TRIGGER_PHRASES[this.currentLanguage];
    
    // Check ALL trigger phrases in the current language
    for (const phrase of phrases) {
      const normalizedPhrase = this.normalize(phrase);
      if (normalizedTranscript.includes(normalizedPhrase)) {
        console.log(`VoiceService: Trigger detected (${this.currentLanguage})! -> "${phrase}"`);
        this.lastTriggerTime = now;
        this.onTrigger?.(phrase);
        break; // Match found, activate emergency flow
      }
    }
  }

  start(lang: SupportedLanguage, onTrigger: OnTriggerCallback, onStatus: OnStatusChange) {
    if (!this.recognition) {
      alert("Voice recognition not supported in this browser.");
      return;
    }
    this.currentLanguage = lang;
    this.onTrigger = onTrigger;
    this.onStatus = onStatus;
    this.isListening = true;
    
    try {
      this.recognition.lang = BROWSER_LANG_MAP[lang];
      this.recognition.start();
      this.onStatus('listening');
    } catch (e) {
      this.safeRestart();
    }
  }

  stop() {
    this.isListening = false;
    if (this.restartTimeout) clearTimeout(this.restartTimeout);
    try {
      this.recognition?.stop();
    } catch (e) {}
    this.onStatus?.('stopped');
  }
}

export const voiceService = new VoiceService();
