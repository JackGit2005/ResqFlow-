import React, { useState, useEffect } from 'react';
import {
  CloudRain,
  Wind,
  Droplets,
  Thermometer,
  ShieldAlert,
  RefreshCw,
  Sun,
  AlertTriangle,
  Clock,
  Compass
} from 'lucide-react';
import { BallariWeather } from '../../types';
import { fetchLiveBallariWeather, DEFAULT_BALLARI_WEATHER } from '../../services/weatherService';

interface BallariLiveWeatherCardProps {
  onRefreshTrigger?: () => void;
}

export const BallariLiveWeatherCard: React.FC<BallariLiveWeatherCardProps> = () => {
  const [weather, setWeather] = useState<BallariWeather>(DEFAULT_BALLARI_WEATHER);
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const loadWeather = async () => {
    setLoading(true);
    try {
      const data = await fetchLiveBallariWeather();
      setWeather(data);
      setLastRefreshed(new Date());
    } catch {
      // keep default
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeather();
    // Auto refresh every 5 minutes
    const interval = setInterval(loadWeather, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getRiskBadge = (level: BallariWeather['disasterRiskLevel']) => {
    switch (level) {
      case 'High Risk':
      case 'Extreme Alert':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Elevated':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <CloudRain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 text-sm">Ballari Meteorological & Disaster Risk Feed</h3>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${getRiskBadge(weather.disasterRiskLevel)}`}>
                {weather.disasterRiskLevel}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Live monitoring · 15.1394°N, 76.9214°E (Ballari Urban & Tungabhadra Basin)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="text-[11px]">Updated {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <button
            onClick={loadWeather}
            disabled={loading}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors disabled:opacity-50"
            title="Refresh current meteorological conditions"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Meteorological Stats & Risk Index */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4">
        {/* Temperature */}
        <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-100">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Temperature</span>
            <Thermometer className="w-3.5 h-3.5 text-orange-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">
            {weather.temperature}°C
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Feels like {weather.heatIndex}°C
          </div>
        </div>

        {/* Precipitation */}
        <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-100">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Rainfall (24h)</span>
            <CloudRain className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-xl font-bold text-blue-700 font-mono">
            {weather.rainfallMm} mm
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Rain prob: {weather.precipitationProb}%
          </div>
        </div>

        {/* Humidity */}
        <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-100">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Humidity</span>
            <Droplets className="w-3.5 h-3.5 text-cyan-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">
            {weather.humidity}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            High vapor saturation
          </div>
        </div>

        {/* Wind Speed */}
        <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-100">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Wind & Gusts</span>
            <Wind className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">
            {weather.windSpeed} km/h
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Dir: {weather.windDirection}
          </div>
        </div>
      </div>

      {/* Disaster Vulnerability Assessment Bar */}
      <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200/80 space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-900">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Disaster Vulnerability Assessment for Ballari District</span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-600">
              Flood Risk: <strong className={weather.floodRisk === 'Severe' ? 'text-red-600' : 'text-slate-800'}>{weather.floodRisk}</strong>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600">
              Storm Risk: <strong className={weather.stormRisk === 'Severe' ? 'text-red-600' : 'text-slate-800'}>{weather.stormRisk}</strong>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600">
              Heatwave Risk: <strong>{weather.heatRisk}</strong>
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          {weather.riskSummary}
        </p>
      </div>

      {/* Hourly Trend Mini Grid */}
      <div className="mt-3 pt-3 border-t border-slate-100">
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
          <Clock className="w-3 h-3" /> 6-Hour Forecast Trend (Ballari)
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {weather.forecast.map((h, i) => (
            <div key={i} className="text-center p-2 rounded-lg bg-slate-50/70 border border-slate-100 text-xs">
              <div className="font-mono text-slate-500 text-[11px]">{h.time}</div>
              <div className="font-bold text-slate-800 my-0.5">{h.temp}°C</div>
              <div className="text-[10px] text-blue-600 font-medium">{h.rainProb}% rain</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
