//Kod do weryfikacji:84720254
// src/api/customAxios.ts
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

// 🧪 Mock API z logami do outputu
export const customAxios = {
  post: async <T = any>(url: string, body: any): Promise<{ status: number; data: T }> => {
    console.log(`[mockAxios] POST ${url}`, body);

    await new Promise((r) => setTimeout(r, 500)); // symulacja opóźnienia sieci

    switch (url) {
      case "/auth/register": {
        const mockData: RegisterResponse = {
          data: {
            message: "Registration successful",
            userId: "mock-user-id-123",
            sessionId: "mock-session-id-abc",
            code: "84720254",
          },
        };

        console.log("[Output] Rejestracja powiodła się:");
        console.log(`UserID: ${mockData.data.userId}`);
        console.log(`SessionID: ${mockData.data.sessionId}`);
        console.log(`Verification code: ${mockData.data.code}`);

        return { status: 200, data: mockData as T };
      }

      case "/auth/verify-email": {
        if (body.code === "84720254" || body.code === "99999999") {
          const mockData: VerifyResponse = {
            data: {
              message: "Code verified successfully",
              userId: "verified-user-id-xyz",
            },
          };

          console.log("[Output] Weryfikacja e-mail powiodła się:");
          console.log(`UserID: ${mockData.data.userId}`);

          return { status: 200, data: mockData as T };
        } else {
          console.log("[Output] Weryfikacja e-mail NIE powiodła się - zły kod");
          throw {
            response: {
              status: 401,
              data: { message: "Invalid code", key: "invalid_verification_code" },
            },
          };
        }
      }

      case "/auth/resend-verification-code": {
        const mockData: ResendResponse = {
          data: {
            message: "Verification code resent successfully",
            sessionId: "mock-session-new",
            code: "99999999",
          },
        };

        console.log("[Output] Wysłano nowy kod weryfikacyjny:");
        console.log(`New SessionID: ${mockData.data.sessionId}`);
        console.log(`New Code: ${mockData.data.code}`);

        return { status: 200, data: mockData as T };
      }

      default:
        console.log("[Output] Endpoint nie znaleziony:", url);
        throw {
          response: {
            status: 404,
            data: { message: "Endpoint not found", key: "not_found" },
          },
        };
    }
  },
};
