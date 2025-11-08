// src/pages/VerifyEmail.tsx
import React, { useEffect, useState } from "react";
// using simple buttons instead of flowbite's Button here
import { useAuthStore } from "../store/authStore";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { resendVerificationCode, verifyEmail } from "../api";

type Props = {
  sessionId: string;
  emailForVerification: string;
  onClose: () => void;
};

const VerifyEmail: React.FC<Props> = ({
  sessionId,
  emailForVerification,
  onClose,
}) => {
  const { t } = useTranslation();
  const { confirmEmail } = useAuthStore();

  const [codeInput, setCodeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(60);
  const [newSessionId, setSessionId] = useState(sessionId);
  const [canResend, setCanResend] = useState(false);

  const handleVerify = async () => {
    setSuccess(null);

    if (!emailForVerification || !newSessionId) {
      toast.error(t("frontendErrors.missing_session"));
      return;
    }

    setLoading(true);
    
    const response = await verifyEmail(
      codeInput,
      emailForVerification,
      newSessionId
    );

    setLoading(false);

    // Jeśli wystąpił błąd, axiosErrorHandler już wyświetlił toast
    if (response.isError) {
      return;
    }

    setSuccess(t("success.verify.email_verified"));

    // Trigger username popup after successful verification
    confirmEmail();
    onClose();
  };

  const handleResendCode = async () => {
    if (!canResend) return;

    setSuccess(null);
    setCanResend(false);
    setCooldownSeconds(60);

    const response = await resendVerificationCode(emailForVerification!);
    
    // Jeśli wystąpił błąd, axiosErrorHandler już wyświetlił toast
    if (response.isError) {
      return;
    }
    
    const { sessionId: newSessionId } = response.data;
    setSessionId(newSessionId);
    toast.success(t("success.verify.code_resent"));
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

  // Cooldown timer effect
  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setTimeout(() => {
        setCooldownSeconds(cooldownSeconds - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [cooldownSeconds]);

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
              onClick={onClose}
              aria-label="Zamknij"
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
              disabled={!canResend}
              className="w-full text-sm rounded-lg py-2 text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {canResend
                ? "Wyślij kod ponownie"
                : `Wyślij kod ponownie (${cooldownSeconds}s)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
