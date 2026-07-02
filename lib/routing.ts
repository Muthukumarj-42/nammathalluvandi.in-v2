// Distance-Based Routing Logic (Part 3 of the main dev plan)
// 
// DESIGN DECISION:
// We use a distance-based routing matching algorithm instead of a fixed zone/district table.
// A zone-based system (e.g. assigning by neighborhood/district boundaries) creates arbitrary 
// cutoffs where a vendor just across the boundary (e.g., 2km away) is ignored in favor of a vendor 
// within the same district (e.g., 25km away). 
// By using the straight-line Haversine formula on raw latitude/longitude coordinates, we ensure 
// the matching is mathematically fair, matches the absolute closest available Cart Vendor to the 
// Business Vendor's request location, and scales dynamically without needing to pre-populate or maintain 
// database tables for 38+ districts.

export interface Location {
  latitude: number;
  longitude: number;
}

/**
 * Calculates the straight-line distance between two points on the Earth's surface
 * using the Haversine formula.
 * @param loc1 Coordinates of the first location
 * @param loc2 Coordinates of the second location
 * @returns Distance in kilometers
 */
export function calculateHaversineDistance(loc1: Location, loc2: Location): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((loc2.latitude - loc1.latitude) * Math.PI) / 180;
  const dLon = ((loc2.longitude - loc1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((loc1.latitude * Math.PI) / 180) *
      Math.cos((loc2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

export interface VendorDistance {
  vendorId: string;
  vendorName: string;
  vendorPhone: string;
  cartId: string;
  cartType: string;
  distanceKm: number;
}

/**
 * Ranks all available carts by their straight-line distance from the booking enquiry location.
 * Only live/available carts are considered.
 * @param targetLoc The coordinates of the Business Vendor (BV) placing the enquiry
 * @param cartsList List of all carts in the system (normally from the database)
 * @param vendorsList List of all users in the system to resolve owner details
 * @returns Sorted array of carts and their owners, nearest first
 */
export function rankVendorsByDistance(
  targetLoc: Location,
  cartsList: any[],
  vendorsList: any[]
): VendorDistance[] {
  return cartsList
    .filter((cart) => cart.status === "live" || cart.status === "live")
    .map((cart) => {
      const owner = vendorsList.find((v) => v.id === cart.owner_id);
      const distance = calculateHaversineDistance(targetLoc, {
        latitude: cart.latitude,
        longitude: cart.longitude,
      });

      return {
        vendorId: cart.owner_id,
        vendorName: owner ? owner.name : "Unknown Vendor",
        vendorPhone: owner ? owner.phone : "",
        cartId: cart.id,
        cartType: cart.type,
        distanceKm: Number(distance.toFixed(2)),
      };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
