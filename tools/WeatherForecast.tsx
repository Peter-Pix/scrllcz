import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { Button } from '../components/Shared';

interface WeatherCodes {
  [key: number]: { icon: string; desc: string };
}

const weatherCodes: WeatherCodes = {
  0: { icon: '☀️', desc: 'Jasno' },
  1: { icon: '🌤️', desc: 'Převážně jasno' },
  2: { icon: '⛅', desc: 'Částečně oblačno' },
  3: { icon: '☁️', desc: 'Zataženo' },
  45: { icon: '🌫️', desc: 'Mlha' },
  48: { icon: '🌫️', desc: 'Námraza' },
  51: { icon: '🌦️', desc: 'Mrholení' },
  53: { icon: '🌦️', desc: 'Mrholení' },
  55: { icon: '🌦️', desc: 'Silné mrholení' },
  61: { icon: '🌧️', desc: 'Mírný déšť' },
  63: { icon: '🌧️', desc: 'Déšť' },
  65: { icon: '🌧️', desc: 'Silný déšť' },
  71: { icon: '🌨️', desc: 'Sněžení' },
  73: { icon: '🌨️', desc: 'Sněžení' },
  75: { icon: '🌨️', desc: 'Silné sněžení' },
  77: { icon: '❄️', desc: 'Sněhové vločky' },
  80: { icon: '🌦️', desc: 'Přeháňky' },
  81: { icon: '🌦️', desc: 'Přeháňky' },
  82: { icon: '⛈️', desc: 'Silné přeháňky' },
  85: { icon: '🌨️', desc: 'Sněhové přeháňky' },
  86: { icon: '🌨️', desc: 'Silné sněhové přeháňky' },
  95: { icon: '⛈️', desc: 'Bouřka' },
  96: { icon: '⛈️', desc: 'Bouřka s kroupami' },
  99: { icon: '⛈️', desc: 'Silná bouřka s kroupami' }
};

const getWindDirection = (degrees: number) => {
  const directions = ['S', 'SV', 'V', 'JV', 'J', 'JZ', 'Z', 'SZ'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
};

export const WeatherForecastTool = () => {
  const [query, setQuery] = useState('');
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'hourly' | 'daily'>('hourly');
  const [locationInfo, setLocationInfo] = useState({ name: '', country: '' });

  const fetchWeatherData = async (lat: number, lon: number, name: string, country: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`);
      const data = await response.json();
      setWeatherData(data);
      setLocationInfo({ name, country });
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Chyba při načítání dat o počasí.');
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    try {
      setLoading(true);
      setError(null);
      const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=cs&format=json`);
      const geoData = await geoResponse.json();

      if (!geoData.results || geoData.results.length === 0) {
        setError('Město nenalezeno.');
        setLoading(false);
        return;
      }

      const location = geoData.results[0];
      await fetchWeatherData(location.latitude, location.longitude, location.name, location.country);
    } catch (err) {
      console.error(err);
      setError('Chyba při hledání města.');
      setLoading(false);
    }
  };

  const handleLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolokace není podporována vaším prohlížečem.');
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
            // Reverse geocoding mainly to get the name, but open-meteo doesn't have a direct easy reverse geo for name in the free tier clearly documented in the prototype.
            // We will just use "Vaše poloha" or try to search nearby.
            // Actually, we can assume "Vaše poloha" for simplicity or use the coords.
            // Let's use a generic name if we can't reverse geo easily without another API.
            // The prototype used geocoding-api for search, let's just fetch weather directly.
            // Wait, we can try to find the nearest city using the search API but it expects a name. 
            // We will just label it "Vaše poloha".
            await fetchWeatherData(position.coords.latitude, position.coords.longitude, 'Vaše poloha', '');
        } catch (err) {
            setError('Chyba při načítání počasí z polohy.');
            setLoading(false);
        }
      },
      () => {
        setError('Nelze získat vaši polohu.');
        setLoading(false);
      }
    );
  };

  // Initial load example (Prague)
  useEffect(() => {
    if (!weatherData) {
      fetchWeatherData(50.088, 14.4208, 'Praha', 'CZ');
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row gap-3">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Zadejte město (např. Brno, Ostrava)..."
          className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-sky-500 focus:outline-none"
        />
        <Button onClick={handleSearch} variant="primary">
          🔍 Hledat
        </Button>
        <Button onClick={handleLocation} variant="secondary">
          📍 Moje poloha
        </Button>
      </div>

      {loading && <div className="text-center py-12 text-slate-400">Načítám data o počasí...</div>}
      {error && <div className="text-center py-8 text-red-400 bg-red-900/10 rounded-xl border border-red-500/20">{error}</div>}

      {weatherData && !loading && (
        <div className="animate-fade-in space-y-6">
          {/* Current Weather Card */}
          <div className="bg-gradient-to-br from-sky-600 to-indigo-700 rounded-2xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3"></div>
             
             <div className="relative z-10">
               <div className="text-center mb-8">
                 <h2 className="text-3xl sm:text-4xl font-bold mb-2">{locationInfo.name} {locationInfo.country && <span className="text-sky-200 text-lg">({locationInfo.country})</span>}</h2>
                 <p className="text-sky-100">{new Date(weatherData.current.time).toLocaleDateString('cs-CZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
               </div>

               <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 mb-8">
                  <div className="text-8xl sm:text-9xl filter drop-shadow-lg">
                    {weatherCodes[weatherData.current.weather_code]?.icon || '❓'}
                  </div>
                  <div className="text-center md:text-left">
                     <div className="text-6xl sm:text-8xl font-bold tracking-tighter">
                       {Math.round(weatherData.current.temperature_2m)}°
                     </div>
                     <div className="text-xl sm:text-2xl font-medium text-sky-100 mt-2">
                       {weatherCodes[weatherData.current.weather_code]?.desc || 'Neznámé'}
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
                    <div className="text-sky-200 text-xs uppercase font-bold mb-1">Pocitová</div>
                    <div className="text-xl font-bold">{Math.round(weatherData.current.apparent_temperature)}°C</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
                    <div className="text-sky-200 text-xs uppercase font-bold mb-1">Vítr</div>
                    <div className="text-xl font-bold">{Math.round(weatherData.current.wind_speed_10m)} km/h</div>
                    <div className="text-xs text-sky-200">{getWindDirection(weatherData.current.wind_direction_10m)}</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
                    <div className="text-sky-200 text-xs uppercase font-bold mb-1">Vlhkost</div>
                    <div className="text-xl font-bold">{weatherData.current.relative_humidity_2m}%</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
                    <div className="text-sky-200 text-xs uppercase font-bold mb-1">Srážky</div>
                    <div className="text-xl font-bold">{weatherData.current.precipitation} mm</div>
                  </div>
               </div>
             </div>
          </div>

          {/* Forecast Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex gap-4 mb-6 border-b border-slate-800 pb-1">
               <button 
                 onClick={() => setActiveTab('hourly')}
                 className={`pb-3 px-2 font-bold text-sm transition-colors relative ${activeTab === 'hourly' ? 'text-sky-400' : 'text-slate-500 hover:text-slate-300'}`}
               >
                 Hodinová předpověď
                 {activeTab === 'hourly' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-sky-400 rounded-full"></span>}
               </button>
               <button 
                 onClick={() => setActiveTab('daily')}
                 className={`pb-3 px-2 font-bold text-sm transition-colors relative ${activeTab === 'daily' ? 'text-sky-400' : 'text-slate-500 hover:text-slate-300'}`}
               >
                 7denní předpověď
                 {activeTab === 'daily' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-sky-400 rounded-full"></span>}
               </button>
            </div>

            {activeTab === 'hourly' && (
               <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
                 {weatherData.hourly.time.slice(0, 24).map((time: string, i: number) => {
                   const date = new Date(time);
                   const code = weatherData.hourly.weather_code[i];
                   return (
                     <div key={i} className="flex-shrink-0 w-24 bg-slate-950 border border-slate-800 rounded-xl p-4 text-center flex flex-col items-center justify-between gap-2">
                       <span className="text-slate-400 text-sm font-bold">{date.getHours()}:00</span>
                       <span className="text-3xl">{weatherCodes[code]?.icon || '❓'}</span>
                       <span className="font-bold text-white text-lg">{Math.round(weatherData.hourly.temperature_2m[i])}°</span>
                       <span className="text-xs text-sky-400 font-medium">{weatherData.hourly.precipitation_probability[i]}% 💧</span>
                     </div>
                   );
                 })}
               </div>
            )}

            {activeTab === 'daily' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                 {weatherData.daily.time.map((time: string, i: number) => {
                   const date = new Date(time);
                   const code = weatherData.daily.weather_code[i];
                   return (
                     <div key={i} className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center hover:border-sky-500/30 transition-colors">
                        <div className="text-slate-400 font-bold mb-2 capitalize">
                          {date.toLocaleDateString('cs-CZ', { weekday: 'short', day: 'numeric', month: 'numeric' })}
                        </div>
                        <div className="text-4xl mb-3">{weatherCodes[code]?.icon || '❓'}</div>
                        <div className="flex justify-center gap-2 font-bold text-lg mb-1">
                           <span className="text-white">{Math.round(weatherData.daily.temperature_2m_max[i])}°</span>
                           <span className="text-slate-600">/</span>
                           <span className="text-slate-500">{Math.round(weatherData.daily.temperature_2m_min[i])}°</span>
                        </div>
                        <div className="text-xs text-slate-500 mb-2">{weatherCodes[code]?.desc}</div>
                        <div className="text-xs text-sky-400 font-medium bg-sky-900/10 py-1 rounded-full">{weatherData.daily.precipitation_probability_max[i]}% deště</div>
                     </div>
                   );
                 })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};