/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: "out",
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: "",
  trailingSlash: true,
}

module.exports = nextConfig