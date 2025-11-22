// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    JWT_SECRET: process.env.JWT_SECRET, // se inyecta en Edge y Node
  },
};

module.exports = nextConfig;
