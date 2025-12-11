/**
 * Generate QR code as Data URL (base64 image)
 * @param text - Text or URL to encode in QR code
 * @param size - Size of the QR code (default: 200)
 * @returns Promise<string> - Data URL of the QR code image
 */
export declare const generateQRCodeDataURL: (text: string, size?: number) => Promise<string>;
/**
 * Generate QR code as SVG string
 * @param text - Text or URL to encode in QR code
 * @param size - Size of the QR code (default: 200)
 * @returns Promise<string> - SVG string of the QR code
 */
export declare const generateQRCodeSVG: (text: string, size?: number) => Promise<string>;
/**
 * Create a lobby invitation link
 * @param inviteToken - The invitation token
 * @returns string - Complete invitation URL
 */
export declare const createInviteLink: (inviteToken: string) => string;
/**
 * Generate QR code for lobby invitation
 * @param inviteToken - The invitation token
 * @param size - Size of the QR code (default: 200)
 * @returns Promise<string> - Data URL of the QR code image
 */
export declare const generateInviteQRCode: (inviteToken: string, size?: number) => Promise<string>;
//# sourceMappingURL=qrcode.d.ts.map