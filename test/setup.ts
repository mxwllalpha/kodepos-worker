/**
 * Test setup for Kodepos Worker
 * Configures global test environment and mocks
 */

import { vi } from 'vitest';

// Mock Cloudflare Workers environment
global.Request = Request;
global.Response = Response;
global.Headers = Headers;

// Mock D1 Database
export const mockD1Database = {
  prepare: vi.fn(() => ({
    bind: vi.fn(() => ({
      run: vi.fn(() => Promise.resolve({ success: true })),
      first: vi.fn(() => Promise.resolve({ id: 1, total: 0 })),
      all: vi.fn(() => Promise.resolve({ results: [] })),
    })),
    run: vi.fn(() => Promise.resolve({ success: true })),
    first: vi.fn(() => Promise.resolve({ id: 1, total: 0 })),
    all: vi.fn(() => Promise.resolve({ results: [] })),
  })),
  batch: vi.fn(() => Promise.resolve([])),
  exec: vi.fn(() => Promise.resolve({ success: true })),
};

// Mock environment variables
const mockEnv = {
  KODEPOS_DB: mockD1Database,
  KODEPOS_CACHE: {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
};

// Global test utilities
export const createMockContext = (overrides = {}) => ({
  req: {
    query: vi.fn((key: string) => null),
    param: vi.fn((key: string) => null),
    header: vi.fn((key: string) => null),
  },
  env: { ...mockEnv, ...overrides },
  json: vi.fn(),
  text: vi.fn(),
  status: vi.fn(() => ({ json: vi.fn() })),
});

// Test data
export const mockPostalData = [
  {
    id: 1,
    kodepos: '10110',
    kelurahan: 'Petonggan',
    kecamatan: 'Ketapang',
    kota: 'Sungai Penuh',
    provinsi: 'Jambi',
    latitude: -2.0374,
    longitude: 101.6543,
  },
  {
    id: 2,
    kodepos: '10120',
    kelurahan: 'Pasar Sungai Penuh',
    kecamatan: 'Koto Baru',
    kota: 'Sungai Penuh',
    provinsi: 'Jambi',
    latitude: -2.0527,
    longitude: 101.6519,
  },
];

export const mockHealthStats = {
  total_records: 83761,
  provinces: 34,
  cities: 514,
  districts: 7094,
  villages: 83168,
  last_updated: '2024-01-01T00:00:00Z',
};

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
});