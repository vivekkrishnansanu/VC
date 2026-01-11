/**
 * Supabase REST (PostgREST) client helper.
 *
 * We intentionally avoid adding new dependencies for demo wiring.
 * Server-side only: uses service role key for write access.
 */
import { createError, ErrorCode } from "@/lib/errors"

export interface SupabaseConfig {
  url: string
  serviceRoleKey: string
}

function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) return null
  return { url, serviceRoleKey }
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseConfig())
}

export async function supabaseRest<T>(
  pathWithQuery: string,
  init?: RequestInit
): Promise<T> {
  const cfg = getSupabaseConfig()
  if (!cfg) {
    throw createError(
      ErrorCode.INTERNAL_ERROR,
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
      500
    )
  }

  const url = `${cfg.url.replace(/\/$/, "")}${pathWithQuery.startsWith("/") ? "" : "/"}${pathWithQuery}`

  const headers = new Headers(init?.headers)
  headers.set("apikey", cfg.serviceRoleKey)
  headers.set("Authorization", `Bearer ${cfg.serviceRoleKey}`)

  const res = await fetch(url, {
    ...init,
    headers,
    cache: "no-store",
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw createError(
      ErrorCode.EXTERNAL_SERVICE_ERROR,
      `Supabase request failed (${res.status}). ${text || ""}`.trim(),
      502
    )
  }

  // Some Supabase endpoints may return empty body; callers can set Accept as needed.
  const contentType = res.headers.get("content-type") || ""
  if (!contentType.includes("application/json")) {
    return (await res.text()) as unknown as T
  }

  return (await res.json()) as T
}

