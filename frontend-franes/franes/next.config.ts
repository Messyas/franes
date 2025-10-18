import type { NextConfig } from "next"

function removeTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "")
}

function normalizeLeadingSlash(value: string): string {
  return value.replace(/^\/+/, "")
}

function sanitizeOrigin(value: string | undefined | null): string {
  if (!value) {
    return "http://localhost:8000"
  }
  const trimmed = value.trim()
  if (!trimmed) {
    return "http://localhost:8000"
  }
  return removeTrailingSlash(trimmed)
}

function sanitizeBasePath(value: string | undefined | null): string {
  if (!value) {
    return ""
  }
  const trimmed = value.trim()
  if (!trimmed) {
    return ""
  }
  return `/${normalizeLeadingSlash(removeTrailingSlash(trimmed))}`
}

function sanitizePort(value: string | undefined | null): string | undefined {
  if (!value) {
    return undefined
  }
  const trimmed = value.trim().replace(/^:/, "")
  return trimmed || undefined
}

const apiUrl = sanitizeOrigin(process.env.NEXT_PUBLIC_API_URL)
const apiBasePath = sanitizeBasePath(process.env.NEXT_PUBLIC_API_BASE_PATH)
const fallbackPort = sanitizePort(process.env.NEXT_PUBLIC_API_FALLBACK_PORT) ?? "8000"

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: apiUrl,
    NEXT_PUBLIC_API_BASE_PATH: apiBasePath,
    NEXT_PUBLIC_API_FALLBACK_PORT: fallbackPort,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
}

export default nextConfig
