import React from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { useErrorStore } from '../store/errorStore';

const ErrorBannerContent: React.FC = () => {
  const { t } = useTranslation();
  const messageKey = useErrorStore((s) => s.messageKey);
  const clearError = useErrorStore((s) => s.clearError);

  if (!messageKey) return null;

  const normKey = messageKey.replace(/-/g, '_');
  let text: string;
  if (i18n.exists(messageKey)) {
    text = t(messageKey);
  } else if (i18n.exists(normKey)) {
    text = t(normKey);
  } else {
    text = messageKey;
  }

  return (
    <div aria-live="assertive" role="alert" className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] w-full max-w-2xl px-4 pointer-events-auto">
      <div className="bg-red-600 text-white px-4 py-2 rounded shadow flex items-center justify-between">
        <div>{text}</div>
        <button onClick={clearError} className="ml-4 font-bold">✕</button>
      </div>
    </div>
  );
};

const ErrorBanner: React.FC = () => {
  // render into document.body so banner always appears above nested stacking contexts
  if (typeof document === 'undefined') return null;

  return ReactDOM.createPortal(<ErrorBannerContent />, document.body);
};

export default ErrorBanner;
