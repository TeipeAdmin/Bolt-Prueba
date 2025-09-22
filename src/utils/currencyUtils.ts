export const getCurrencySymbol = (currency: string): string => {
  const symbols: { [key: string]: string } = {
    USD: '$',
    EUR: '€',
    MXN: '$',
    COP: '$',
    ARS: '$',
    CLP: '$',
    PEN: 'S/',
    BRL: 'R$',
    CAD: 'C$',
    GBP: '£',
  };
  
  return symbols[currency] || '$';
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${amount.toFixed(2)}`;
};

export const getCurrencyName = (currency: string): string => {
  const names: { [key: string]: string } = {
    USD: 'Dólar Estadounidense',
    EUR: 'Euro',
    MXN: 'Peso Mexicano',
    COP: 'Peso Colombiano',
    ARS: 'Peso Argentino',
    CLP: 'Peso Chileno',
    PEN: 'Sol Peruano',
    BRL: 'Real Brasileño',
    CAD: 'Dólar Canadiense',
    GBP: 'Libra Esterlina',
  };
  
  return names[currency] || 'Dólar Estadounidense';
};