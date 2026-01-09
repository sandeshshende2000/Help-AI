
import { UserProfile, EmergencyContact, SubscriptionTier, AlertLog, SupportedLanguage } from '../types';

class MockBackend {
  private user: UserProfile = {
    id: 'user_123',
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '+91 98765 43210',
    createdAt: Date.now() - (15 * 24 * 60 * 60 * 1000),
    isVerified: false,
    preferredLanguage: 'en-US',
    subscription: {
      tier: SubscriptionTier.FREE,
      expiresAt: 0,
      activatedAt: 0,
      hasUsedTrial: false
    }
  };

  private contacts: EmergencyContact[] = [
    { id: 'c1', name: 'John Doe', phone: '+91 11111 22222', relation: 'Brother', isPrimary: true }
  ];

  private alerts: AlertLog[] = [];

  constructor() {
    const savedUser = localStorage.getItem('help_mock_user');
    if (savedUser) {
      this.user = JSON.parse(savedUser);
    }

    const savedContacts = localStorage.getItem('help_mock_contacts');
    if (savedContacts) {
      this.contacts = JSON.parse(savedContacts);
    }

    const savedAlerts = localStorage.getItem('help_mock_alerts');
    if (savedAlerts) {
      this.alerts = JSON.parse(savedAlerts);
    }
    
    this.pruneAlerts();
  }

  private persist() {
    localStorage.setItem('help_mock_user', JSON.stringify(this.user));
    localStorage.setItem('help_mock_contacts', JSON.stringify(this.contacts));
    localStorage.setItem('help_mock_alerts', JSON.stringify(this.alerts));
  }

  private pruneAlerts() {
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const initialCount = this.alerts.length;
    this.alerts = this.alerts.filter(alert => (now - alert.timestamp) < SEVEN_DAYS_MS);
    if (this.alerts.length !== initialCount) {
      this.persist();
    }
  }

  async getProfile(): Promise<UserProfile> {
    return { ...this.user };
  }

  async updateSpecialContacts(police?: string, ambulance?: string): Promise<UserProfile> {
    this.user.policeContact = police;
    this.user.ambulanceContact = ambulance;
    this.persist();
    return { ...this.user };
  }

  async updateLanguage(lang: SupportedLanguage): Promise<UserProfile> {
    this.user.preferredLanguage = lang;
    this.persist();
    return { ...this.user };
  }

  async verifyAccount(): Promise<UserProfile> {
    this.user.isVerified = true;
    this.persist();
    return { ...this.user };
  }

  async activateTrial(): Promise<UserProfile> {
    if (this.user.subscription.hasUsedTrial) {
      throw new Error("Trial already used.");
    }
    const now = Date.now();
    this.user.subscription.activatedAt = now;
    this.user.subscription.expiresAt = now + (30 * 24 * 60 * 60 * 1000);
    this.user.subscription.hasUsedTrial = true;
    this.user.subscription.tier = SubscriptionTier.FREE; 
    this.persist();
    return { ...this.user };
  }

  async buySubscription(tier: SubscriptionTier): Promise<UserProfile> {
    const now = Date.now();
    this.user.subscription.tier = tier;
    this.user.subscription.activatedAt = now;
    this.user.subscription.expiresAt = tier === SubscriptionTier.MONTHLY 
      ? now + (30 * 24 * 60 * 60 * 1000)
      : now + (365 * 24 * 60 * 60 * 1000);
    this.persist();
    return { ...this.user };
  }

  async getContacts(): Promise<EmergencyContact[]> {
    return [...this.contacts];
  }

  async addContact(contact: Omit<EmergencyContact, 'id' | 'isPrimary'>): Promise<EmergencyContact> {
    const isPrimary = this.contacts.length === 0;
    const newContact = { 
      ...contact, 
      id: Math.random().toString(36).substr(2, 9),
      isPrimary
    };
    this.contacts.push(newContact);
    this.persist();
    return newContact;
  }

  async setPrimaryContact(id: string): Promise<void> {
    this.contacts = this.contacts.map(c => ({
      ...c,
      isPrimary: c.id === id
    }));
    this.persist();
  }

  async deleteContact(id: string): Promise<void> {
    const wasPrimary = this.contacts.find(c => c.id === id)?.isPrimary;
    this.contacts = this.contacts.filter(c => c.id !== id);
    if (wasPrimary && this.contacts.length > 0) {
      this.contacts[0].isPrimary = true;
    }
    this.persist();
  }

  async triggerEmergency(phrase: string): Promise<AlertLog> {
    const type = phrase.toLowerCase().includes('emergency') ? 'emergency' : 'help';
    const primary = this.contacts.find(c => c.isPrimary);
    const others = this.contacts.filter(c => !c.isPrimary);
    
    let details = `Called Primary: ${primary?.name || 'None'}. `;
    details += `Messaged: ${others.map(o => o.name).join(', ') || 'None'}. `;
    if (this.user.policeContact) details += `Alerted Police. `;
    if (this.user.ambulanceContact) details += `Alerted Ambulance. `;

    const alert: AlertLog = {
      id: `alert_${Date.now()}`,
      timestamp: Date.now(),
      triggerPhrase: phrase,
      status: 'sent',
      type: type,
      details: details
    };
    
    console.log(`[BACKEND] EMERGENCY DISPATCH (${type.toUpperCase()}): "${phrase}"`);
    console.log(`[BACKEND] Details: ${details}`);
    
    this.alerts.unshift(alert);
    this.pruneAlerts();
    this.persist();
    return alert;
  }

  async getAlertHistory(): Promise<AlertLog[]> {
    this.pruneAlerts();
    return [...this.alerts];
  }
}

export const backend = new MockBackend();
