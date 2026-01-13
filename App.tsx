
import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import LandingPage from './components/LandingPage';
import PassengerDashboard from './components/PassengerDashboard';
import AgencyDashboard from './components/AgencyDashboard';
import ChatWindow from './components/ChatWindow';
import NotificationToast from './components/NotificationToast';
import { Trip, AppState, ChatMessage } from './types';
import { isSecureConnection, encryptData } from './services/securityService';

const DEFAULT_LOGO = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MDAgMzUwIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZDEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojRUU4RjY2O3N0b3Atb3BhY2l0eToxIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNBMzkxNjE7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8ZyBmaWxsPSJub25lIiBzdHJva2U9InVybCgjZ3JhZDEpIiBzdHJva2Utd3lkdGg9IjIuNSI+CiAgICA8Y2lyY2xlIGN4PSIyNTAiIGN5PSIxMDAiIHI9IjgwIi8+CiAgICA8cGF0aCBkPSJNMjUwIDIwIEMyODAgNDAgMzAwIDgwIDI1MCAxODAgQzIwMCA4MCAyMjAgNDAgMjUwIDIwIiBzdHJva2Utd3lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9IjAuNiIvPgogICAgPHBhdGggZD0iTTE3NSAxMDAgQzIwMCA4MCAzMDAgODAgMzI1IDEwMCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1vcGFjaXR5PSIwLjYiLz4KICAgIDxwYXRoIGQ9Ik0xODggNjAgQzIyMCA1MCAyODAgNTAgMzEyIDYwIiBzdHJva2Utd3lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9IjAuNiIvPgogICAgPHBhdGggZD0iTTE4OCAxNDAgQzIyMCAxNTAgMjgwIDE1MCAzMTIgMTQwIiBzdHJva2Utd3lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9IjAuNiIvPgogIDwvZz4KICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgzMTAsIDEzMCkiPgogICAgPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMzAiIGZpbGw9IndoaXRlIiBzdHJva2U9InVybCgjZ3JhZDEpIiBzdHJva2Utd3lkdGg9IjIiLz4KICAgIDxyZWN0IHg9IjE1LFkyNSIgd3lkdGg9IjMwIiBoZWlnaHQ9IjIwIiByeD0iMyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ1cmwoI2dyYWQxKSIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgICA8cGF0aCBkPSJNMjIgMjUgViAyMiBBMiAyIDAgMCAxIDIzIDIwIEggMzcgQTIgMiAwIDAgMSAzOCAyMiBWIDI1IiBmaWxsPSJub25lIiBzdHJva2U9InVybCgjZ3JhZDEpIiBzdHJva2Utd3lkdGg9IjIiLz4KICA8L2c+CiAgPHRleHQgeD0iMjUwIiB5PSIyNzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSInQWJyaWwgRmF0ZmFjZScsIHNlcmlmIiBmb250LXNpemU9IjY4IiBmaWxsPSIjRUU4RjY2IiBzdHlsZT0ibGV0dGVyLXNwYWNpbmc6IDRweDsiPlRST1RBAU1VTkRPPC90ZXh0PgogIDx0ZXh0IHg9IjI1MCIgeT0iMzIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyOCIgZmlsbD0iI0EzOTE2MSIgZm9udC13ZWlnaHQ9IjMwMCIgc3R5bGU9ImxldHRlci1zcGFjaW5nOiA0cHg7IG9wYWNpdHk6IDAuODsiPlNvbHVjw6VlcyBlbSB2aWFnZW5zPC90ZXh0Pgo8L3N2Zz4=`;

const INITIAL_TRIPS: Trip[] = [
  {
    id: '1',
    accessCode: 'PARIS24',
    passengerName: 'Maria Silva',
    destination: 'Paris, França',
    startDate: '2024-05-10',
    endDate: '2024-05-20',
    status: 'upcoming',
    documents: [
      { id: 'd1', name: 'E-Ticket Air France', type: 'e-ticket', url: '#', uploadDate: '2024-03-01' },
      { id: 'd2', name: 'Voucher Hotel Pullman', type: 'voucher_hospedagem', url: '#', uploadDate: '2024-03-05' }
    ],
    updates: [
      { id: 'u1', date: '2024-03-01', description: 'Passagens confirmadas e emitidas!' },
      { id: 'u2', date: '2024-03-06', description: 'Voucher do hotel enviado. Café da manhã incluso.' }
    ],
    messages: [],
    agenda: [
      { id: 'a1', date: '2024-05-10', time: '14:30', title: 'Voo Partida GRU', description: 'Voo AF457 com destino a Paris (CDG)', location: 'Terminal 3 - Guarulhos', type: 'flight' }
    ],
    recommendations: [
      {
        id: 'r1',
        title: 'Café de Flore',
        description: 'Um dos cafés mais antigos e prestigiosos de Paris, famoso por sua clientela célebre.',
        type: 'gastronomia',
        isPurchased: false,
        source: 'agency',
        reason: 'Recomendação clássica da nossa equipe'
      }
    ]
  }
];

const App: React.FC = () => {
  const [isEmbedded, setIsEmbedded] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsEmbedded(params.get('embed') === 'true' || window.self !== window.top);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const [state, setState] = useState<AppState>(() => {
    const savedLogo = localStorage.getItem('trotamundo_custom_logo');
    if (savedLogo === DEFAULT_LOGO) localStorage.removeItem('trotamundo_custom_logo');
    
    return {
      currentView: 'landing',
      userRole: 'passenger',
      selectedTripId: null,
      loggedPassengerTripId: null,
      logoUrl: savedLogo || DEFAULT_LOGO
    };
  });

  const [trips, setTrips] = useState<Trip[]>(() => {
    const savedTrips = localStorage.getItem('trotamundo_trips');
    return savedTrips ? JSON.parse(savedTrips) : INITIAL_TRIPS;
  });

  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ show: boolean, message: string, sender: string, tripId: string }>({
    show: false, message: '', sender: '', tripId: ''
  });

  const prevTripsRef = useRef<Trip[]>(trips);

  useEffect(() => {
    localStorage.setItem('trotamundo_trips', JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    trips.forEach((currentTrip) => {
      const prevTrip = prevTripsRef.current.find(t => t.id === currentTrip.id);
      if (prevTrip && currentTrip.messages.length > prevTrip.messages.length) {
        const lastMsg = currentTrip.messages[currentTrip.messages.length - 1];
        if (lastMsg.sender !== state.userRole) {
          const senderName = lastMsg.sender === 'agency' ? 'Trotamundo Viagens' : currentTrip.passengerName;
          if (activeChatId !== currentTrip.id) {
            setNotification({ show: true, message: lastMsg.text, sender: senderName, tripId: currentTrip.id });
          }
          if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
            new Notification(`Mensagem da Trotamundo`, {
              body: `${senderName}: ${lastMsg.text}`,
              icon: 'https://i.imgur.com/YV7h8Iq.png'
            });
          }
        }
      }
    });
    prevTripsRef.current = trips;
  }, [trips, state.userRole, activeChatId]);

  useEffect(() => {
    if (state.logoUrl && state.logoUrl !== DEFAULT_LOGO) {
      localStorage.setItem('trotamundo_custom_logo', state.logoUrl);
    } else if (state.logoUrl === DEFAULT_LOGO) {
      localStorage.removeItem('trotamundo_custom_logo');
    }
  }, [state.logoUrl]);

  const handleLogin = (role: 'passenger' | 'agency', code?: string) => {
    if (role === 'passenger' && code) {
      const trip = trips.find(t => t.accessCode.toUpperCase() === code.toUpperCase());
      if (trip) {
        setState(prev => ({
          ...prev,
          userRole: 'passenger',
          loggedPassengerTripId: trip.id,
          currentView: 'passenger-dashboard'
        }));
        return true;
      }
      return false;
    } else if (role === 'agency') {
      setState(prev => ({ ...prev, userRole: 'agency', currentView: 'agency-dashboard' }));
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setState(prev => ({ ...prev, currentView: 'landing', selectedTripId: null, loggedPassengerTripId: null }));
    setActiveChatId(null);
  };

  const updateTrip = async (updatedTrip: Trip) => {
    try {
      const encryptedBlob = await encryptData(updatedTrip, updatedTrip.accessCode);
      const tripWithEncryption = { ...updatedTrip, encryptedData: encryptedBlob };
      setTrips(prev => prev.map(t => t.id === updatedTrip.id ? tripWithEncryption : t));
    } catch (e) {
      console.error("Failed to encrypt trip during update", e);
      setTrips(prev => prev.map(t => t.id === updatedTrip.id ? updatedTrip : t));
    }
  };

  const addTrip = async (newTrip: Trip) => {
    try {
      const encryptedBlob = await encryptData(newTrip, newTrip.accessCode);
      const tripWithEncryption = { ...newTrip, encryptedData: encryptedBlob };
      setTrips(prev => [...prev, tripWithEncryption]);
    } catch (e) {
      console.error("Failed to encrypt trip during addition", e);
      setTrips(prev => [...prev, newTrip]);
    }
  };

  const sendMessage = (tripId: string, text: string) => {
    const newMessage: ChatMessage = {
      id: Math.random().toString(),
      sender: state.userRole,
      text,
      timestamp: new Date().toISOString()
    };
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, messages: [...t.messages, newMessage] } : t));
  };

  const renderView = () => {
    switch (state.currentView) {
      case 'landing':
        return <LandingPage onLogin={handleLogin} logoUrl={state.logoUrl} isEmbedded={isEmbedded} />;
      case 'passenger-dashboard':
        const filteredTrips = trips.filter(t => t.id === state.loggedPassengerTripId);
        return <PassengerDashboard trips={filteredTrips} onSelectTrip={(id) => setState(prev => ({ ...prev, selectedTripId: id }))} onOpenChat={setActiveChatId} onLogout={handleLogout} hideHeaderFooter={isEmbedded} />;
      case 'agency-dashboard':
        return <AgencyDashboard trips={trips} onUpdateTrip={updateTrip} onAddTrip={addTrip} onOpenChat={setActiveChatId} onLogoUpload={(url) => setState(prev => ({ ...prev, logoUrl: url }))} />;
      default:
        return <LandingPage onLogin={handleLogin} logoUrl={state.logoUrl} isEmbedded={isEmbedded} />;
    }
  };

  const activeChatTrip = trips.find(t => t.id === activeChatId);

  return (
    <div className={`font-roboto text-slate-800 bg-[#FFFAF5]/20 min-h-screen ${isEmbedded ? 'p-0' : ''}`}>
      <NotificationToast 
        show={notification.show}
        message={notification.message}
        senderName={notification.sender}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
        onClick={() => {
          setActiveChatId(notification.tripId);
          setNotification(prev => ({ ...prev, show: false }));
        }}
      />
      {state.currentView === 'landing' ? renderView() : (
        <Layout 
          logoUrl={state.logoUrl} 
          userRole={state.userRole} 
          onLogout={handleLogout} 
          onViewChange={(view) => setState(prev => ({ ...prev, currentView: view }))}
          hideHeaderFooter={isEmbedded && state.currentView === 'passenger-dashboard'}
          isOnline={isOnline}
        >
          {renderView()}
          {activeChatTrip && (
            <ChatWindow trip={activeChatTrip} userRole={state.userRole} onClose={() => setActiveChatId(null)} onSendMessage={(text) => sendMessage(activeChatTrip.id, text)} />
          )}
        </Layout>
      )}
    </div>
  );
};

export default App;
