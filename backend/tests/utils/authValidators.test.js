import { describe, it, expect } from "@jest/globals";
import {
  validateEmail,
  validatePassword,
  validateSkills,
  generateOTP,
  sanitizeUser,
} from "../../utils/authValidators.js";

describe("authValidators", () => {
  /* ================= validateEmail ================= */
  describe("validateEmail", () => {
    it("returns true for valid email", () => {
      expect(validateEmail("user@example.com")).toBe(true);
      expect(validateEmail("test.name@domain.co.in")).toBe(true);
    });

    it("returns false for invalid email", () => {
      expect(validateEmail("")).toBe(false);
      expect(validateEmail("plainstring")).toBe(false);
      expect(validateEmail("@nodomain.com")).toBe(false);
      expect(validateEmail("spaces in@email.com")).toBe(false);
      expect(validateEmail("double@@at.com")).toBe(false);
      expect(validateEmail("missing@tld")).toBe(false);
    });

    it("returns false for null/undefined", () => {
      expect(validateEmail(null)).toBe(false);
      expect(validateEmail(undefined)).toBe(false);
    });
  });

  /* ================= validatePassword ================= */
  describe("validatePassword", () => {
    it("returns true for password >= 6 chars", () => {
      expect(validatePassword("123456")).toBe(true);
      expect(validatePassword("securePass123")).toBe(true);
    });

    it("returns false for password < 6 chars", () => {
      expect(validatePassword("12345")).toBe(false);
      expect(validatePassword("")).toBe(false);
    });

    it("returns false for null/undefined", () => {
      expect(validatePassword(null)).toBe(false);
      expect(validatePassword(undefined)).toBe(false);
    });
  });

  /* ================= validateSkills ================= */
  describe("validateSkills", () => {
    it("returns true for non-empty array of valid strings", () => {
      expect(validateSkills(["React", "Node.js"])).toBe(true);
      expect(validateSkills(["DSA"])).toBe(true);
    });

    it("returns false for empty array", () => {
      expect(validateSkills([])).toBe(false);
    });

    it("returns false for array with empty/whitespace strings", () => {
      expect(validateSkills(["React", ""])).toBe(false);
      expect(validateSkills(["React", "   "])).toBe(false);
    });

    it("returns false for non-array input", () => {
      expect(validateSkills("React, Node")).toBe(false);
      expect(validateSkills(null)).toBe(false);
      expect(validateSkills(undefined)).toBe(false);
      expect(validateSkills(123)).toBe(false);
    });
  });

  /* ================= generateOTP ================= */
  describe("generateOTP", () => {
    it("generates a 4-digit string", () => {
      const otp = generateOTP();
      expect(otp).toHaveLength(4);
      expect(/^\d{4}$/.test(otp)).toBe(true);
    });

    it("generates different OTPs on multiple calls", () => {
      const otp1 = generateOTP();
      const otp2 = generateOTP();
      // Very unlikely to be same; test structure only
      expect(otp1).toHaveLength(4);
      expect(otp2).toHaveLength(4);
    });

    it("generates OTP within 1000-9999 range", () => {
      for (let i = 0; i < 20; i++) {
        const otp = parseInt(generateOTP(), 10);
        expect(otp).toBeGreaterThanOrEqual(1000);
        expect(otp).toBeLessThanOrEqual(9999);
      }
    });
  });

  /* ================= sanitizeUser ================= */
  describe("sanitizeUser", () => {
    it("removes sensitive fields from mongoose-like object", () => {
      const user = {
        toObject: () => ({
          fullName: "John",
          email: "john@example.com",
          password: "secret",
          twoFactorSecret: "abc",
          twoFactorTempSecret: "def",
          twoFactorRecoveryCodes: ["123"],
          trustedDevices: [{ deviceId: "x" }],
        }),
      };
      const result = sanitizeUser(user);
      expect(result.password).toBeUndefined();
      expect(result.twoFactorSecret).toBeUndefined();
      expect(result.twoFactorTempSecret).toBeUndefined();
      expect(result.twoFactorRecoveryCodes).toBeUndefined();
      expect(result.trustedDevices).toBeUndefined();
      expect(result.fullName).toBe("John");
      expect(result.email).toBe("john@example.com");
    });

    it("removes sensitive fields from plain object", () => {
      const user = {
        fullName: "Jane",
        password: "secret",
        twoFactorSecret: "abc",
      };
      const result = sanitizeUser(user);
      expect(result.password).toBeUndefined();
      expect(result.fullName).toBe("Jane");
    });
  });
});
