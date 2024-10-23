import { createContext, useContext, useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Tables } from "@/supabase/types"
import { Session, User } from "@supabase/supabase-js"
import { useRouter } from "nextjs-toploader/app"

import { supabase } from "@/lib/supabase/browser-client"

// create a context for authentication
const AuthContext = createContext<{
  session: Session | null | undefined
  user: User | null | undefined
  profile: Tables<"profiles"> | null | undefined
  signOut: () => void
}>({ session: null, user: null, profile: null, signOut: () => {} })

interface AuthProviderProps {
  children: React.ReactNode
  forceLogin?: boolean
}

export const AuthProvider = ({
  children,
  forceLogin = false
}: AuthProviderProps) => {
  const [user, setUser] = useState<User>()
  const [profile, setProfile] = useState<Tables<"profiles">>()
  const [session, setSession] = useState<Session | null>()
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const setData = async () => {
      const {
        data: { session },
        error
      } = await supabase.auth.getSession()
      if (error) throw error

      setSession(session)
      setUser(session?.user)

      if (session?.user) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", session?.user?.id as string)
          .single()

        if (profileData) setProfile(profileData)
      } else {
        if (pathname !== "/" && forceLogin)
          router.push("/login?next=" + pathname)
      }
    }

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user)
        setLoading(false)
      }
    )

    setData()

    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [])

  const value = {
    session,
    user,
    profile,
    signOut: () => supabase.auth.signOut()
  }

  // use a provider to pass down the value
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

// export the useAuth hook
export const useAuth = () => {
  return useContext(AuthContext)
}
