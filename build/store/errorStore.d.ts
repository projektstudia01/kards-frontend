interface ErrorState {
    messageKey: string | null;
    setError: (key: string | null) => void;
    clearError: () => void;
}
export declare const useErrorStore: import("zustand").UseBoundStore<import("zustand").StoreApi<ErrorState>>;
export {};
//# sourceMappingURL=errorStore.d.ts.map