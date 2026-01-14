import React, { useState } from 'react';
import QRCodeGenerator from './QRCodeGenerator';
import { generateQRCodeDataURL, generateInviteQRCode } from '../utils/qrcode';

const QRCodeDemo: React.FC = () => {
  const [customText, setCustomText] = useState('https://github.com/projektstudia01/kards-frontend');
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);

  const handleGenerateQR = async () => {
    try {
      const dataURL = await generateQRCodeDataURL(customText, 200);
      setGeneratedQR(dataURL);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }
  };

  const handleGenerateInviteQR = async () => {
    try {
      const mockToken = 'invite-' + Math.random().toString(36).substr(2, 9);
      const dataURL = await generateInviteQRCode(mockToken, 200);
      setGeneratedQR(dataURL);
    } catch (error) {
      console.error('Failed to generate invite QR code:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">QR Code Generator Demo</h2>
        <p className="text-muted-foreground">
          Test the QR code functionality for lobby invitations
        </p>
      </div>

      {/* Live QR Code Component */}
      <div className="bg-card p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Live QR Code Component</h3>
        <div className="flex flex-col items-center space-y-4">
          <QRCodeGenerator 
            text={customText}
            size={150}
            className="border rounded-lg p-2"
          />
          <div className="w-full max-w-md">
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              placeholder="Enter text or URL"
            />
          </div>
        </div>
      </div>

      {/* Generated QR Codes */}
      <div className="bg-card p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Generated QR Codes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center">
            <button
              onClick={handleGenerateQR}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors mb-4 cursor-pointer"
            >
              Generate Custom QR
            </button>
          </div>
          <div className="text-center">
            <button
              onClick={handleGenerateInviteQR}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors mb-4 cursor-pointer"
            >
              Generate Invite QR
            </button>
          </div>
        </div>

        {generatedQR && (
          <div className="text-center mt-6">
            <img 
              src={generatedQR} 
              alt="Generated QR Code" 
              className="mx-auto border rounded-lg"
            />
            <p className="text-sm text-muted-foreground mt-2">Generated QR Code</p>
          </div>
        )}
      </div>

      {/* Usage Examples */}
      <div className="bg-card p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Usage Examples</h3>
        <div className="space-y-4 text-sm">
          <div>
            <strong>In Lobby Component:</strong>
            <pre className="bg-muted p-2 rounded mt-1 overflow-x-auto">
{`<QRCodeGenerator 
  text={inviteLink}
  size={128}
  className="mx-auto"
/>`}
            </pre>
          </div>
          <div>
            <strong>Generate Data URL:</strong>
            <pre className="bg-muted p-2 rounded mt-1 overflow-x-auto">
{`const qrDataURL = await generateQRCodeDataURL(text, 200);`}
            </pre>
          </div>
          <div>
            <strong>Generate Invite QR:</strong>
            <pre className="bg-muted p-2 rounded mt-1 overflow-x-auto">
{`const inviteQR = await generateInviteQRCode(token, 200);`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeDemo;