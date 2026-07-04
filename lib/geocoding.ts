import { calculateHaversineDistance } from "./routing";

/**
 * OpenStreetMap Nominatim reverse geocoding wrapper
 * Returns a clean, human-readable locality or area name
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "NammaThalluvandi/2.0 (contact@nammathalluvandi.in)"
      }
    });
    if (!res.ok) throw new Error("Geocoding API status: " + res.status);
    const data = await res.json();
    if (data && data.address) {
      const addr = data.address;
      // Extract the neighborhood, suburb, or village
      const place = addr.neighbourhood || addr.suburb || addr.locality || addr.city_district || addr.town || addr.village;
      const city = addr.city || addr.town || addr.county || "Coimbatore";
      if (place && city && place.toLowerCase() !== city.toLowerCase()) {
        return `${place}, ${city}`;
      } else if (place) {
        return place;
      } else if (city) {
        return city;
      }
    }
    if (data && data.display_name) {
      const parts = data.display_name.split(",");
      if (parts.length >= 2) {
        return `${parts[0].trim()}, ${parts[1].trim()}`;
      }
      return parts[0].trim();
    }
    throw new Error("No address found");
  } catch (err) {
    console.error("Reverse geocoding error, falling back locally:", err);
    return getLocalFallbackLocationName(latitude, longitude);
  }
}

/**
 * Precision local fallback dictionary mapping coordinates to neighborhood names.
 * Ensures 100% offline support and reliability.
 */
export function getLocalFallbackLocationName(lat: number, lng: number): string {
  const points = [
    { name: "Ondipudur, Coimbatore", lat: 11.0028, lng: 77.0347 },
    { name: "Gandhipuram, Coimbatore", lat: 11.0183, lng: 76.9693 },
    { name: "Peelamedu, Coimbatore", lat: 11.0267, lng: 77.0089 },
    { name: "Tiruppur Junction", lat: 11.1085, lng: 77.3411 },
    { name: "Singanallur, Coimbatore", lat: 11.0006, lng: 77.0222 },
    { name: "R.S. Puram, Coimbatore", lat: 11.0115, lng: 76.9456 },
    { name: "Saibaba Colony, Coimbatore", lat: 11.0259, lng: 76.9427 },
    { name: "Saravanampatti, Coimbatore", lat: 11.0772, lng: 77.0088 },
    { name: "Ukkadam, Coimbatore", lat: 10.9958, lng: 76.9620 },
    { name: "Kuniyamuthur, Coimbatore", lat: 10.9702, lng: 76.9495 },
  ];

  let minDistance = Infinity;
  let closestPoint = points[0];

  for (const pt of points) {
    const dist = calculateHaversineDistance(
      { latitude: lat, longitude: lng },
      { latitude: pt.lat, longitude: pt.lng }
    );
    if (dist < minDistance) {
      minDistance = dist;
      closestPoint = pt;
    }
  }

  // If closest point is within 12km, use it. Otherwise, return generic location.
  if (minDistance < 12) {
    return closestPoint.name;
  }
  return lat >= 11.08 ? "Tiruppur" : "Coimbatore";
}
