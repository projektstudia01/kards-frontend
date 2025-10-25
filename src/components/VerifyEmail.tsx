// src/pages/VerifyEmail.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// using simple buttons instead of flowbite's Button here
import { useAuthStore } from "../store/authStore";
import { useErrorStore } from "../store/errorStore";
import { customAxios } from "../api/customAxios";

type Props = {
  onClose?: () => void;
};

const VerifyEmail: React.FC<Props> = ({ onClose }) => {
  const navigate = useNavigate();
  const { emailForVerification, sessionId, setAuthState, setVerificationData } = useAuthStore();
  const setError = useErrorStore((s) => s.setError);
  const clearError = useErrorStore((s) => s.clearError);

  const [codeInput, setCodeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleVerify = async () => {
    clearError();
    setSuccess(null);

    if (!emailForVerification || !sessionId) {
      setError("errors.verify.missing_session");
      return;
    }

    try {
      setLoading(true);
      const res = await customAxios.post("/auth/verify-email", {
        email: emailForVerification,
        sessionId,
        code: codeInput,
      });

      if (res.status === 200) {
        setSuccess("E-mail został zweryfikowany!");
        // Simulate login flow after email verification
        setAuthState({
          email: emailForVerification,
          username: undefined, // Ensure username is undefined
          emailConfirmed: true,
          needsUsernameSetup: true,
        });
        navigate('/welcome');
      }
    } catch (err: any) {
      if (err.response) {
        const { key } = err.response.data;
        setError(`errors.verify.${key || "unknown_error"}`);
      } else {
        setError("errors.network_error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    clearError();
    setSuccess(null);

    try {
      const res = await customAxios.post("/auth/resend-verification-code", {
        email: emailForVerification,
      });

      const { sessionId: newSessionId, code: newCode } = res.data.data;
      setVerificationData({
        email: emailForVerification!,
        sessionId: newSessionId,
        code: newCode,
      });
      setSuccess("Nowy kod został wysłany na adres e-mail.");
    } catch (err: any) {
      if (err.response) {
        const { key } = err.response.data;
        setError(`errors.verify.${key || "unknown_error"}`);
      } else {
        setError("errors.network_error");
      }
    }
  };

  useEffect(() => {
    // pomocnicze logi do debugowania — czy w store są dane weryfikacyjne
    // eslint-disable-next-line no-console
    console.log("VerifyEmail mounted. emailForVerification:", emailForVerification, "sessionId:", sessionId, "code:", useAuthStore.getState().code);
  }, [emailForVerification, sessionId]);

  // Overlay + white rounded card for modal content
  return (
    <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50">
      <div className="relative w-full max-w-md mx-4">
        <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="mb-1 text-xl font-semibold text-card-foreground">Potwierdź swój adres e-mail</h3>
              <p className="text-sm text-muted-foreground">Wpisz kod wysłany na <strong>{emailForVerification}</strong></p>
            </div>
            <button
              aria-label="Zamknij"
              onClick={() => {
                onClose?.();
              }}
              className="text-muted-foreground hover:text-card-foreground ml-4"
            >
              ×
            </button>
          </div>

          {success && <p className="text-green-600 dark:text-green-400 mb-2 text-sm">{success}</p>}

          <input
            type="text"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            placeholder="Wpisz kod weryfikacyjny"
            className="w-full my-4 p-2 rounded-lg text-center bg-input text-card-foreground border border-gray-700 focus:ring-0 focus:border-gray-700"
          />

          <div className="space-y-3">
            <button
              onClick={handleVerify}
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg py-2.5"
            >
              {loading ? "Sprawdzanie..." : "Potwierdź e-mail"}
            </button>

            <button onClick={handleResendCode} className="w-full text-sm rounded-lg py-2 text-muted-foreground">
              Wyślij kod ponownie
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
