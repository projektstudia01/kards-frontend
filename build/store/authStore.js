"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAuthStore = void 0;
// src/store/authStore.ts
const zustand_1 = require("zustand");
const middleware_1 = require("zustand/middleware");
exports.useAuthStore = (0, zustand_1.create)()((0, middleware_1.persist)((set) => ({
    isLoggedIn: false,
    user: null,
    emailForVerification: null,
    sessionId: null,
    code: null,
    showUsernamePopup: false,
    setAuthState: (user) => set({
        isLoggedIn: !!user,
        user: user || null,
        showUsernamePopup: (user === null || user === void 0 ? void 0 : user.needsUsernameSetup) || false, // Ensure popup is shown if needed
    }),
    setUsername: (name) => set((state) => ({
        user: state.user
            ? Object.assign(Object.assign({}, state.user), { name, needsUsernameSetup: false }) : null,
        showUsernamePopup: false,
    })),
    confirmEmail: () => set((state) => {
        return {
            user: state.user
                ? Object.assign(Object.assign({}, state.user), { emailConfirmed: true, needsUsernameSetup: true, username: undefined }) : null,
            showUsernamePopup: true, // Ensure popup is triggered
        };
    }),
    logout: () => {
        set({
            isLoggedIn: false,
            user: null,
            emailForVerification: null,
            code: null,
            showUsernamePopup: false,
        });
        localStorage.removeItem("auth-storage"); // Clear persisted auth state
    },
}), {
    name: "auth-storage",
}));
