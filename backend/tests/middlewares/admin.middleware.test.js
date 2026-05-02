import { describe, it, expect, jest } from "@jest/globals";
import isAdmin from "../../middlewares/admin.middleware.js";
import { ApiError } from "../../utils/ApiError.js";

describe("isAdmin middleware", () => {
  const mockNext = jest.fn();

  beforeEach(() => {
    mockNext.mockClear();
    delete process.env.SUPER_ADMIN_EMAIL;
  });

  it("calls next() for admin role", () => {
    const req = { user: { role: "admin", email: "admin@test.com" } };
    isAdmin(req, {}, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockNext).toHaveBeenCalledWith();
  });

  it("calls next() for superadmin role", () => {
    const req = { user: { role: "superadmin", email: "sa@test.com" } };
    isAdmin(req, {}, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockNext).toHaveBeenCalledWith();
  });

  it("throws ApiError for regular user", () => {
    const req = { user: { role: "user", email: "user@test.com" } };
    expect(() => isAdmin(req, {}, mockNext)).toThrow(ApiError);
    expect(() => isAdmin(req, {}, mockNext)).toThrow("Admin access required");
  });

  it("throws ApiError when user is missing", () => {
    const req = {};
    expect(() => isAdmin(req, {}, mockNext)).toThrow(ApiError);
    expect(() => isAdmin(req, {}, mockNext)).toThrow("Admin access required");
  });

  it("allows super_admin_email match", () => {
    process.env.SUPER_ADMIN_EMAIL = "boss@company.com";
    const req = { user: { role: "user", email: "boss@company.com" } };
    isAdmin(req, {}, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);
  });
});
