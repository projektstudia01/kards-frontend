import axios from "axios";
import { useAuthStore } from "../store/authStore";
import { toast } from "sonner";
import i18n from "i18next";
export const customAxios = axios.create({
  baseURL: "https://main-server-dev.1050100.xyz",
  withCredentials: true,
});

export const axiosErrorHandler = (error: any) => {
  console.log(error);
  let translationKey = "errors.internal_server_error";
  if (error.response?.data?.key)
    translationKey = `errors.${error.response.data.key.toLowerCase()}`;
  toast.error(i18n.t(translationKey));
  return {
    isError: true,
    key: translationKey,
    errorKey: error.response?.data?.key,
  };
};

customAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const { isLoggedIn, logout } = useAuthStore.getState();

      logout();
    }
    return Promise.reject(error);
  }
);
