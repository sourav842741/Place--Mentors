import { describe, it, expect, jest } from "@jest/globals";
import errorHandler from "../../middlewares/errorHandler.js";
import { ApiError } from "../../utils/ApiError.js";

describe("errorHandler", () => {
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  // Suppress console.error during tests
  beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    console.error.mockRestore();
  });

  it("handles ApiError with correct statusCode", () => {
    const err = new ApiError(404, "Resource not found");
    const res = mockRes();
    errorHandler(err, {}, res, () => {});
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        message: "Resource not found",
        success: false,
      })
    );
  });

  it("handles multer file size error", () => {
    const err = { code: "LIMIT_FILE_SIZE" };
    const res = mockRes();
    errorHandler(err, {}, res, () => {});
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "File too large. Max 5MB allowed",
        success: false,
      })
    );
  });

  it("handles generic error with 500", () => {
    const err = new Error("Unexpected error");
    const res = mockRes();
    errorHandler(err, {}, res, () => {});
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Internal Server Error",
        success: false,
      })
    );
  });
});
