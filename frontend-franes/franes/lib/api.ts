"use client"

function removeTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "")
}

function normalizeLeadingSlash(value: string): string {
  return value.replace(/^\/+/, "")
}

function normalizePort(value: string | undefined): string | undefined {
  if (!value) return undefined
  const sanitized = value.trim().replace(/^:/, "")
  return sanitized || undefined
}

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim()
const rawBasePath = process.env.NEXT_PUBLIC_API_BASE_PATH?.trim()
const fallbackPort = normalizePort(
  process.env.NEXT_PUBLIC_API_FALLBACK_PORT,
) || "8000"

const apiBasePath = rawBasePath
  ? `/${normalizeLeadingSlash(removeTrailingSlash(rawBasePath))}`
  : ""

function resolveApiOrigin(): string {
  if (rawApiUrl) {
    return removeTrailingSlash(rawApiUrl)
  }

  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location
    const portSegment = formatPort(protocol, fallbackPort)
    return `${protocol}//${hostname}${portSegment}`
  }

  return `http://localhost:${fallbackPort}`
}

function formatPort(protocol: string, port: string): string {
  if (!port) return ""
  if ((protocol === "http:" && port === "80") || (protocol === "https:" && port === "443")) {
    return ""
  }
  return `:${port}`
}

export function buildApiUrl(path: string): string {
  const origin = removeTrailingSlash(resolveApiOrigin())
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${origin}${apiBasePath}${normalizedPath}`
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  token?: string | null
  headers?: HeadersInit
  body?: BodyInit | Record<string, unknown> | null
}

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = "ApiError"
  }
}

async function apiRequest<T>(
  path: string,
  { method = "GET", token, headers, body }: RequestOptions = {},
): Promise<T> {
  const requestHeaders: HeadersInit = {
    Accept: "application/json",
    ...(headers ?? {}),
  }

  let requestBody: BodyInit | undefined
  if (body instanceof FormData || body instanceof URLSearchParams) {
    requestBody = body
  } else if (body !== null && body !== undefined) {
    requestHeaders["Content-Type"] = "application/json"
    requestBody = JSON.stringify(body)
  }

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`
  }

  const response = await fetch(buildApiUrl(path), {
    method,
    headers: requestHeaders,
    body: requestBody,
    cache: "no-store",
    credentials: "omit",
  })

  if (!response.ok) {
    let message = `Erro ${response.status} ao comunicar com o servidor`
    try {
      const data = await response.json()
      message = data.detail ?? message
    } catch {
      /* ignore parse errors */
    }

    if (response.status === 401) {
      message = "Sessão expirada ou credenciais inválidas. Faça login novamente."
    }

    throw new ApiError(response.status, message)
  }

  if (response.status === 204) {
    return null as T
  }

  return (await response.json()) as T
}

export type BlogPost = {
  id: number
  title: string
  reading_time: number
  content: string
  created_at: string
}

export type BlogPostInput = {
  title: string
  reading_time: number
  content: string
}

export type CloudinaryAsset = {
  public_id: string
  url: string
  secure_url?: string
  format?: string
  width?: number
  height?: number
  resource_type?: string
  bytes?: number
  folder?: string
  created_at?: string
  metadata?: Record<string, unknown> | null
}

export type ArtRecord = {
  id: number
  title: string
  description: string
  image: CloudinaryAsset | null
  created_at: string
}

export type ArtInput = {
  title: string
  description: string
  image: CloudinaryAsset | null
}

export type StoryScriptRecord = {
  id: number
  title: string
  sub_title: string
  author_note: string
  content: string
  author_final_comment: string
  cover_image: CloudinaryAsset | null
  created_at: string
}

export type StoryScriptInput = {
  title: string
  sub_title: string
  author_note: string
  content: string
  author_final_comment: string
  cover_image: CloudinaryAsset | null
}

export type CurriculumRecord = {
  id: number
  title: string
  description: string | null
  file_name: string
  csv_content?: string | null
  pdf_base64?: string | null
  pdf_url: string | null
  created_at: string
  updated_at: string
}

export type CurriculumInput = {
  title: string
  description?: string | null
  file_name: string
  pdf_base64: string
}

export async function loginAdmin(
  username: string,
  password: string,
): Promise<string> {
  const body = new URLSearchParams({
    username,
    password,
  })

  const result = await apiRequest<{ access_token: string }>("/admin/auth/token", {
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })

  return result.access_token
}

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  return apiRequest<BlogPost[]>("/blog/")
}

export async function fetchArtworks(): Promise<ArtRecord[]> {
  return apiRequest<ArtRecord[]>("/art/")
}

export async function fetchStoryScripts(): Promise<StoryScriptRecord[]> {
  return apiRequest<StoryScriptRecord[]>("/story-script/")
}

export async function fetchLatestCurriculum(): Promise<CurriculumRecord> {
  return apiRequest<CurriculumRecord>("/curriculum/latest")
}

export async function fetchCurriculumEntries(): Promise<CurriculumRecord[]> {
  return apiRequest<CurriculumRecord[]>("/curriculum/")
}

export async function createBlogPost(
  input: BlogPostInput,
  token: string,
): Promise<BlogPost> {
  return apiRequest<BlogPost>("/blog/", {
    method: "POST",
    token,
    body: input,
  })
}

export async function updateBlogPost(
  id: number,
  input: BlogPostInput,
  token: string,
): Promise<BlogPost> {
  return apiRequest<BlogPost>(`/blog/${id}`, {
    method: "PUT",
    token,
    body: input,
  })
}

export async function deleteBlogPost(id: number, token: string): Promise<void> {
  await apiRequest<void>(`/blog/${id}`, {
    method: "DELETE",
    token,
  })
}

export async function createCurriculumEntry(
  input: CurriculumInput,
  token: string,
): Promise<CurriculumRecord> {
  return apiRequest<CurriculumRecord>("/curriculum/", {
    method: "POST",
    token,
    body: input,
  })
}

export async function deleteCurriculumEntry(id: number, token: string): Promise<void> {
  await apiRequest<void>(`/curriculum/${id}`, {
    method: "DELETE",
    token,
  })
}

export async function createStoryScript(
  input: StoryScriptInput,
  token: string,
): Promise<StoryScriptRecord> {
  return apiRequest<StoryScriptRecord>("/story-script/", {
    method: "POST",
    token,
    body: input,
  })
}

export async function updateStoryScript(
  id: number,
  input: StoryScriptInput,
  token: string,
): Promise<StoryScriptRecord> {
  return apiRequest<StoryScriptRecord>(`/story-script/${id}`, {
    method: "PUT",
    token,
    body: input,
  })
}

export async function deleteStoryScript(id: number, token: string): Promise<void> {
  await apiRequest<void>(`/story-script/${id}`, {
    method: "DELETE",
    token,
  })
}

export async function createArtwork(
  input: ArtInput,
  token: string,
): Promise<ArtRecord> {
  return apiRequest<ArtRecord>("/art/", {
    method: "POST",
    token,
    body: input,
  })
}

export async function updateArtwork(
  id: number,
  input: ArtInput,
  token: string,
): Promise<ArtRecord> {
  return apiRequest<ArtRecord>(`/art/${id}`, {
    method: "PUT",
    token,
    body: input,
  })
}

export async function deleteArtwork(id: number, token: string): Promise<void> {
  await apiRequest<void>(`/art/${id}`, {
    method: "DELETE",
    token,
  })
}
