import { describe, it, expect } from "@jest/globals";
import { ApiResponse } from "../../utils/ApiResponse.js";

describe("ApiResponse", () => {
  it("marks success true for statusCode < 400", () => {
    const res = new ApiResponse(200, { id: 1 }, "OK");
    expect(res.success).toBe(true);
    expect(res.statusCode).toBe(200);
    expect(res.data).toEqual({ id: 1 });
    expect(res.message).toBe("OK");
  });

  it("marks success false for statusCode >= 400", () => {
    const res = new ApiResponse(400, null, "Bad request");
    expect(res.success).toBe(false);
    expect(res.statusCode).toBe(400);
  });

  it("marks success false for 500", () => {
    const res = new ApiResponse(500, null, "Server error");
    expect(res.success).toBe(false);
  });

  it('defaults message to "Success"', () => {
    const res = new ApiResponse(200, {});
    expect(res.message).toBe("Success");
  });

  it("handles null data", () => {
    const res = new ApiResponse(204, null);
    expect(res.data).toBeNull();
    expect(res.success).toBe(true);
  });
});
