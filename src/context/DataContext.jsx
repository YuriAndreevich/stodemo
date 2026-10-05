import { createContext, useContext, useEffect, useReducer } from 'react';
import { reducer } from '../store/reducer';
import { initialState } from '../store/initialState';
import { loadState, saveState } from '../store/persistence';

const DataStateContext = createContext(null);
const DataDispatchContext = createContext(null);

// ВАЖНО: Используем export function, чтобы можно было импортировать как { DataProvider }
export function DataProvider({ children }) {
    const [state, dispatch] = useReducer(
        reducer,
        undefined,
        () => loadState() || initialState()
    );

    // Сохраняем состояние при каждом изменении
    useEffect(() => {
        saveState(state);
    }, [state]);

    return (
        <DataStateContext.Provider value={state}>
            <DataDispatchContext.Provider value={dispatch}>
                {children}
            </DataDispatchContext.Provider>
        </DataStateContext.Provider>
    );
}

// Хук для доступа к данным
export function useData() {
    const context = useContext(DataStateContext);
    if (!context) {
        throw new Error('useData must be used inside DataProvider');
    }
    return context;
}

// Хук для доступа к диспетчеру действий
export function useDataDispatch() {
    const context = useContext(DataDispatchContext);
    if (!context) {
        throw new Error('useDataDispatch must be used inside DataProvider');
    }
    return context;
}