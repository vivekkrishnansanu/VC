/**
 * Onboarding Data API (Demo persistence)
 * GET: fetch onboarding answers for a location
 * PATCH: upsert onboarding answers for a location
 */

import { NextRequest, NextResponse } from "next/server"
import { requireLocationAccess } from "@/lib/auth/middleware"
import { getOnboardingStore } from "@/lib/storage"
import { ErrorTracker } from "@/lib/observability/error-tracking"

export async function GET(request: NextRequest) {
  try {
    const locationId = request.nextUrl.searchParams.get("locationId")
    if (!locationId) {
      return NextResponse.json({ error: "locationId is required" }, { status: 400 })
    }

    const authResult = requireLocationAccess(request, locationId)
    if ("error" in authResult) return authResult.error

    const store = getOnboardingStore()
    const onboarding = await store.getOnboarding(locationId)
    return NextResponse.json({ onboarding })
  } catch (error: any) {
    ErrorTracker.trackApiError(error, "/api/onboarding/data", "GET")
    return NextResponse.json(
      { error: error.message || "Failed to load onboarding data" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { locationId, patch } = body as { locationId?: string; patch?: Record<string, any> }

    if (!locationId) {
      return NextResponse.json({ error: "locationId is required" }, { status: 400 })
    }
    if (!patch || typeof patch !== "object") {
      return NextResponse.json({ error: "patch is required" }, { status: 400 })
    }

    const authResult = requireLocationAccess(request, locationId)
    if ("error" in authResult) return authResult.error

    const store = getOnboardingStore()
    const onboarding = await store.upsertOnboarding(locationId, patch as any)
    return NextResponse.json({ onboarding })
  } catch (error: any) {
    ErrorTracker.trackApiError(error, "/api/onboarding/data", "PATCH")
    return NextResponse.json(
      { error: error.message || "Failed to save onboarding data" },
      { status: 500 }
    )
  }
}

