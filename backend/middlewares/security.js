const dummyLimiter = (req, res, next) => {
  next();
};

/* ==================================================
   ALL LIMITERS DISABLED
================================================== */

export const strictLimiter = dummyLimiter;

export const mediumLimiter = dummyLimiter;

export const paymentLimiter = dummyLimiter;

export const generalLimiter = dummyLimiter;

export const adminLimiter = dummyLimiter;

/* ==================================================
   GLOBAL SECURITY SETUP
================================================== */

const setupSecurity = (app) => {
  // No global rate limiting
};

export default setupSecurity;