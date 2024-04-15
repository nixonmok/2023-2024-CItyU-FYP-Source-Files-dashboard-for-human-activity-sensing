/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack5: true,
    webpack: (config) => {
      config.resolve.fallback = { fs: false };
      config.devServer = {
        overlay: {
            warnings: true,
            errors: true
        }
    }
      return config;
    },
    node: {
        __dirname: false
    }
}

module.exports = nextConfig
