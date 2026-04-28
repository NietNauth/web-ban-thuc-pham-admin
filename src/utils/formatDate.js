export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const pad = (n) => (n < 10 ? '0' + n : n);
  
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};
