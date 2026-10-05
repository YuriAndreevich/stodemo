// src/app/App.jsx

import { AppProviders } from './AppProviders';
import { AppShell } from '../components/layout/AppShell';
import { useUi } from '../context/UiContext';

import { DashboardPage } from '../pages/DashboardPage';
import { ClientsPage } from '../pages/ClientsPage';
import { ServicesPage } from '../pages/ServicesPage';
import { OrdersBoard } from '../components/orders/OrdersBoard';
import { RemindersPage } from '../pages/RemindersPage';
import { SettingsPage } from '../pages/SettingsPage';
import { VideoOpsPage } from '../pages/VideoOpsPage';
import { PartsPage } from '../pages/PartsPage';
import { MarketingPage } from '../pages/MarketingPage';

function CurrentPage() {
  const { activePage } = useUi();

  switch (activePage) {
    case 'clients':
      return <ClientsPage />;
    case 'parts':
      return <PartsPage />;
    case 'services':
      return <ServicesPage />;
    case 'marketing':
      return <MarketingPage />
    case 'orders':
      return <OrdersBoard />;
    case 'reminders':
      return <RemindersPage />;
    case 'videoops':
      if (typeof VideoOpsPage !== 'function') {
        return <div style={{ color: 'red' }}>Ошибка: VideoOpsPage не загружен. Проверь импорт в App.jsx</div>;
      }
      return <VideoOpsPage />;
    // ------------
    case 'settings':
      return <SettingsPage />;

    case 'dashboard':
    default:
      return <DashboardPage />;

  }

}

export default function App() {
  return (
    <AppProviders>
      <AppShell>
        <CurrentPage />
      </AppShell>
    </AppProviders>
  );
}