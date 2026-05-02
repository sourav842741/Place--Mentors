import { describe, it, expect } from "@jest/globals";
import {
  privilegedRoles,
  isPrivilegedRole,
  generateSecret,
  verifyTOTP,
  generateRecoveryCodes,
  hashRecoveryCodes,
  verifyRecoveryCode,
  generateDeviceId,
} from "../../utils/twoFactor.js";

describe("twoFactor", () => {
  /* ================= isPrivilegedRole ================= */
  describe("isPrivilegedRole", () => {
    it("returns true for admin", () => {
      expect(isPrivilegedRole("admin")).toBe(true);
    });

    it("returns true for superadmin", () => {
      expect(isPrivilegedRole("superadmin")).toBe(true);
    });

    it("returns false for user", () => {
      expect(isPrivilegedRole("user")).toBe(false);
    });

    it("returns false for unknown role", () => {
      expect(isPrivilegedRole("moderator")).toBe(false);
    });

    it("returns false for null/undefined", () => {
      expect(isPrivilegedRole(null)).toBe(false);
      expect(isPrivilegedRole(undefined)).toBe(false);
    });
  });

  /* ================= privilegedRoles ================= */
  describe("privilegedRoles", () => {
    it("contains admin and superadmin", () => {
      expect(privilegedRoles).toContain("admin");
      expect(privilegedRoles).toContain("superadmin");
      expect(privilegedRoles).not.toContain("user");
    });
  });

  /* ================= generateSecret ================= */
  describe("generateSecret", () => {
    it("returns object with base32 and otpauth_url", () => {
      const secret = generateSecret("test@example.com", "admin");
      expect(secret.base32).toBeDefined();
      expect(secret.otpauth_url).toBeDefined();
      expect(secret.base32.length).toBeGreaterThan(10);
    });

    it("includes role in otpauth_url", () => {
      const secret = generateSecret("admin@test.com", "superadmin");
      expect(secret.otpauth_url).toContain("Super%20Admin");
    });

    it("works with default parameters", () => {
      const secret = generateSecret();
      expect(secret.base32).toBeDefined();
    });
  });

  /* ================= verifyTOTP ================= */
  describe("verifyTOTP", () => {
    it("returns false for invalid token", () => {
      const result = verifyTOTP("INVALIDSECRET123", "000000");
      expect(result).toBe(false);
    });

    it("returns false for empty token", () => {
      const result = verifyTOTP("SOMESECRET", "");
      expect(result).toBe(false);
    });
  });

  /* ================= generateRecoveryCodes ================= */
  describe("generateRecoveryCodes", () => {
    it("generates 8 codes by default", () => {
      const codes = generateRecoveryCodes();
      expect(codes).toHaveLength(8);
    });

    it("generates requested count", () => {
      const codes = generateRecoveryCodes(5);
      expect(codes).toHaveLength(5);
    });

    it("generates uppercase hex codes", () => {
      const codes = generateRecoveryCodes();
      codes.forEach((code) => {
        expect(code).toMatch(/^[A-F0-9]{8}$/);
      });
    });

    it("generates unique codes", () => {
      const codes = generateRecoveryCodes(100);
      const unique = new Set(codes);
      expect(unique.size).toBe(codes.length);
    });
  });

  /* ================= hashRecoveryCodes ================= */
  describe("hashRecoveryCodes", () => {
    it("returns same length as input", () => {
      const codes = ["ABCD1234", "EFGH5678"];
      const hashed = hashRecoveryCodes(codes);
      expect(hashed).toHaveLength(codes.length);
    });

    it("returns SHA-256 hex hashes", () => {
      const codes = ["TESTCODE"];
      const hashed = hashRecoveryCodes(codes);
      expect(hashed[0]).toMatch(/^[a-f0-9]{64}$/);
    });

    it("produces deterministic hashes", () => {
      const codes = ["ABC12345"];
      const hash1 = hashRecoveryCodes(codes);
      const hash2 = hashRecoveryCodes(codes);
      expect(hash1[0]).toBe(hash2[0]);
    });
  });

  /* ================= verifyRecoveryCode ================= */
  describe("verifyRecoveryCode", () => {
    it("returns index when code matches", () => {
      const codes = ["ABCD1234", "EFGH5678"];
      const hashed = hashRecoveryCodes(codes);
      expect(verifyRecoveryCode("ABCD1234", hashed)).toBe(0);
      expect(verifyRecoveryCode("EFGH5678", hashed)).toBe(1);
    });

    it("returns -1 when code does not match", () => {
      const codes = ["ABCD1234"];
      const hashed = hashRecoveryCodes(codes);
      expect(verifyRecoveryCode("WRONG123", hashed)).toBe(-1);
    });

    it("is case insensitive", () => {
      const codes = ["ABCD1234"];
      const hashed = hashRecoveryCodes(codes);
      expect(verifyRecoveryCode("abcd1234", hashed)).toBe(0);
    });

    it("trims whitespace", () => {
      const codes = ["ABCD1234"];
      const hashed = hashRecoveryCodes(codes);
      expect(verifyRecoveryCode("  ABCD1234  ", hashed)).toBe(0);
    });
  });

  /* ================= generateDeviceId ================= */
  describe("generateDeviceId", () => {
    it("generates a 64-char hex string", () => {
      const id = generateDeviceId();
      expect(id).toMatch(/^[a-f0-9]{64}$/);
    });

    it("generates unique IDs", () => {
      const id1 = generateDeviceId();
      const id2 = generateDeviceId();
      expect(id1).not.toBe(id2);
    });
  });
});
