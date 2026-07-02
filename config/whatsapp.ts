export const WA_NUMBER = "918838292849";
export const WA_PUBLISH = "917305514199";

export const buildWAUrl = (number: string, message: string) =>
  `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
