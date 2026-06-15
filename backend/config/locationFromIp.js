// Backward-compatible wrapper for repo imports.
// Returns { city, region, country } strings (empty when unknown).
import { getLocationFromIp as impl } from "./geoipLocation.js";

export const getLocationFromIp = async (ip) => impl(ip);

