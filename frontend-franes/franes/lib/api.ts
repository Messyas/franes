"use client"

const API_BASE_URL =
  (process.env.NEXT_PUBLIC_API_URL &&
    process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")) ||
  "http://localhost:8000"

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  token?: string | null
  headers?: HeadersInit
  body?: BodyInit | Record<string, unknown> | null
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

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: requestHeaders,
    body: requestBody,
    cache: "no-store",
    credentials: "include",
  })

  if (!response.ok) {
    let message = "Erro inesperado ao comunicar com o servidor"
    try {
      const data = await response.json()
      message = data.detail ?? message
    } catch {
      /* ignore parse errors */
    }

    throw new Error(message)
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
  return apiRequest<BlogPost[]>("/blog")
}

export async function createBlogPost(
  input: BlogPostInput,
  token: string,
): Promise<BlogPost> {
  return apiRequest<BlogPost>("/blog", {
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
