/** Generic API response wrapper */
export interface ApiResponse<T> {
  data: T;
  error: null;
}

export interface ApiError {
  data: null;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

/** URL metadata from /api/url-meta */
export interface UrlMeta {
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
  favicon: string | null;
  siteName: string | null;
}

/** Weather snapshot from /api/weather (Open-Meteo) */
export interface WeatherSnapshot {
  temperature: number; // Celsius
  weatherCode: number; // WMO weather code
  description: string;
  isDay: boolean;
  humidity: number;
  windSpeed: number;
  fetchedAt: string; // ISO string
}
