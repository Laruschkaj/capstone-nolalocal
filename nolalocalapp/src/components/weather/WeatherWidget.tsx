'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface WeatherData {
  temp: number;
  condition: string;
  city: string;
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || '45224b3933c63742e3e202b064477692';
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=New Orleans&units=imperial&appid=${apiKey}`
        );
        const data = await response.json();
        
        setWeather({
          temp: Math.round(data.main.temp),
          condition: data.weather[0].main,
          city: data.name,
        });
      } catch (error) {
        console.error('Error fetching weather:', error);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 600000);
    return () => clearInterval(interval);
  }, []);

  if (!weather) return null;

  const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const tempF = `${weather.temp}°F`;
  const tempC = `${Math.round((weather.temp - 32) * 5/9)}°C`;

  const weatherText = `— ${dayOfWeek}   ${weather.condition.toUpperCase()} ${tempF} / ${tempC} — `;

  return (
    <div className="overflow-hidden" style={{ width: '400px', fontFamily: 'Bebas Neue, sans-serif' }}>
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{
          duration: 20,
          ease: 'linear',
          repeat: Infinity,
        }}
        className="flex whitespace-nowrap text-base text-gray-700"
      >
        <span>{weatherText}</span>
        <span>{weatherText}</span>
      </motion.div>
    </div>
  );
}