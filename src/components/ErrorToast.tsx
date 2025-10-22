import React, { useEffect } from "react";
import { useErrorStore } from "../store/errorStore";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';

const ErrorToast: React.FC = () => {
  // error store uses messageKey (i18n key)
  const messageKey = useErrorStore((s) => s.messageKey);
  const clearError = useErrorStore((s) => s.clearError);
  const { t } = useTranslation();

  // Automatyczne ukrywanie po 4 sekundach
  useEffect(() => {
    if (!messageKey) return;
    const timer = setTimeout(() => clearError(), 4000);
    return () => clearTimeout(timer);
  }, [messageKey, clearError]);

  return (
    <AnimatePresence>
      {messageKey && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-3 z-50"
        >
          {/* translate key with fallback '-'->'_' like ErrorBanner */}
          <span className="font-medium">
            {(() => {
              const normKey = messageKey.replace(/-/g, '_');
              if (i18n.exists(messageKey)) return t(messageKey);
              if (i18n.exists(normKey)) return t(normKey);
              return messageKey;
            })()}
          </span>
          <button
            onClick={clearError}
            className="text-white/80 hover:text-white ml-2 font-bold"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ErrorToast;
