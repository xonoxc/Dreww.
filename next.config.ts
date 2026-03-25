import type { NextConfig } from "next"

/*
 *
 * nextjs config file (react compiler enabled)
 * **/
const nextConfig: NextConfig = {
   reactCompiler: true,
   typescript: {
      ignoreBuildErrors: true,
   },
   images: {
      unoptimized: true,
   },
}

export default nextConfig
