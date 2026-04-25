import { describe, it, expect, jest } from '@jest/globals';
import { asyncHandler } from '../../utils/asyncHandler.js';

describe('asyncHandler', () => {
  const mockReq = {};
  const mockRes = {};
  const mockNext = jest.fn();

  beforeEach(() => {
    mockNext.mockClear();
  });

  it('resolves async function successfully', async () => {
    const handler = asyncHandler(async (req, res) => {
      res.sent = true;
    });

    await handler(mockReq, mockRes, mockNext);
    expect(mockRes.sent).toBe(true);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('catches async rejection and calls next with error', async () => {
    const error = new Error('Database failure');
    const handler = asyncHandler(async () => {
      throw error;
    });

    await handler(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalledWith(error);
  });

  it('handles synchronous function', async () => {
    const handler = asyncHandler((req, res) => {
      res.sync = true;
    });

    await handler(mockReq, mockRes, mockNext);
    expect(mockRes.sync).toBe(true);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('does NOT catch synchronous throw (limitation)', async () => {
    const error = new Error('Sync error');
    const handler = asyncHandler(() => {
      throw error;
    });

    // Note: asyncHandler uses Promise.resolve(fn()) which evaluates fn()
    // before wrapping, so synchronous throws propagate up.
    // In production, all controllers use async functions with asyncHandler.
    expect(() => handler(mockReq, mockRes, mockNext)).toThrow('Sync error');
  });
});

