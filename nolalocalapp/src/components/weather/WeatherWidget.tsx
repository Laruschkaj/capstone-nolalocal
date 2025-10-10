'use client';

import { useEffect, useState } from 'react';

interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeather();
    // Refresh every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchWeather = async () => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || '45224b3933c63742e3e202b064477692';
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=New Orleans,US&appid=${apiKey}&units=imperial`
      );
      
      if (response.ok) {
        const data = await response.json();
        setWeather({
          temp: Math.round(data.main.temp),
          condition: data.weather[0].main,
          icon: getWeatherIcon(data.weather[0].main),
        });
      }
    } catch (error) {
      console.error('Weather fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition: string): string => {
    const icons: { [key: string]: string } = {
      'Clear': '☀️',
      'Clouds': '☁️',
      'Rain': '🌧️',
      'Drizzle': '🌦️',
      'Thunderstorm': '⛈️',
      'Snow': '❄️',
      'Mist': '🌫️',
      'Fog': '🌫️',
    };
    return icons[condition] || '🌤️';
  };

  if (loading || !weather) {
    return <div className="text-sm text-gray-500">Loading...</div>;
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-xl">{weather.icon}</span>
      <div className="flex items-center gap-1">
        <span className="font-medium">{weather.condition}</span>
        <span className="text-gray-500">{weather.temp}°F</span>
      </div>
    </div>
  );
}