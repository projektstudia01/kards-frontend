//Kod do weryfikacji:84720254
//Ponowny kod do weryfikacji: 99999999
//Logowanie: test@g.pl 12345678
import { axiosErrorHandler, customAxios } from "./customAxios";
import { useAuthStore } from "../store/authStore";

//Logowanie: ddd@g.pl 12345678
export interface RegisterResponse {
  data: {
    message: string;
    userId: string;
    sessionId: string;
    code: string;
  };
}

export interface VerifyResponse {
  data: {
    message: string;
    userId: string;
  };
}

export interface ResendResponse {
  data: {
    message: string;
    sessionId: string;
    code: string;
  };
}
export const login = async (email: string, password: string) => {
  try {
    const data = await customAxios.post("/auth/login", { email, password });
    const usernameSet = data.data.data.user.customUsername;
    useAuthStore.getState().setAuthState({
      ...data.data.data.user,
      needsUsernameSetup: usernameSet,
    });

    return data.data.data;
  } catch (error) {
    return axiosErrorHandler(error);
  }
};

export const register = async (email: string, password: string) => {
  try {
    const data = await customAxios.post("/auth/register", { email, password });
    return data.data;
  } catch (error) {
    return axiosErrorHandler(error);
  }
};

export const verifyEmail = async (
  code: string,
  email: string,
  sessionId: string
) => {
  try {
    const result = (
      await customAxios.post("/auth/verify-email", {
        code,
        email,
        sessionId,
      })
    ).data;
    useAuthStore.getState().setAuthState({
      email: result.data.user.email,
      username: result.data.user.name,
      needsUsernameSetup: result.data.user.customUsername,
      id: result.data.user.id,
    });
    return result.data;
  } catch (error) {
    return axiosErrorHandler(error);
  }
};

export const resendVerificationCode = async (email: string) => {
  try {
    const data = await customAxios.post("/auth/resend-verification-code", {
      email,
    });
    return {
      isError: false,
      data: data.data.data,
    };
  } catch (error) {
    return {
      isError: true,
      error: axiosErrorHandler(error),
    };
  }
};
