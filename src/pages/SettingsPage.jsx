import { useEffect, useState } from 'react';
import { useData, useDataDispatch } from '../context/DataContext';
import { useUi } from '../context/UiContext';
import {
    Button,
    Card,
    Input,
    PageHeader,
    Select,
    Switch,
} from '../components/ui';

export function SettingsPage() {
    const data = useData();
    const dispatch = useDataDispatch();
    const { addToast, askConfirm, theme, toggleTheme } = useUi();

    const [local, setLocal] = useState(data.settings);

    useEffect(() => {
        setLocal(data.settings);
    }, [data.settings]);

    const saveSettings = () => {
        dispatch({
            type: 'SET_SETTINGS',
            payload: local,
        });

        addToast({
            tone: 'success',
            title: 'Настройки сохранены',
            description: 'Демо можно быстро перекрасить под любого клиента',
        });
    };

    // Внутри компонента SettingsPage

    const resetDemo = () => {
        // 1. Удаляем конкретный ключ из localStorage
        const STORAGE_KEY = 'business-os-demo-v1'; // Убедись, что этот ключ совпадает с persistence.js!
        localStorage.removeItem(STORAGE_KEY);

        // 2. (Опционально) Очищаем вообще весь localStorage проекта, если есть другие ключи
        // Object.keys(localStorage).forEach(key => {
        //   if (key.startsWith('business-os')) localStorage.removeItem(key);
        // });

        // 3. Показываем уведомление (если хук доступен)
        addToast({ tone: 'success', title: 'Демо сброшено', description: 'Страница перезагрузится...' });

        // 4. Принудительная перезагрузка страницы через 500мс
        setTimeout(() => {
            window.location.reload();
        }, 500);
    };

    const exportJson = () => {
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json',
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');

        a.href = url;
        a.download = `${local.companyName || 'business-os'}-backup.json`;
        a.click();

        URL.revokeObjectURL(url);

        addToast({
            tone: 'success',
            title: 'Бэкап скачан',
            description: 'JSON-копия всех демо-данных',
        });
    };

    return (
        <div className="stack">
            <PageHeader
                title="Настройки"
                subtitle="White-label, валюта, ниша, тема и управление демо-данными"
            />

            <div className="grid grid-2">
                <Card title="Бренд" subtitle="То, что увидит клиент при покупке">
                    <div className="form-grid">
                        <Input
                            label="Название компании"
                            value={local.companyName}
                            onChange={(event) =>
                                setLocal((prev) => ({
                                    ...prev,
                                    companyName: event.target.value,
                                }))
                            }
                        />

                        <Select
                            label="Валюта"
                            value={local.currency}
                            onChange={(event) =>
                                setLocal((prev) => ({
                                    ...prev,
                                    currency: event.target.value,
                                }))
                            }
                            options={[
                                { value: 'BYN', label: 'BYN' },
                                { value: 'RUB', label: 'RUB' },
                                { value: 'USD', label: 'USD' },
                                { value: 'EUR', label: 'EUR' },
                            ]}
                        />

                        <Select
                            label="Ниша"
                            value={local.niche}
                            onChange={(event) =>
                                setLocal((prev) => ({
                                    ...prev,
                                    niche: event.target.value,
                                }))
                            }
                            options={[
                                { value: 'auto', label: 'Автосервис' },
                                { value: 'beauty', label: 'Бьюти / маникюр' },
                                { value: 'barber', label: 'Барбершоп' },
                                { value: 'coffee', label: 'Кофейня' },
                            ]}
                        />
                    </div>

                    <div style={{ marginTop: 14 }}>
                        <Button onClick={saveSettings}>Сохранить настройки</Button>
                    </div>
                </Card>

                <Card title="Интерфейс" subtitle="Тема и быстрые демо-действия">
                    <div className="stack">
                        <Switch
                            label={theme === 'dark' ? 'Тёмная тема включена' : 'Светлая тема включена'}
                            checked={theme === 'dark'}
                            onChange={toggleTheme}
                        />

                        <div className="row-actions" style={{ justifyContent: 'flex-start' }}>
                            <Button variant="secondary" onClick={exportJson}>
                                Скачать JSON
                            </Button>

                            <Button variant="danger" onClick={resetDemo}>
                                Сбросить демо
                            </Button>
                        </div>

                        <p className="text-muted" style={{ margin: 0, fontSize: 13 }}>
                            Экспорт JSON полезен, чтобы показать клиенту: данные можно выгрузить
                            и не потерять. В реальной версии потом легко добавить импорт и
                            подключение к БД.
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
}