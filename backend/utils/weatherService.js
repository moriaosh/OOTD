// Weather Service - OpenWeatherMap API Integration
// Fetches current weather data for outfit recommendations

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

/**
 * Fetch current weather data for a given location
 * @param {string} location - City name (e.g., "Tel Aviv" or "Tel Aviv,IL")
 * @returns {Object} Weather data with temperature, conditions, etc.
 */
const getWeatherByCity = async (location) => {
  if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === 'your_api_key_here') {
    throw new Error('OpenWeather API key not configured. Please add OPENWEATHER_API_KEY to .env file.');
  }

  try {
    const url = `${BASE_URL}?q=${encodeURIComponent(location)}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=he`;

    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('עיר לא נמצאה. אנא בדקי את שם העיר.');
      }
      throw new Error('שגיאה בקבלת נתוני מזג אויר.');
    }

    const data = await response.json();

    return {
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      condition: data.weather[0].main, // Clear, Clouds, Rain, etc.
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      city: data.name,
      country: data.sys.country,
      icon: data.weather[0].icon
    };
  } catch (error) {
    console.error('Weather API Error:', error);
    throw error;
  }
};

/**
 * Get weather recommendations based on current conditions
 * @param {Object} weather - Weather data from getWeatherByCity
 * @returns {Object} Recommendations for outfit selection
 */
const getWeatherRecommendations = (weather) => {
  const { temperature, condition } = weather;

  const recommendations = {
    preferredSeasons: [],
    avoidSeasons: [],
    requiresOuterwear: false,
    requiresRainGear: false,
    message: ''
  };

  // Temperature-based season recommendations
  if (temperature < 15) {
    recommendations.preferredSeasons = ['חורף'];
    recommendations.requiresOuterwear = true;
    recommendations.message = 'קר בחוץ - מומלץ להתלבש בשכבות';
  } else if (temperature >= 15 && temperature < 25) {
    recommendations.preferredSeasons = ['אביב', 'סתיו'];
    recommendations.message = 'מזג אוויר נעים - מושלם ללוק קליל';
  } else {
    recommendations.preferredSeasons = ['קיץ'];
    recommendations.avoidSeasons = ['חורף'];
    recommendations.message = 'חם בחוץ - מומלץ ללבוש בגדים קלילים';
  }

  // Weather condition recommendations
  if (condition === 'Rain' || condition === 'Drizzle' || condition === 'Thunderstorm') {
    recommendations.requiresRainGear = true;
    recommendations.message += ' | גשום - הכיני מעיל או מטריה';
  }

  return recommendations;
};

/**
 * Filter and prioritize clothing items based on weather
 * @param {Array} clothes - User's clothing items
 * @param {Object} weatherRecs - Weather recommendations
 * @returns {Object} Categorized and filtered clothes
 */
const filterClothesByWeather = (clothes, weatherRecs) => {
  // Filter out clothes that don't match the season (if season is specified)
  const seasonFiltered = clothes.filter(item => {
    // If item has no season specified, include it (neutral)
    if (!item.season) return true;

    // If weather recommends avoiding certain seasons, exclude them
    if (weatherRecs.avoidSeasons.includes(item.season)) return false;

    // Prefer items matching the recommended season
    return true;
  });

  // Prioritize items matching preferred seasons
  const prioritized = seasonFiltered.sort((a, b) => {
    const aMatch = a.season && weatherRecs.preferredSeasons.includes(a.season);
    const bMatch = b.season && weatherRecs.preferredSeasons.includes(b.season);

    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    return 0;
  });

  // Categorize the filtered/prioritized items
  return {
    top: prioritized.filter(c => ['חולצה', 'טופ', 'סריג'].includes(c.category)),
    bottom: prioritized.filter(c => ['מכנס', 'חצאית'].includes(c.category)),
    shoe: prioritized.filter(c => c.category === 'נעל'),
    dress: prioritized.filter(c => c.category === 'שמלה'),
    outerwear: prioritized.filter(c => ['ז\'קט', 'מעיל'].includes(c.category)),
    accessory: prioritized.filter(c => c.category === 'אביזר')
  };
};

module.exports = {
  getWeatherByCity,
  getWeatherRecommendations,
  filterClothesByWeather
};
