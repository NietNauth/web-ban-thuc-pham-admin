export const formatCurrency = (value) => {
  if (!value) return '0đ';
  return Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + 'đ';
};
