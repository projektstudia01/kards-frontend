"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useErrorStore = void 0;
const zustand_1 = require("zustand");
exports.useErrorStore = (0, zustand_1.create)((set) => ({
    messageKey: null,
    setError: (key) => set({ messageKey: key }),
    clearError: () => set({ messageKey: null }),
}));
