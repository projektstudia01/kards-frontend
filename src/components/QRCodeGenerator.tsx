import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
  text: string;
  size?: number;
  className?: string;
  alt?: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  text,
  size = 128,
  className = '',
  alt = 'QR Code'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateQR = async () => {
      if (!canvasRef.current || !text) return;

      setIsLoading(true);
      setError(null);

      try {
        await QRCode.toCanvas(canvasRef.current, text, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',  // Black modules
            light: '#FFFFFF'  // White background
          },
          errorCorrectionLevel: 'M' // Medium error correction
        });
      } catch (err) {
        console.error('QR Code generation error:', err);
        setError('Nie udało się wygenerować kodu QR');
      } finally {
        setIsLoading(false);
      }
    };

    generateQR();
  }, [text, size]);

  if (error) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 border rounded ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-xs text-gray-500 text-center px-2">
          Błąd QR
        </span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gray-100 border rounded"
          style={{ width: size, height: size }}
        >
          <span className="text-xs text-gray-500">Generowanie...</span>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={`border rounded ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        style={{ width: size, height: size }}
        aria-label={alt}
      />
    </div>
  );
};

export default QRCodeGenerator;