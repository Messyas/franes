"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react"
import type { ReactNode } from "react"

import {
  type ArtRecord,
  type BlogPost,
  type CurriculumRecord,
  type StoryScriptRecord,
  fetchArtworks,
  fetchBlogPosts,
  fetchLatestCurriculum,
  fetchStoryScripts,
} from "@/lib/api"

type Status = "idle" | "loading" | "success" | "error"

type ResourceState<T> = {
  data: T | null
  status: Status
  error: string | null
}

type LoadOptions = {
  force?: boolean
}

type ContentCacheContextValue = {
  artworks: ArtRecord[] | null
  artworksStatus: Status
  artworksError: string | null
  loadArtworks: (options?: LoadOptions) => Promise<ArtRecord[]>

  storyScripts: StoryScriptRecord[] | null
  storyScriptsStatus: Status
  storyScriptsError: string | null
  loadStoryScripts: (options?: LoadOptions) => Promise<StoryScriptRecord[]>

  blogPosts: BlogPost[] | null
  blogPostsStatus: Status
  blogPostsError: string | null
  loadBlogPosts: (options?: LoadOptions) => Promise<BlogPost[]>

  latestCurriculum: CurriculumRecord | null
  curriculumStatus: Status
  curriculumError: string | null
  loadLatestCurriculum: (options?: LoadOptions) => Promise<CurriculumRecord>
}

const ContentCacheContext = createContext<ContentCacheContextValue | undefined>(undefined)

function createInitialState<T>(): ResourceState<T> {
  return {
    data: null,
    status: "idle",
    error: null,
  }
}

function createErrorMessage(defaultMessage: string, err: unknown): string {
  if (err instanceof Error) {
    return err.message
  }
  return defaultMessage
}

export function ContentCacheProvider({ children }: { children: ReactNode }) {
  const [artworksState, setArtworksState] = useState<ResourceState<ArtRecord[]>>(createInitialState)
  const [storyScriptsState, setStoryScriptsState] =
    useState<ResourceState<StoryScriptRecord[]>>(createInitialState)
  const [blogPostsState, setBlogPostsState] = useState<ResourceState<BlogPost[]>>(createInitialState)
  const [curriculumState, setCurriculumState] =
    useState<ResourceState<CurriculumRecord>>(createInitialState)

  const inflightRequests = useRef<{
    artworks: Promise<ArtRecord[]> | null
    storyScripts: Promise<StoryScriptRecord[]> | null
    blogPosts: Promise<BlogPost[]> | null
    curriculum: Promise<CurriculumRecord> | null
  }>({
    artworks: null,
    storyScripts: null,
    blogPosts: null,
    curriculum: null,
  })

  const loadArtworks = useCallback(
    async ({ force = false }: LoadOptions = {}) => {
      if (!force && artworksState.data) {
        return artworksState.data
      }

      if (!force && inflightRequests.current.artworks) {
        return inflightRequests.current.artworks
      }

      setArtworksState((prev) => ({
        data: force ? null : prev.data,
        status: "loading",
        error: null,
      }))

      const request = fetchArtworks()
        .then((data) => {
          setArtworksState({
            data,
            status: "success",
            error: null,
          })
          return data
        })
        .catch((err) => {
          const message = createErrorMessage("Não foi possível carregar as artes.", err)
          setArtworksState((prev) => ({
            data: prev.data,
            status: "error",
            error: message,
          }))
          throw err
        })
        .finally(() => {
          inflightRequests.current.artworks = null
        })

      inflightRequests.current.artworks = request
      return request
    },
    [artworksState.data],
  )

  const loadStoryScripts = useCallback(
    async ({ force = false }: LoadOptions = {}) => {
      if (!force && storyScriptsState.data) {
        return storyScriptsState.data
      }

      if (!force && inflightRequests.current.storyScripts) {
        return inflightRequests.current.storyScripts
      }

      setStoryScriptsState((prev) => ({
        data: force ? null : prev.data,
        status: "loading",
        error: null,
      }))

      const request = fetchStoryScripts()
        .then((data) => {
          setStoryScriptsState({
            data,
            status: "success",
            error: null,
          })
          return data
        })
        .catch((err) => {
          const message = createErrorMessage("Não foi possível carregar os roteiros.", err)
          setStoryScriptsState((prev) => ({
            data: prev.data,
            status: "error",
            error: message,
          }))
          throw err
        })
        .finally(() => {
          inflightRequests.current.storyScripts = null
        })

      inflightRequests.current.storyScripts = request
      return request
    },
    [storyScriptsState.data],
  )

  const loadBlogPosts = useCallback(
    async ({ force = false }: LoadOptions = {}) => {
      if (!force && blogPostsState.data) {
        return blogPostsState.data
      }

      if (!force && inflightRequests.current.blogPosts) {
        return inflightRequests.current.blogPosts
      }

      setBlogPostsState((prev) => ({
        data: force ? null : prev.data,
        status: "loading",
        error: null,
      }))

      const request = fetchBlogPosts()
        .then((data) => {
          setBlogPostsState({
            data,
            status: "success",
            error: null,
          })
          return data
        })
        .catch((err) => {
          const message = createErrorMessage("Não foi possível carregar os posts do blog.", err)
          setBlogPostsState((prev) => ({
            data: prev.data,
            status: "error",
            error: message,
          }))
          throw err
        })
        .finally(() => {
          inflightRequests.current.blogPosts = null
        })

      inflightRequests.current.blogPosts = request
      return request
    },
    [blogPostsState.data],
  )

  const loadLatestCurriculum = useCallback(
    async ({ force = false }: LoadOptions = {}) => {
      if (!force && curriculumState.data) {
        return curriculumState.data
      }

      if (!force && inflightRequests.current.curriculum) {
        return inflightRequests.current.curriculum
      }

      setCurriculumState((prev) => ({
        data: force ? null : prev.data,
        status: "loading",
        error: null,
      }))

      const request = fetchLatestCurriculum()
        .then((data) => {
          setCurriculumState({
            data,
            status: "success",
            error: null,
          })
          return data
        })
        .catch((err) => {
          const message = createErrorMessage("Não foi possível carregar o currículo.", err)
          setCurriculumState((prev) => ({
            data: prev.data,
            status: "error",
            error: message,
          }))
          throw err
        })
        .finally(() => {
          inflightRequests.current.curriculum = null
        })

      inflightRequests.current.curriculum = request
      return request
    },
    [curriculumState.data],
  )

  const value = useMemo<ContentCacheContextValue>(
    () => ({
      artworks: artworksState.data,
      artworksStatus: artworksState.status,
      artworksError: artworksState.error,
      loadArtworks,

      storyScripts: storyScriptsState.data,
      storyScriptsStatus: storyScriptsState.status,
      storyScriptsError: storyScriptsState.error,
      loadStoryScripts,

      blogPosts: blogPostsState.data,
      blogPostsStatus: blogPostsState.status,
      blogPostsError: blogPostsState.error,
      loadBlogPosts,

      latestCurriculum: curriculumState.data,
      curriculumStatus: curriculumState.status,
      curriculumError: curriculumState.error,
      loadLatestCurriculum,
    }),
    [
      artworksState.data,
      artworksState.error,
      artworksState.status,
      blogPostsState.data,
      blogPostsState.error,
      blogPostsState.status,
      curriculumState.data,
      curriculumState.error,
      curriculumState.status,
      loadArtworks,
      loadBlogPosts,
      loadLatestCurriculum,
      loadStoryScripts,
      storyScriptsState.data,
      storyScriptsState.error,
      storyScriptsState.status,
    ],
  )

  return <ContentCacheContext.Provider value={value}>{children}</ContentCacheContext.Provider>
}

export function useContentCache(): ContentCacheContextValue {
  const context = useContext(ContentCacheContext)
  if (!context) {
    throw new Error("useContentCache deve ser usado dentro de ContentCacheProvider")
  }
  return context
}
