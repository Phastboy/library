import { generateLink } from './link.util';

describe('generateLink', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv }; // Reset the environment
  });

  afterAll(() => {
    process.env = originalEnv; // Restore the original environment
  });

  it('should generate a link using the provided endpoint and default base URL', () => {
    delete process.env.API_URL; // Ensure no API_URL is set
    const result = generateLink({ endpoint: '/test' });
    expect(result).toBe('http://localhost:8080/test');
  });

  it('should generate a link using the provided endpoint and API_URL from environment variables', () => {
    process.env.API_URL = 'https://api.example.com';
    const result = generateLink({ endpoint: '/test' });
    expect(result).toBe('https://api.example.com/test');
  });

  it('should append query parameters to the generated link', () => {
    process.env.API_URL = 'https://api.example.com';
    const result = generateLink({
      endpoint: '/test',
      query: { key1: 'value1', key2: 'value2' },
    });
    expect(result).toBe('https://api.example.com/test?key1=value1&key2=value2');
  });

  it('should handle query parameters with special characters', () => {
    process.env.API_URL = 'https://api.example.com';
    const result = generateLink({
      endpoint: '/test',
      query: { key: 'value with spaces', 'key/special': 'value&special' },
    });
    expect(result).toBe(
      'https://api.example.com/test?key=value+with+spaces&key%2Fspecial=value%26special'
    );
  });

  it('should handle missing query parameters gracefully', () => {
    process.env.API_URL = 'https://api.example.com';
    const result = generateLink({ endpoint: '/test' });
    expect(result).toBe('https://api.example.com/test');
  });
});
