import React, { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { setNickname } from "../api";
import { toast } from "sonner";

const UsernamePopup: React.FC = () => {
  const { setUsername, showUsernamePopup } = useAuthStore();
  const [username, setUsernameInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userName = username.trim();
    
    // Client-side validation
    if (userName.length < 3) {
      toast.error("Nazwa musi mieć co najmniej 3 znaki");
      return;
    }
    
    if (userName.length > 20) {
      toast.error("Nazwa może mieć maksymalnie 20 znaków");
      return;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(userName)) {
      toast.error("Nazwa może zawierać tylko litery, cyfry i podkreślenia");
      return;
    }

    setIsSubmitting(true);

    const response = await setNickname(userName);

    if (response.isError) {
      toast.error("Nie udało się ustawić nazwy użytkownika");
      setIsSubmitting(false);
      return;
    }

    setUsername(userName);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    setUsername(`Guest${randomSuffix}`);
  };

  const isUsernameValid = username.trim().length >= 3;

  if (!showUsernamePopup) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg p-8 max-w-md w-full border border-border shadow-xl relative">
        <button
          aria-label="Zamknij"
          onClick={handleClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-card-foreground text-2xl leading-none"
        >
          ×
        </button>

        <h2 className="text-2xl font-bold text-card-foreground text-center mb-6">
          Wybierz swoją nazwę użytkownika
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block mb-2 text-sm font-medium text-card-foreground"
            >
              Nazwa użytkownika
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="MojaUnikalnaNazwa"
              minLength={3}
              maxLength={20}
              autoComplete="off"
              autoFocus
              className="bg-input border border-border text-card-foreground text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
            />
            <p className="text-xs text-muted-foreground mt-1">
              3-20 znaków, tylko litery, cyfry i podkreślenia
            </p>
          </div>

          <button
            type="submit"
            disabled={!isUsernameValid || isSubmitting}
            className="w-full text-primary-foreground bg-primary hover:bg-primary/90 focus:ring-4 focus:outline-none focus:ring-primary/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Zapisuję..." : "Potwierdź nazwę"}
          </button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Nazwa użytkownika będzie widoczna dla innych graczy
        </p>
      </div>
    </div>
  );
};

export default UsernamePopup;
