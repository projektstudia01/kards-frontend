interface UserData {
    id: string;
    name?: string;
    email: string;
    needsUsernameSetup?: boolean;
}
interface AuthState {
    isLoggedIn: boolean;
    user: UserData | null;
    emailForVerification: string | null;
    code: string | null;
    setAuthState: (user: UserData | null) => void;
    showUsernamePopup: boolean;
    setUsername: (username: string) => void;
    confirmEmail: () => void;
    logout: () => void;
}
export declare const useAuthStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<AuthState>, "setState" | "persist"> & {
    setState(partial: AuthState | Partial<AuthState> | ((state: AuthState) => AuthState | Partial<AuthState>), replace?: false): unknown;
    setState(state: AuthState | ((state: AuthState) => AuthState), replace: true): unknown;
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<AuthState, AuthState, unknown>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: AuthState) => void) => () => void;
        onFinishHydration: (fn: (state: AuthState) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<AuthState, AuthState, unknown>>;
    };
}>;
export {};
//# sourceMappingURL=authStore.d.ts.map