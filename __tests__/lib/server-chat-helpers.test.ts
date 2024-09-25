import { validateMessageCount } from "../../lib/server/server-chat-helpers"
import { SubscriptionRequiredError } from "@/lib/errors"
import { PLAN_FREE, PLAN_PRO, PLAN_ULTIMATE } from "@/lib/stripe/config"
import {
  FREE_MESSAGE_DAILY_LIMIT,
  PRO_MESSAGE_DAILY_LIMIT,
  PRO_ULTIMATE_MESSAGE_DAILY_LIMIT,
  ULTIMATE_MESSAGE_DAILY_LIMIT,
  CATCHALL_MESSAGE_DAILY_LIMIT
} from "../../lib/subscription"
import { LLMID } from "@/types"
import { Tables } from "@/supabase/types"

// Mock SupabaseClient
const mockSupabaseClient = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  gte: jest.fn()
}

describe("validateMessageCount", () => {
  const date = new Date()
  const freeModel: LLMID = "gpt-4o-mini"
  const proModel: LLMID = "gpt-4o"
  const ultimateModelGrandfathered: LLMID = "claude-3-opus-20240229"
  const ultimateModel: LLMID = "o1-preview"

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("Free user hits error at free limit for free model", async () => {
    mockSupabaseClient.gte.mockResolvedValue({
      count: FREE_MESSAGE_DAILY_LIMIT
    })
    const profile = { plan: PLAN_FREE } as Tables<"profiles">

    await expect(
      validateMessageCount(profile, freeModel, date, mockSupabaseClient as any)
    ).rejects.toThrow(
      `You have reached daily message limit for ${freeModel}. Upgrade to Pro/Ultimate plan to continue or come back tomorrow.`
    )
  })

  test("Premium user hits error at free limit for free model", async () => {
    mockSupabaseClient.gte.mockResolvedValue({
      count: FREE_MESSAGE_DAILY_LIMIT
    })
    const profile = { plan: "premium_monthly" } as Tables<"profiles">

    await expect(
      validateMessageCount(profile, freeModel, date, mockSupabaseClient as any)
    ).rejects.toThrow(
      `You have reached daily message limit for ${freeModel}. Upgrade to Pro/Ultimate plan to continue or come back tomorrow.`
    )
  })

  test("Free user cannot use non-free model", async () => {
    mockSupabaseClient.gte.mockResolvedValue({ count: 0 })
    const profile = { plan: PLAN_FREE } as Tables<"profiles">

    await expect(
      validateMessageCount(profile, proModel, date, mockSupabaseClient as any)
    ).rejects.toThrow("Pro plan required to use this model")
  })

  test("Pro user can use pro model up to limit", async () => {
    mockSupabaseClient.gte.mockResolvedValue({
      count: PRO_MESSAGE_DAILY_LIMIT - 1
    })
    const profile = { plan: `${PLAN_PRO}_monthly` } as Tables<"profiles">

    await expect(
      validateMessageCount(profile, proModel, date, mockSupabaseClient as any)
    ).resolves.not.toThrow()

    mockSupabaseClient.gte.mockResolvedValue({ count: PRO_MESSAGE_DAILY_LIMIT })
    await expect(
      validateMessageCount(profile, proModel, date, mockSupabaseClient as any)
    ).rejects.toThrow(
      `You have reached daily message limit for Pro plan for ${proModel}`
    )
  })

  test("Pro user can use ultimate model with pro limits", async () => {
    mockSupabaseClient.gte.mockResolvedValue({
      count: PRO_ULTIMATE_MESSAGE_DAILY_LIMIT - 1
    })
    const profile = {
      plan: `${PLAN_PRO}_yearly`,
      created_at: "2024-09-17"
    } as Tables<"profiles">

    await expect(
      validateMessageCount(
        profile,
        ultimateModel,
        date,
        mockSupabaseClient as any
      )
    ).resolves.not.toThrow()

    mockSupabaseClient.gte.mockResolvedValue({
      count: PRO_ULTIMATE_MESSAGE_DAILY_LIMIT
    })
    await expect(
      validateMessageCount(
        profile,
        ultimateModel,
        date,
        mockSupabaseClient as any
      )
    ).rejects.toThrow(
      `You have reached daily message limit for Pro plan for ${ultimateModel}. Upgrade to Ultimate plan to continue or come back tomorrow.`
    )
  })

  test("Ultimate user can use ultimate models with ultimate limits", async () => {
    mockSupabaseClient.gte.mockResolvedValue({
      count: ULTIMATE_MESSAGE_DAILY_LIMIT - 1
    })
    const profile = { plan: `${PLAN_ULTIMATE}_monthly` } as Tables<"profiles">

    await expect(
      validateMessageCount(
        profile,
        ultimateModel,
        date,
        mockSupabaseClient as any
      )
    ).resolves.not.toThrow()

    mockSupabaseClient.gte.mockResolvedValue({
      count: ULTIMATE_MESSAGE_DAILY_LIMIT
    })
    await expect(
      validateMessageCount(
        profile,
        ultimateModel,
        date,
        mockSupabaseClient as any
      )
    ).rejects.toThrow(
      `You have reached daily message limit for Ultimate plan for ${ultimateModel}`
    )
  })

  test("Pro and Ultimate users never hit free message limit", async () => {
    mockSupabaseClient.gte.mockResolvedValue({
      count: FREE_MESSAGE_DAILY_LIMIT
    })
    const proProfile = { plan: `${PLAN_PRO}_yearly` } as Tables<"profiles">
    const ultimateProfile = {
      plan: `${PLAN_ULTIMATE}_monthly`
    } as Tables<"profiles">

    await expect(
      validateMessageCount(
        proProfile,
        freeModel,
        date,
        mockSupabaseClient as any
      )
    ).resolves.not.toThrow()
    await expect(
      validateMessageCount(
        ultimateProfile,
        freeModel,
        date,
        mockSupabaseClient as any
      )
    ).resolves.not.toThrow()
  })

  test("All users hit catch-all message limit", async () => {
    mockSupabaseClient.gte.mockResolvedValue({
      count: CATCHALL_MESSAGE_DAILY_LIMIT
    })
    const freeProfile = { plan: PLAN_FREE } as Tables<"profiles">
    const proProfile = { plan: `${PLAN_PRO}_yearly` } as Tables<"profiles">
    const ultimateProfile = {
      plan: `${PLAN_ULTIMATE}_monthly`
    } as Tables<"profiles">

    await expect(
      validateMessageCount(
        freeProfile,
        freeModel,
        date,
        mockSupabaseClient as any
      )
    ).rejects.toThrow(
      `You have reached hard daily message limit for model ${freeModel}`
    )
    await expect(
      validateMessageCount(
        proProfile,
        proModel,
        date,
        mockSupabaseClient as any
      )
    ).rejects.toThrow(
      `You have reached hard daily message limit for model ${proModel}`
    )
    await expect(
      validateMessageCount(
        ultimateProfile,
        ultimateModel,
        date,
        mockSupabaseClient as any
      )
    ).rejects.toThrow(
      `You have reached hard daily message limit for model ${ultimateModel}`
    )
  })

  test("Grandfathered Pro user can use ultimate model with pro limits", async () => {
    mockSupabaseClient.gte.mockResolvedValue({
      count: PRO_ULTIMATE_MESSAGE_DAILY_LIMIT - 1
    })
    const profile = {
      plan: `${PLAN_PRO}_monthly`,
      created_at: "2024-09-15"
    } as Tables<"profiles">

    await expect(
      validateMessageCount(
        profile,
        ultimateModelGrandfathered,
        date,
        mockSupabaseClient as any
      )
    ).resolves.not.toThrow()

    mockSupabaseClient.gte.mockResolvedValue({
      count: PRO_ULTIMATE_MESSAGE_DAILY_LIMIT
    })
    await expect(
      validateMessageCount(
        profile,
        ultimateModelGrandfathered,
        date,
        mockSupabaseClient as any
      )
    ).resolves.not.toThrow()

    mockSupabaseClient.gte.mockResolvedValue({
      count: ULTIMATE_MESSAGE_DAILY_LIMIT
    })
    await expect(
      validateMessageCount(
        profile,
        ultimateModelGrandfathered,
        date,
        mockSupabaseClient as any
      )
    ).rejects.toThrow(
      `You have reached daily message limit for Ultimate plan for ${ultimateModelGrandfathered}`
    )

    //

    mockSupabaseClient.gte.mockResolvedValue({
      count: PRO_ULTIMATE_MESSAGE_DAILY_LIMIT - 1
    })
    await expect(
      validateMessageCount(
        profile,
        ultimateModel,
        date,
        mockSupabaseClient as any
      )
    ).resolves.not.toThrow()

    mockSupabaseClient.gte.mockResolvedValue({
      count: PRO_ULTIMATE_MESSAGE_DAILY_LIMIT
    })
    await expect(
      validateMessageCount(
        profile,
        ultimateModel,
        date,
        mockSupabaseClient as any
      )
    ).rejects.toThrow(
      `You have reached daily message limit for Pro plan for ${ultimateModel}. Upgrade to Ultimate plan to continue or come back tomorrow.`
    )

    mockSupabaseClient.gte.mockResolvedValue({
      count: ULTIMATE_MESSAGE_DAILY_LIMIT
    })
    await expect(
      validateMessageCount(
        profile,
        ultimateModel,
        date,
        mockSupabaseClient as any
      )
    ).rejects.toThrow(
      `You have reached daily message limit for Pro plan for ${ultimateModel}. Upgrade to Ultimate plan to continue or come back tomorrow.`
    )
  })

  test("BYOK users are not limited", async () => {
    const profile = { plan: "byok_pro_yearly" } as Tables<"profiles">

    await expect(
      validateMessageCount(
        profile,
        ultimateModel,
        date,
        mockSupabaseClient as any
      )
    ).resolves.not.toThrow()
  })

  test("Premium user can use free model but not pro or ultimate models", async () => {
    const profile = { plan: "premium_monthly" } as Tables<"profiles">

    mockSupabaseClient.gte.mockResolvedValue({
      count: FREE_MESSAGE_DAILY_LIMIT - 1
    })
    await expect(
      validateMessageCount(profile, freeModel, date, mockSupabaseClient as any)
    ).resolves.not.toThrow()

    await expect(
      validateMessageCount(profile, proModel, date, mockSupabaseClient as any)
    ).rejects.toThrow("Pro plan required to use this model")

    await expect(
      validateMessageCount(
        profile,
        ultimateModel,
        date,
        mockSupabaseClient as any
      )
    ).rejects.toThrow("Ultimate plan required to use this model")
  })

  test("Edge cases for message counts", async () => {
    const profile = { plan: `${PLAN_PRO}_yearly` } as Tables<"profiles">

    mockSupabaseClient.gte.mockResolvedValue({
      count: PRO_MESSAGE_DAILY_LIMIT - 1
    })
    await expect(
      validateMessageCount(profile, proModel, date, mockSupabaseClient as any)
    ).resolves.not.toThrow()

    mockSupabaseClient.gte.mockResolvedValue({ count: PRO_MESSAGE_DAILY_LIMIT })
    await expect(
      validateMessageCount(profile, proModel, date, mockSupabaseClient as any)
    ).rejects.toThrow(
      `You have reached daily message limit for Pro plan for ${proModel}`
    )

    mockSupabaseClient.gte.mockResolvedValue({
      count: PRO_MESSAGE_DAILY_LIMIT + 1
    })
    await expect(
      validateMessageCount(profile, proModel, date, mockSupabaseClient as any)
    ).rejects.toThrow(
      `You have reached daily message limit for Pro plan for ${proModel}`
    )
  })

  test("Handles Supabase client errors", async () => {
    mockSupabaseClient.gte.mockRejectedValue(new Error("Supabase error"))
    const profile = { plan: PLAN_FREE } as Tables<"profiles">

    await expect(
      validateMessageCount(profile, freeModel, date, mockSupabaseClient as any)
    ).rejects.toThrow("Supabase error")
  })
})
