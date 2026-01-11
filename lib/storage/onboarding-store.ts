import type { LocationOnboarding } from "@/lib/mock-data/types"
import type { OnboardingSession } from "@/lib/services/types"
import { isSupabaseConfigured, supabaseRest } from "@/lib/storage/supabase-rest"

/**
 * Demo storage contract.
 * For production, we can implement the same interface using Prisma (MySQL).
 */
export interface OnboardingStore {
  getSession(locationId: string): Promise<OnboardingSession | null>
  upsertSession(session: OnboardingSession): Promise<OnboardingSession>

  getOnboarding(locationId: string): Promise<LocationOnboarding | null>
  upsertOnboarding(
    locationId: string,
    patch: Partial<LocationOnboarding>
  ): Promise<LocationOnboarding>
}

// -----------------------------------------------------------------------------
// In-memory fallback (default)
// -----------------------------------------------------------------------------

class MemoryOnboardingStore implements OnboardingStore {
  private sessions = new Map<string, OnboardingSession>()
  private onboardings = new Map<string, LocationOnboarding>()

  async getSession(locationId: string): Promise<OnboardingSession | null> {
    return this.sessions.get(locationId) ?? null
  }

  async upsertSession(session: OnboardingSession): Promise<OnboardingSession> {
    this.sessions.set(session.locationId, session)
    return session
  }

  async getOnboarding(locationId: string): Promise<LocationOnboarding | null> {
    return this.onboardings.get(locationId) ?? null
  }

  async upsertOnboarding(
    locationId: string,
    patch: Partial<LocationOnboarding>
  ): Promise<LocationOnboarding> {
    const existing = this.onboardings.get(locationId)
    const merged: LocationOnboarding = {
      ...(existing ?? {
        id: `onboarding-${locationId}`,
        locationId,
        status: (patch.status as any) ?? "NOT_STARTED",
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      ...patch,
      locationId,
      updatedAt: new Date(),
    } as LocationOnboarding
    this.onboardings.set(locationId, merged)
    return merged
  }
}

// -----------------------------------------------------------------------------
// Supabase implementation (demo)
// -----------------------------------------------------------------------------

type SupabaseRow<T> = {
  location_id: string
  payload: T
  updated_at: string
}

class SupabaseOnboardingStore implements OnboardingStore {
  private readonly sessionsTable = "demo_onboarding_sessions"
  private readonly onboardingTable = "demo_location_onboarding"

  async getSession(locationId: string): Promise<OnboardingSession | null> {
    const rows = await supabaseRest<SupabaseRow<OnboardingSession>[]>(
      `/rest/v1/${this.sessionsTable}?location_id=eq.${encodeURIComponent(locationId)}&select=location_id,payload,updated_at`,
      { headers: { Accept: "application/json" } }
    )
    return rows?.[0]?.payload ?? null
  }

  async upsertSession(session: OnboardingSession): Promise<OnboardingSession> {
    const rows = await supabaseRest<SupabaseRow<OnboardingSession>[]>(
      `/rest/v1/${this.sessionsTable}?on_conflict=location_id`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=representation",
          Accept: "application/json",
        },
        body: JSON.stringify({
          location_id: session.locationId,
          payload: session,
          updated_at: new Date().toISOString(),
        }),
      }
    )
    return rows?.[0]?.payload ?? session
  }

  async getOnboarding(locationId: string): Promise<LocationOnboarding | null> {
    const rows = await supabaseRest<SupabaseRow<LocationOnboarding>[]>(
      `/rest/v1/${this.onboardingTable}?location_id=eq.${encodeURIComponent(locationId)}&select=location_id,payload,updated_at`,
      { headers: { Accept: "application/json" } }
    )
    return rows?.[0]?.payload ?? null
  }

  async upsertOnboarding(
    locationId: string,
    patch: Partial<LocationOnboarding>
  ): Promise<LocationOnboarding> {
    const existing = await this.getOnboarding(locationId)
    const merged: LocationOnboarding = {
      ...(existing ?? {
        id: `onboarding-${locationId}`,
        locationId,
        status: (patch.status as any) ?? "NOT_STARTED",
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      ...patch,
      locationId,
      updatedAt: new Date(),
    } as LocationOnboarding

    const rows = await supabaseRest<SupabaseRow<LocationOnboarding>[]>(
      `/rest/v1/${this.onboardingTable}?on_conflict=location_id`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=representation",
          Accept: "application/json",
        },
        body: JSON.stringify({
          location_id: locationId,
          payload: merged,
          updated_at: new Date().toISOString(),
        }),
      }
    )

    return rows?.[0]?.payload ?? merged
  }
}

// -----------------------------------------------------------------------------

let singleton: OnboardingStore | null = null

export function getOnboardingStore(): OnboardingStore {
  if (singleton) return singleton
  singleton = isSupabaseConfigured()
    ? new SupabaseOnboardingStore()
    : new MemoryOnboardingStore()
  return singleton
}

