import { useState } from 'react';
import { NAV_ITEMS } from '../../data/navigation';
import { useUi } from '../../context/UiContext';

// ИСПРАВЛЕНИЕ: Импортим UI-компоненты НАПРЯМУЮ из их файлов.
// Это обходит проблему со сломанным index.js или неправильными экспортами там.
import { Button } from '../ui/Button';
import { IconButton } from '../ui/Button'; // IconButton тоже лежит в Button.jsx обычно
import { SearchInput } from '../ui/SearchInput';

export function Topbar() {
    const { activePage, addToast } = useUi();
    const [query, setQuery] = useState('');

    // Находим текущую страницу для заголовка
    const page = NAV_ITEMS.find((item) => item.key === activePage) || NAV_ITEMS[0];

    return (
        <header className="topbar">
            <div>
                <h1>{page.label}</h1>
                <p>{page.description}</p>
            </div>

            <div className="topbar-actions">
                <SearchInput
                    value={query}
                    onChange={setQuery}
                    placeholder="Глобальный поиск"
                />

                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                        addToast({
                            title: 'Поиск',
                            description: query
                                ? `Запрос: ${query}`
                                : 'Введите имя, телефон, номер авто или услугу',
                        })
                    }
                >
                    Найти
                </Button>

                <IconButton
                    onClick={() =>
                        addToast({
                            title: 'Уведомления',
                            description: 'Здесь будет центр уведомлений и очередей отправки',
                        })
                    }
                    aria-label="Уведомления"
                >
                    🔔
                </IconButton>
            </div>
        </header>
    );
}

export default Topbar;