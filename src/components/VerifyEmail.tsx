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
  const { emailForVerification, sessionId, setAuthState, setVerificationData, clearVerificationData } = useAuthStore();
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
        setAuthState({ email: emailForVerification });
        // clear verification data and close modal
        clearVerificationData();
        onClose?.();
        navigate("/");
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
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative w-full max-w-md mx-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="mb-1 text-xl font-semibold text-gray-900 dark:text-white">Potwierdź swój adres e-mail</h3>
              <p className="text-sm text-gray-500">Wpisz kod wysłany na <strong>{emailForVerification}</strong></p>
            </div>
            <button
              aria-label="Zamknij"
              onClick={() => {
                onClose?.();
              }}
              className="text-gray-500 hover:text-gray-700 ml-4"
            >
              ×
            </button>
          </div>

          {success && <p className="text-green-600 mb-2 text-sm">{success}</p>}

          <input
            type="text"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            placeholder="Wpisz kod weryfikacyjny"
            className="w-full my-4 p-2 border rounded-lg text-center focus:ring-primary focus:border-primary"
          />

          <div className="space-y-3">
            <button
              onClick={handleVerify}
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium rounded-lg py-2.5"
            >
              {loading ? "Sprawdzanie..." : "Potwierdź e-mail"}
            </button>

            <button onClick={handleResendCode} className="w-full text-sm border rounded-lg py-2 text-muted-foreground">
              Wyślij kod ponownie
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
