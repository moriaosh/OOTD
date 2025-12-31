import api from './api';

/**
 * מביא המלצות לוקים לפי תאריך / אירוע
 */
export async function getCalendarRecommendations(date = new Date()) {
  const response = await api.post('/calendar/recommendations', {
    date: date.toISOString()
  });

  return response.data;
}
