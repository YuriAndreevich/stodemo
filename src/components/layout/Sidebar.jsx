// src/components/layout/Sidebar.jsx

import { NAV_ITEMS } from '../../data/navigation';
import { useUi } from '../../context/UiContext';
import { useData } from '../../context/DataContext';
import { cn } from '../../utils/cn';

// СТРОГО ИМЕНОВАННЫЙ ИМПОРТ ИЗ КОНКРЕТНОГО ФАЙЛА
import { Button } from '../ui/Button';

export function Sidebar() {
    const { activePage, setActivePage, theme, toggleTheme } = useUi();
    const data = useData();

    return (
        <aside className="sidebar">
            <div className="brand">
                <div className="brand-icon">🛠️</div>
                <div>
                    <strong>{data.settings.companyName || 'AutoService'}</strong>
                    <small>Business OS demo</small>
                </div>
            </div>

            <nav className="nav">
                {NAV_ITEMS.map((item) => (
                    <button
                        key={item.key}
                        type="button"
                        className={cn(activePage === item.key && 'active')}
                        onClick={() => setActivePage(item.key)}
                    >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="sidebar-footer">
                <Button variant="ghost" size="sm" onClick={toggleTheme}>
                    {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
                </Button>

                <p style={{ fontSize: 12, color: '#64748b', marginTop: 10 }}>
                    Demo Mode<br />No Backend
                </p>
            </div>
        </aside>
    );
}

export default Sidebar;