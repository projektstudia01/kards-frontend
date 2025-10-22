// src/pages/VerifyEmail.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button } from "flowbite-react";
import { useAuthStore } from "../store/authStore";
import { customAxios } from "../api/customAxios";

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const { emailForVerification, sessionId, setAuthState, setVerificationData } = useAuthStore();

  const [codeInput, setCodeInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setError(null);
    setSuccess(null);

    if (!emailForVerification || !sessionId) {
      setError("Brak danych sesji – wróć do rejestracji.");
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
        setAuthState({ email: emailForVerification }); // logowanie po weryfikacji
        navigate("/");
      }
    } catch (err: any) {
      if (err.response) {
        const { message, key } = err.response.data;
        if (key === "invalid_verification_code") {
          setError("Nieprawidłowy kod lub sesja wygasła.");
        } else {
          setError(message || "Wystąpił błąd podczas weryfikacji.");
        }
      } else {
        setError("Błąd sieci – spróbuj ponownie.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError(null);
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
      console.log("DEBUG: nowy kod roboczy:", newCode);
    } catch (err: any) {
      if (err.response) {
        const { message, key } = err.response.data;
        if (key === "user_not_found") {
          setError("Nie znaleziono użytkownika.");
        } else if (key === "user_already_verified") {
          setError("Ten adres e-mail jest już zweryfikowany.");
        } else {
          setError(message || "Błąd przy wysyłaniu kodu.");
        }
      } else {
        setError("Błąd sieci – spróbuj ponownie.");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <Modal show={true} size="md" popup={true}>
        <div className="p-6 text-center">
          <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            Potwierdź swój adres e-mail
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Wpisz kod wysłany na <strong>{emailForVerification}</strong>
          </p>

          {error && <p className="text-red-600 mb-2 text-sm">{error}</p>}
          {success && <p className="text-green-600 mb-2 text-sm">{success}</p>}

          <input
            type="text"
            name="code"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            placeholder="Wpisz kod weryfikacyjny"
            className="w-full mb-4 p-2 border rounded-lg text-center focus:ring-primary focus:border-primary"
          />

          <Button
            onClick={handleVerify}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-medium rounded-lg py-2.5 mb-3"
          >
            {loading ? "Sprawdzanie..." : "Potwierdź e-mail"}
          </Button>

          <Button onClick={handleResendCode} color="gray" className="w-full text-sm">
            Wyślij kod ponownie
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default VerifyEmail;
