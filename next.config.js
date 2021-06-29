module.exports = {
  reactStrictMode: true,
  env: {
    SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY,
  },
  eslint: {
    // Warning: Dangerously allow production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};
