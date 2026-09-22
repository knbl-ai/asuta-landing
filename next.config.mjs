/** @type {import('next').NextConfig} */
const nextConfig = {
  // Set NEXT_BASE_PATH (e.g. "/ashdod") if the site is served under a path of assuta.co.il.
  basePath: process.env.NEXT_BASE_PATH || '',
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 85],
  },
  poweredByHeader: false,
  // The dev-tools badge has no focus indicator and shows up as a phantom keyboard
  // failure in the accessibility checks.
  devIndicators: false,
};

export default nextConfig;
