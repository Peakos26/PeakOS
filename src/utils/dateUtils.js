// Retorna o número da semana no formato YYYY-WXX
export const getWeekNumber = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNumber = 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  return `${d.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
};

// Retorna o nome do dia da semana em português
export const getDayName = (date = new Date()) => {
  const days = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
  return days[date.getDay()];
};

// Retorna o dia da semana em 'english key' para o Firebase (monday, tuesday...)
export const getDayKey = (date = new Date()) => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
};

// Verifica se dois dias são da mesma semana ISO
export const isSameWeek = (date1, date2) => {
  return getWeekNumber(date1) === getWeekNumber(date2);
};
