import React, { useState, useEffect, useRef } from 'react';
import { useGameWebSocketStore } from '../store/gameWebSocketStore';
import { useTranslation } from 'react-i18next';

const Chat: React.FC = () => {
  const { messages, ws } = useGameWebSocketStore();
  const { t } = useTranslation();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !ws) return;

    ws.send(JSON.stringify({
      event: 'CHAT_MESSAGE',
      data: { text: inputText }
    }));
    setInputText('');
  };

  return (
    <div className="bg-card border border-border rounded-lg flex flex-col h-[400px]">
      <div className="p-3 border-b border-border font-bold text-card-foreground">
        Chat
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((msg, idx) => (
          <div key={idx} className="text-sm">
            <span className="font-bold text-primary">{msg.senderName}: </span>
            <span className="text-card-foreground break-words">{msg.text}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="p-3 border-t border-border flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t('chat.placeholder', 'Wpisz wiadomość...')}
          className="flex-1 bg-input border border-border rounded px-2 py-1 text-sm text-foreground"
          maxLength={500}
        />
        <button 
          type="submit" 
          className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm font-bold cursor-pointer disabled:opacity-50"
          disabled={!ws}
        >
          Wyślij
        </button>
      </form>
    </div>
  );
};

export default Chat;