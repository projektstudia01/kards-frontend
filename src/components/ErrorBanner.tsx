import React from 'react';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { useErrorStore } from '../store/errorStore';

const ErrorBanner: React.FC = () => {
  const { t } = useTranslation();
  const messageKey = useErrorStore((s) => s.messageKey);
  const clearError = useErrorStore((s) => s.clearError);

  if (!messageKey) return null;

  // fallback: try original key, then replace '-' with '_' (API might use different naming), else show key
  const normKey = messageKey.replace(/-/g, '_');
  let text: string;
  if (i18n.exists(messageKey)) {
    text = t(messageKey);
  } else if (i18n.exists(normKey)) {
    text = t(normKey);
  } else {
    // as a last resort, show the key so developer can notice missing translation
    text = messageKey;
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4">
      <div className="bg-red-600 text-white px-4 py-2 rounded shadow flex items-center justify-between">
        <div>{text}</div>
        <button onClick={clearError} className="ml-4 font-bold">✕</button>
      </div>
    </div>
  );
};

export default ErrorBanner;
