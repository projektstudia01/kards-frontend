import QRCode from "qrcode";

/**
 * Generate QR code as Data URL (base64 image)
 * @param text - Text or URL to encode in QR code
 * @param size - Size of the QR code (default: 200)
 * @returns Promise<string> - Data URL of the QR code image
 */
export const generateQRCodeDataURL = async (
  text: string,
  size: number = 200
): Promise<string> => {
  try {
    const dataURL = await QRCode.toDataURL(text, {
      width: size,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    });
    return dataURL;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw new Error("Failed to generate QR code");
  }
};

/**
 * Generate QR code as SVG string
 * @param text - Text or URL to encode in QR code
 * @param size - Size of the QR code (default: 200)
 * @returns Promise<string> - SVG string of the QR code
 */
export const generateQRCodeSVG = async (
  text: string,
  size: number = 200
): Promise<string> => {
  try {
    const svg = await QRCode.toString(text, {
      type: "svg",
      width: size,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    });
    return svg;
  } catch (error) {
    console.error("Error generating QR code SVG:", error);
    throw new Error("Failed to generate QR code SVG");
  }
};

/**
 * Create a lobby invitation link
 * @param inviteToken - The invitation token
 * @returns string - Complete invitation URL
 */
export const createInviteLink = (inviteToken: string): string => {
  //@ts-ignore
  const baseUrl = window.location.origin;
  return `${baseUrl}/join-lobby?invite=${inviteToken}`;
};

/**
 * Generate QR code for lobby invitation
 * @param inviteToken - The invitation token
 * @param size - Size of the QR code (default: 200)
 * @returns Promise<string> - Data URL of the QR code image
 */
export const generateInviteQRCode = async (
  inviteToken: string,
  size: number = 200
): Promise<string> => {
  const inviteLink = createInviteLink(inviteToken);
  return generateQRCodeDataURL(inviteLink, size);
};
