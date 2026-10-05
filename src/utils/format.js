export const formatMoney = (value, currency = 'BYN') => {
    const numberValue = Number(value) || 0;

    return `${new Intl.NumberFormat('ru-RU', {
        maximumFractionDigits: 0,
    }).format(numberValue)} ${currency}`;
};

export const formatNumber = (value) => {
    return new Intl.NumberFormat('ru-RU').format(Number(value) || 0);
};