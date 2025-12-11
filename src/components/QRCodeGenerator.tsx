import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { toast } from "sonner";

interface QRCodeGeneratorProps {
  text: string;
  size?: number;
  className?: string;
  alt?: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  text,
  size = 128,
  className = "",
  alt = "QR Code",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateQR = async () => {
      if (!canvasRef.current || !text) return;

      setIsLoading(true);

      try {
        await QRCode.toCanvas(canvasRef.current, text, {
          width: size,
          margin: 2,
          color: {
            dark: "#a8df75ff", // Black modules
            light: "#c55dabff", // White background
          },
          errorCorrectionLevel: "M", // Medium error correction
        });
      } catch (err) {
        console.error("QR Code generation error:", err);

        //TODO: Dorobić klucz
        toast.error("qr_code.generation_failed");
      } finally {
        setIsLoading(false);
      }
    };

    generateQR();
  }, [text, size]);

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
        className={`border rounded ${isLoading ? "opacity-0" : "opacity-100"}`}
        style={{ width: size, height: size }}
        aria-label={alt}
      />
    </div>
  );
};

export default QRCodeGenerator;