/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'leisure-map-zhso.vercel.app',
          },
        ],
        destination: 'https://leisure-map.vercel.app/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
