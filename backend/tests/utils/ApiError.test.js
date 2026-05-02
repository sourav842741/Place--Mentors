import { describe, it, expect } from "@jest/globals";
import { ApiError } from "../../utils/ApiError.js";

describe("ApiError", () => {
  it("creates error with statusCode and message", () => {
    const err = new ApiError(400, "Bad request");
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe("Bad request");
    expect(err.success).toBe(false);
    expect(err.data).toBeNull();
    expect(err.errors).toEqual([]);
  });

  it("captures stack trace automatically", () => {
    const err = new ApiError(500, "Server error");
    expect(err.stack).toBeDefined();
    expect(err.stack).toContain("ApiError");
  });

  it("accepts custom stack", () => {
    const customStack = "Custom stack trace";
    const err = new ApiError(404, "Not found", [], customStack);
    expect(err.stack).toBe(customStack);
  });

  it("accepts errors array", () => {
    const errors = ["Field required", "Invalid format"];
    const err = new ApiError(422, "Validation failed", errors);
    expect(err.errors).toEqual(errors);
  });

  it("defaults message when not provided", () => {
    const err = new ApiError(500);
    expect(err.message).toBe("Something went wrong");
  });

  it("is instance of Error", () => {
    const err = new ApiError(400, "Test");
    expect(err instanceof Error).toBe(true);
  });
});
