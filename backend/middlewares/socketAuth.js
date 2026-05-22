import jwt from "jsonwebtoken";

const parseCookie = (cookieHeader, name) => {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
};

export const attachSocketAuth = (io) => {
  io.use((socket, next) => {
    try {
      // HTTP-only cookie token (recommended)
      const cookieHeader = socket.handshake.headers?.cookie;
      const cookieToken = parseCookie(cookieHeader, "token");

      // Only keep these for backward compatibility / debugging.
      const tokenFromHandshake = socket.handshake.auth?.token || socket.handshake.query?.token;

      const token = cookieToken || tokenFromHandshake;

      // Production-safe debugging (no token value leakage)
      // console.log("[SOCKET AUTH]", {
      //   sid: socket.id,
      //   hasCookieHeader: Boolean(cookieHeader),
      //   hasCookieToken: Boolean(cookieToken),
      //   hasHandshakeToken: Boolean(tokenFromHandshake),
      //   transport: socket.conn?.transport?.name,
      // });

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      return next();
    } catch (error) {
      return next(new Error("Invalid authentication token"));
    }
  });
};
