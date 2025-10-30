// src/pages/VerifyEmail.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// using simple buttons instead of flowbite's Button here
import { useAuthStore } from "../store/authStore";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { resendVerificationCode, verifyEmail } from "../api";

type Props = {
  sessionId: string;
  onClose?: () => void;
};

const VerifyEmail: React.FC<Props> = ({ sessionId, onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { emailForVerification, setAuthState, setVerificationData, confirmEmail } =
    useAuthStore();

  const [codeInput, setCodeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleVerify = async () => {
    setSuccess(null);

    if (!emailForVerification || !sessionId) {
      toast.error(t("errors.verify.missing_session"));
      return;
    }

    setLoading(true);
    try {
      const res = await verifyEmail(codeInput, emailForVerification, sessionId);
      if (res.isError) {
        console.log("Debug - Verification error key:", res.key); // Log the error key
        if (res.key === "invalid_verification_code") {
          toast.error(t("errors.verify.invalid_verification_code"));
        } else {
          toast.error(t(`errors.verify.${res.key}`) || t("errors.unknown_error"));
        }
        return;
      }
      setSuccess(t("success.verify.email_verified"));
      
      // Trigger username popup after successful verification
      confirmEmail();
      
      // Close the verification modal
      onClose?.();
    } catch (error) {
      toast.error(t("errors.server_error"));
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setSuccess(null);
    try {
      const res = await resendVerificationCode(emailForVerification!);
      if (res.isError) {
        const errorKey = res.error?.key;
        toast.error(t(`errors.verify.${errorKey}`) || t("errors.unknown_error"));
        return;
      }
      const { sessionId: newSessionId, code: newCode } = res.data;
      setVerificationData({
        email: emailForVerification!,
        sessionId: newSessionId,
        code: newCode,
      });
      toast.success(t("success.verify.code_resent")); // Display success message in toast
    } catch (error) {
      toast.error(t("errors.network_error"));
    }
  };

  useEffect(() => {
    // pomocnicze logi do debugowania — czy w store są dane weryfikacyjne
    // eslint-disable-next-line no-console
    console.log(
      "VerifyEmail mounted. emailForVerification:",
      emailForVerification,
      "sessionId:",
      sessionId,
      "code:",
      useAuthStore.getState().code
    );
  }, [emailForVerification, sessionId]);

  const isCodeValid = codeInput.trim().length >= 6;

  // Overlay + white rounded card for modal content
  return (
    <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50">
      <div className="relative w-full max-w-md mx-4">
        <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="mb-1 text-xl font-semibold text-card-foreground">
                Potwierdź swój adres e-mail
              </h3>
              <p className="text-sm text-muted-foreground">
                Wpisz kod wysłany na <strong>{emailForVerification}</strong>
              </p>
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

          {success && (
            <p className="text-green-600 dark:text-green-400 mb-2 text-sm">
              {success}
            </p>
          )}

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
              disabled={!isCodeValid || loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sprawdzanie..." : "Potwierdź e-mail"}
            </button>

            <button
              onClick={handleResendCode}
              className="w-full text-sm rounded-lg py-2 text-muted-foreground"
            >
              Wyślij kod ponownie
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
