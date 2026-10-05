import { NAV_ITEMS } from '../../data/navigation';
import { useUi } from '../../context/UiContext';
import { cn } from '../../utils/cn'; // Утилита для классов, если есть

export function MobileNav() {
    const { activePage, setActivePage } = useUi();

    // Берем первые 5 пунктов навигации для мобильного меню
    const items = NAV_ITEMS.slice(0, 5);

    return (
        <nav className="mobile-nav">
            {items.map((item) => (
                <button
                    key={item.key}
                    type="button"
                    className={cn(activePage === item.key && 'active')}
                    onClick={() => setActivePage(item.key)}
                >
                    <span>{item.icon}</span>
                    <small>{item.label}</small>
                </button>
            ))}
        </nav>
    );
}

// Явно добавляем default export на всякий случай
export default MobileNav;