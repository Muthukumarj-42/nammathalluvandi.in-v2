export const CITIES = ["Coimbatore"] as const;
export type City = (typeof CITIES)[number];
