import { createInitialState } from './initialState';
import { makeSeed } from '../data/seed';

export function reducer(state, action) {
    switch (action.type) {
        case 'HYDRATE':
            return action.payload;

        case 'RESET_DEMO':
            return {
                ...createInitialState(),
                ...makeSeed(),
            };

        case 'SET_SETTINGS':
            return {
                ...state,
                settings: {
                    ...state.settings,
                    ...action.payload,
                },
            };

        case 'ADD':
            return {
                ...state,
                [action.entity]: [action.item, ...(state[action.entity] || [])],
            };

        case 'UPDATE':
            return {
                ...state,
                [action.entity]: (state[action.entity] || []).map((item) =>
                    item.id === action.id ? { ...item, ...action.patch } : item
                ),
            };

        case 'DELETE':
            return {
                ...state,
                [action.entity]: (state[action.entity] || []).filter(
                    (item) => item.id !== action.id
                ),
            };

        case 'SET_COLLECTION':
            return {
                ...state,
                [action.entity]: action.payload,
            };

        default:
            return state;
    }
}