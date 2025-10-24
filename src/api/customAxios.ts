//Kod do weryfikacji:84720254
//Ponowny kod do weryfikacji: 99999999
//Logowanie: test@g.pl 12345678
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

// 🧪 Mock API z logami do outputu
export const customAxios = {
  post: async <T = any>(url: string, body: any): Promise<{ status: number; data: T }> => {
    console.log(`[mockAxios] POST ${url}`, body);

    await new Promise((r) => setTimeout(r, 500)); // symulacja opóźnienia sieci

    switch (url) {
      case "/auth/register": {
        // Validate registration data
        if (!body.email || !body.password) {
          console.log("[Output] Rejestracja NIE powiodła się - brak danych");
          throw {
            response: {
              status: 400,
              data: { message: "Missing email or password", key: "validation_error" },
            },
          };
        }

        if (body.password.length < 8) {
          console.log("[Output] Rejestracja NIE powiodła się - hasło za krótkie");
          throw {
            response: {
              status: 400,
              data: { message: "Password too short", key: "password_too_short" },
            },
          };
        }

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

      case "/auth/resend-verification-code": {
        resendTriggered = true; // Mark resend as triggered
        allowedCodes = ["99999999"]; // Replace old codes with the new one

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

      case "/auth/verify-email": {
        if (!allowedCodes.includes(body.code)) {
          console.log("[Output] Weryfikacja e-mail NIE powiodła się - zły kod");
          throw {
            response: {
              status: 401,
              data: { message: "Invalid code", key: "invalid_verification_code" },
            },
          };
        }

        const mockData: VerifyResponse = {
          data: {
            message: "Code verified successfully",
            userId: "verified-user-id-xyz",
          },
        };

        console.log("[Output] Weryfikacja e-mail powiodła się:");
        console.log(`UserID: ${mockData.data.userId}`);

        return { status: 200, data: mockData as T };
      }

      case "/auth/login": {
        if (body.email === "ddd@g.pl" && body.password === "12345678") {
          const mockData = {
            data: {
              message: "Login successful",
              userId: "mock-user-id-login",
              username: "existingUser", // Username is already set
            },
          };

          console.log("[Output] Logowanie powiodło się dla użytkownika z nazwą:");
          console.log(`UserID: ${mockData.data.userId}`);

          return { status: 200, data: mockData as T };
        } else if (body.email === "test@g.pl" && body.password === "12345678") {
          const mockData = {
            data: {
              message: "Login successful",
              userId: "mock-user-id-test",
              username: null, // Username is not set
            },
          };

          console.log("[Output] Logowanie powiodło się dla użytkownika bez nazwy:");
          console.log(`UserID: ${mockData.data.userId}`);

          return { status: 200, data: mockData as T };
        } else {
          console.log("[Output] Logowanie NIE powiodło się - błędne dane");
          throw {
            response: {
              status: 401,
              data: { message: "Provided credentials are invalid", key: "WRONG_CREDENTIALS" },
            },
          };
        }
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

// Track whether the resend action has been triggered
let resendTriggered = false;

// Track allowed verification codes
let allowedCodes = ["84720254"];
