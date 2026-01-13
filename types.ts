
export type DocumentType = 'e-ticket' | 'voucher_hospedagem' | 'cartao_embarque' | 'voucher_servico' | 'outro';

export interface ChatMessage {
  id: string;
  sender: 'passenger' | 'agency';
  text: string;
  timestamp: string;
}

export interface TravelDocument {
  id: string;
  name: string;
  type: DocumentType;
  url: string;
  uploadDate: string;
}

export interface TripUpdate {
  id: string;
  date: string;
  description: string;
}

export interface AgendaItem {
  id: string;
  time: string; // HH:mm
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
  location?: string;
  type: 'flight' | 'hotel' | 'activity' | 'transport' | 'other';
}

export interface Suggestion {
  id?: string;
  title: string;
  description: string;
  type: 'gastronomia' | 'cultura' | 'aventura' | 'relaxamento';
  isPurchased: boolean;
  reason?: string;
  source?: 'ai' | 'agency';
}

export interface Trip {
  id: string;
  accessCode: string;
  passengerName: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  documents: TravelDocument[];
  updates: TripUpdate[];
  messages: ChatMessage[];
  agenda: AgendaItem[];
  recommendations: Suggestion[];
  encryptedData?: string; // New field for E2E storage
}

export interface AppState {
  currentView: 'landing' | 'passenger-dashboard' | 'agency-dashboard';
  userRole: 'passenger' | 'agency';
  selectedTripId: string | null;
  loggedPassengerTripId: string | null;
  logoUrl: string | null;
}
