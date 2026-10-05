export const setSettings = (payload) => ({
    type: 'SET_SETTINGS',
    payload,
});

export const addItem = (entity, item) => ({
    type: 'ADD',
    entity,
    item,
});

export const updateItem = (entity, id, patch) => ({
    type: 'UPDATE',
    entity,
    id,
    patch,
});

export const deleteItem = (entity, id) => ({
    type: 'DELETE',
    entity,
    id,
});

export const setCollection = (entity, payload) => ({
    type: 'SET_COLLECTION',
    entity,
    payload,
});

export const resetDemo = () => ({
    type: 'RESET_DEMO',
});