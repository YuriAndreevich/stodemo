import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { NAV_ITEMS } from '../data/navigation';
import { uid } from '../utils/id';

const UiContext = createContext(null);

const normalizePage = (hash) => {
    const raw = String(hash || '').replace(/^#\/?/, '');

    // 1. Защита от undefined/null или не-массива
    if (!Array.isArray(NAV_ITEMS)) {
        return 'dashboard';
    }

    // 2. Безопасный поиск валидного ключа
    const isValid = NAV_ITEMS.some((item) => item.key === raw);

    return isValid ? raw : 'dashboard';
};
export function UiProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('ui-theme') || 'dark';
    });

    const [activePage, setActivePageState] = useState(() => {
        return normalizePage(window.location.hash);
    });

    const [toasts, setToasts] = useState([]);

    const [confirmState, setConfirmState] = useState({
        open: false,
        options: {},
    });

    const confirmResolverRef = useRef(null);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('ui-theme', theme);
    }, [theme]);

    useEffect(() => {
        const onHashChange = () => {
            setActivePageState(normalizePage(window.location.hash));
        };

        window.addEventListener('hashchange', onHashChange);

        return () => {
            window.removeEventListener('hashchange', onHashChange);
        };
    }, []);

    useEffect(() => {
        if (!window.location.hash) {
            window.location.hash = activePage;
        }
    }, [activePage]);

    const setActivePage = useCallback((page) => {
        const next = normalizePage(`#${page}`);
        setActivePageState(next);

        if (window.location.hash !== `#${next}`) {
            window.location.hash = next;
        }
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    }, []);

    const dismissToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const addToast = useCallback(
        (toast) => {
            const id = uid();

            setToasts((prev) => [
                ...prev,
                {
                    id,
                    tone: 'info',
                    title: 'Уведомление',
                    ...toast,
                },
            ]);

            window.setTimeout(() => {
                dismissToast(id);
            }, toast.duration || 3500);
        },
        [dismissToast]
    );

    const askConfirm = useCallback((options = {}) => {
        return new Promise((resolve) => {
            confirmResolverRef.current = resolve;
            setConfirmState({ open: true, options });
        });
    }, []);

    const handleConfirmResult = useCallback((result) => {
        const resolve = confirmResolverRef.current;
        confirmResolverRef.current = null;

        setConfirmState({ open: false, options: {} });

        if (resolve) {
            resolve(result);
        }
    }, []);

    const value = useMemo(
        () => ({
            theme,
            toggleTheme,
            activePage,
            setActivePage,
            toasts,
            addToast,
            dismissToast,
            confirmState,
            askConfirm,
            handleConfirmResult,
        }),
        [
            theme,
            toggleTheme,
            activePage,
            setActivePage,
            toasts,
            addToast,
            dismissToast,
            confirmState,
            askConfirm,
            handleConfirmResult,
        ]
    );

    return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi() {
    const context = useContext(UiContext);

    if (!context) {
        throw new Error('useUi must be used inside UiProvider');
    }

    return context;
}