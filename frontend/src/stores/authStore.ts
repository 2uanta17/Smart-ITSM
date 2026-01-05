import type { JwtPayload, User } from "@/features/auth/types/authTypes";
import { getErrorMessage } from "@/lib/utils";
import { jwtDecode } from "jwt-decode";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      login: (token: string) => {
        try {
          const decoded = jwtDecode<JwtPayload>(token);
          const user: User = {
            id: decoded.sub || decoded.id || "",
            email: decoded.email,
            role: decoded.role,
            exp: decoded.exp,
          };
          set({ token, user, isAuthenticated: true });
        } catch (error: unknown) {
          console.error("Invalid token", getErrorMessage(error));
        }
      },
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.user?.exp && state.user.exp < Date.now() / 1000) {
          state.logout();
        }
      },
    }
  )
);
