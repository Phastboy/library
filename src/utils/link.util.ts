export const generateLink = (args: {
  endpoint: string;
  query?: Record<string, string>;
}): string => {
  const baseUrl = process.env.API_URL || 'http://localhost:8080';
  const url = new URL(args.endpoint, baseUrl);

  if (args.query) {
    Object.entries(args.query).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  return url.toString();
};
