/**
 * Fallback city list used when location permission is denied. Coordinates are
 * city centres, accurate enough to seed a nearby-shop search.
 */
export interface PakistanCity {
  name: string;
  latitude: number;
  longitude: number;
}

export const PAKISTAN_CITIES: readonly PakistanCity[] = [
  { name: 'Karachi', latitude: 24.8607, longitude: 67.0011 },
  { name: 'Lahore', latitude: 31.5204, longitude: 74.3587 },
  { name: 'Islamabad', latitude: 33.6844, longitude: 73.0479 },
  { name: 'Rawalpindi', latitude: 33.5651, longitude: 73.0169 },
  { name: 'Faisalabad', latitude: 31.418, longitude: 73.0791 },
  { name: 'Multan', latitude: 30.1575, longitude: 71.5249 },
  { name: 'Peshawar', latitude: 34.0151, longitude: 71.5249 },
  { name: 'Quetta', latitude: 30.1798, longitude: 66.975 },
  { name: 'Hyderabad', latitude: 25.396, longitude: 68.3578 },
  { name: 'Gujranwala', latitude: 32.1877, longitude: 74.1945 },
  { name: 'Sialkot', latitude: 32.4927, longitude: 74.5319 },
  { name: 'Bahawalpur', latitude: 29.3956, longitude: 71.6836 },
  { name: 'Sargodha', latitude: 32.0836, longitude: 72.6711 },
  { name: 'Sukkur', latitude: 27.7052, longitude: 68.8574 },
  { name: 'Larkana', latitude: 27.56, longitude: 68.2264 },
  { name: 'Sheikhupura', latitude: 31.7167, longitude: 73.985 },
  { name: 'Mardan', latitude: 34.1989, longitude: 72.0231 },
  { name: 'Abbottabad', latitude: 34.1688, longitude: 73.2215 },
  { name: 'Gujrat', latitude: 32.5731, longitude: 74.0789 },
  { name: 'Sahiwal', latitude: 30.6682, longitude: 73.1114 },
  { name: 'Okara', latitude: 30.8138, longitude: 73.4534 },
  { name: 'Jhang', latitude: 31.2681, longitude: 72.3181 },
  { name: 'Rahim Yar Khan', latitude: 28.4202, longitude: 70.2952 },
  { name: 'Dera Ghazi Khan', latitude: 30.0489, longitude: 70.6455 },
  { name: 'Nawabshah', latitude: 26.2442, longitude: 68.41 },
  { name: 'Chiniot', latitude: 31.7167, longitude: 72.9833 },
  { name: 'Kasur', latitude: 31.1187, longitude: 74.45 },
  { name: 'Mirpur', latitude: 33.1478, longitude: 73.7519 },
  { name: 'Muzaffarabad', latitude: 34.37, longitude: 73.4711 },
  { name: 'Gilgit', latitude: 35.9208, longitude: 74.3144 },
];

export function findCity(name: string): PakistanCity | undefined {
  const needle = name.trim().toLowerCase();
  for (const city of PAKISTAN_CITIES) {
    if (city.name.toLowerCase() === needle) return city;
  }
  return undefined;
}
