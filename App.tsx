
import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout.tsx';
import LandingPage from './components/LandingPage.tsx';
import PassengerDashboard from './components/PassengerDashboard.tsx';
import AgencyDashboard from './components/AgencyDashboard.tsx';
import ChatWindow from './components/ChatWindow.tsx';
import NotificationToast from './components/NotificationToast.tsx';
import { Trip, AppState, ChatMessage } from './types.ts';
import { isSecureConnection, encryptData } from './services/securityService.ts';

// Simplificando declarações para o parser
const DEFAULT_LOGO = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MDAgMzUwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQxIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojRUU4RjY2O3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I0EzOTE2MTtzdG9wLW9wYWNpdHk6MSIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48ZyBmaWxsPSJub25lIiBzdHJva2U9InVybCgjZ3JhZDEpIiBzdHJva2Utd3lkdGg9IjIuNSI+PGNpcmNsZSBjeD0iMjUwIiBjeT0iMTAwIiByPSI4MCIvPjwvZz48dGV4dCB4PSIyNTAiIHk9IjI3MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFicmlsIEZhdGZhY2UiIGZvbnQtc2l6ZT0iNjAiIGZpbGw9IiNFRThGNjYiPlRST1RBAU1VTkRPPC90ZXh0Pjwvc3ZnPg==';

const INITIAL_TRIPS = [
  {
    id: '1',
    accessCode: 'PARIS24',
    passengerName: 'Maria Silva',
    destination: 'Paris, França',
    startDate: '2024-05-10',
    endDate: '2024-05-20',
    status: 'upcoming',
    documents: [
      { id: 'd1', name: 'E-Ticket Air France', type: 'e-ticket', url: '#', uploadDate: '2024-03-01' }
    ],
    updates: [
      { id: 'u1', date: '2024-03-01', description: 'Passagens confirmadas!' }
    ],
    messages: [],
    agenda: [],
    recommendations: []
  }
];

const App: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const [state, setState] = useState<AppState>(() => {
    const savedLogo = localStorage.getItem('trotamundo_custom_logo');
    return {
      currentView: 'landing',
      userRole: 'passenger',
      selectedTripId: null,
      loggedPassengerTripId: null,
      logoUrl: savedLogo || DEFAULT_LOGO
    };
  });

  const [trips, setTrips] = useState<Trip[]>(() => {
    try {
      const saved = localStorage.getItem('trotamundo_trips');
      return saved ? JSON.parse(saved) : (INITIAL_TRIPS as Trip[]);
    } catch (e) {
      return INITIAL_TRIPS as Trip[];
    }
  });

  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [notification, setNotification] = useState({ show: false, message: '', senderName: '', tripId: '' });

  useEffect(() => {
    localStorage.setItem('trotamundo_trips', JSON.stringify(trips));
  }, [trips]);

  const handleLogin = (role: 'passenger' | 'agency', code?: string) => {
    if (role === 'passenger' && code) {
      const trip = trips.find(t => t.accessCode.toUpperCase() === code.toUpperCase());
      if (trip) {
        setState(prev => ({ ...prev, userRole: 'passenger', loggedPassengerTripId: trip.id, currentView: 'passenger-dashboard' }));
        return true;
      }
      return false;
    }
    if (role === 'agency') {
      setState(prev => ({ ...prev, userRole: 'agency', currentView: 'agency-dashboard' }));
      return true;
    }
    return false;
  };

  const renderView = () => {
    switch (state.currentView) {
      case 'landing':
        return <LandingPage onLogin={handleLogin} logoUrl={state.logoUrl} />;
      case 'passenger-dashboard':
        return <PassengerDashboard trips={trips.filter(t => t.id === state.loggedPassengerTripId)} onOpenChat={setActiveChatId} onLogout={() => setState(p => ({...p, currentView: 'landing'}))} />;
      case 'agency-dashboard':
        return <AgencyDashboard trips={trips} onAddTrip={t => setTrips(prev => [...prev, t])} onUpdateTrip={t => setTrips(prev => prev.map(o => o.id === t.id ? t : o))} onOpenChat={setActiveChatId} onLogoUpload={url => setState(p => ({...p, logoUrl: url}))} />;
      default:
        return <LandingPage onLogin={handleLogin} logoUrl={state.logoUrl} />;
    }
  };

  const activeChatTrip = trips.find(t => t.id === activeChatId);

  return (
    <div className="min-h-screen bg-[#FFFAF5]">
      <NotificationToast {...notification} onClose={() => setNotification(p => ({...p, show: false}))} onClick={() => setActiveChatId(notification.tripId)} />
      {state.currentView === 'landing' ? renderView() : (
        <Layout 
          logoUrl={state.logoUrl} 
          userRole={state.userRole} 
          onLogout={() => setState(p => ({...p, currentView: 'landing'}))} 
          onViewChange={v => setState(p => ({...p, currentView: v}))}
          isOnline={isOnline}
        >
          {renderView()}
          {activeChatTrip && (
            <ChatWindow 
              trip={activeChatTrip} 
              userRole={state.userRole} 
              onClose={() => setActiveChatId(null)} 
              onSendMessage={txt => {
                const msg: ChatMessage = { id: Math.random().toString(), sender: state.userRole, text: txt, timestamp: new Date().toISOString() };
                setTrips(prev => prev.map(t => t.id === activeChatId ? {...t, messages: [...t.messages, msg]} : t));
              }} 
            />
          )}
        </Layout>
      )}
    </div>
  );
};

export default App;
