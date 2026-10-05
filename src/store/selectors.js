
import { daysUntil } from '../utils/dates';

export const selectSettings = (state) => state.settings || {};

export const selectClients = (state) => state.clients || [];

export const selectServices = (state) => state.services || [];

export const selectOrders = (state) => state.orders || [];

export const selectPayments = (state) => state.payments || [];

export const selectParts = (state) => state.parts || [];

export const selectRevenue = (state) =>
    selectPayments(state).reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);

export const selectDueSoonClients = (state, days = 14) =>
    selectClients(state).filter((client) => {
        const diff = daysUntil(client.nextService);
        return diff >= 0 && diff <= days;
    });

export const selectOverdueClients = (state) =>
    selectClients(state).filter((client) => daysUntil(client.nextService) < 0);

export const selectLowStockParts = (state) =>
    selectParts(state).filter((part) => Number(part.stock) <= Number(part.minStock));