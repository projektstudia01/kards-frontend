"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.axiosErrorHandler = exports.customAxios = void 0;
const axios_1 = __importDefault(require("axios"));
const authStore_1 = require("../store/authStore");
const sonner_1 = require("sonner");
const i18n_1 = __importDefault(require("../i18n"));
exports.customAxios = axios_1.default.create({
    baseURL: "https://main-server-dev.1050100.xyz",
    withCredentials: true,
});
const axiosErrorHandler = (error) => {
    var _a, _b, _c, _d, _e, _f;
    console.log('Full error:', error);
    console.log('Error response:', (_a = error.response) === null || _a === void 0 ? void 0 : _a.data);
    console.log('Error status:', (_b = error.response) === null || _b === void 0 ? void 0 : _b.status);
    let translationKey = "backendErrors.internal_server_error";
    if ((_d = (_c = error.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.key)
        translationKey = `backendErrors.${error.response.data.key.toLowerCase()}`;
    sonner_1.toast.error(i18n_1.default.t(translationKey));
    return {
        isError: true,
        key: translationKey,
        errorKey: (_f = (_e = error.response) === null || _e === void 0 ? void 0 : _e.data) === null || _f === void 0 ? void 0 : _f.key,
    };
};
exports.axiosErrorHandler = axiosErrorHandler;
exports.customAxios.interceptors.response.use((response) => response, (error) => {
    var _a;
    if (((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
        const { logout } = authStore_1.useAuthStore.getState();
        logout();
    }
    return Promise.reject(error);
});
