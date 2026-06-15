// IP -> Location enrichment using geoip-lite
import geoip from "geoip-lite";

export const getLocationFromIp = async (ip) => {
  try {
    if (!ip || typeof ip !== "string") {
      return { city: "", region: "", country: "" };
    }

    // handle IPv6-mapped IPv4 or plain IPv6/port formats
    // Examples: "::ffff:8.8.8.8" or "8.8.8.8:1234" 
    const cleaned = ip.includes(":") && ip.includes(".") ? ip.split(":").pop() : ip;
    const address = cleaned.split(":")[0];

    const geo = geoip.lookup(address);
    if (!geo) {
      return { city: "", region: "", country: "" };
    }

    return {
      city: geo.city || "",
      region: geo.region || "",
      country: geo.country || "",
    };
  } catch {
    return { city: "", region: "", country: "" };
  }
};

