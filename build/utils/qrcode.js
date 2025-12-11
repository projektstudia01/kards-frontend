"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInviteQRCode = exports.createInviteLink = exports.generateQRCodeSVG = exports.generateQRCodeDataURL = void 0;
const qrcode_1 = __importDefault(require("qrcode"));
/**
 * Generate QR code as Data URL (base64 image)
 * @param text - Text or URL to encode in QR code
 * @param size - Size of the QR code (default: 200)
 * @returns Promise<string> - Data URL of the QR code image
 */
const generateQRCodeDataURL = (text_1, ...args_1) => __awaiter(void 0, [text_1, ...args_1], void 0, function* (text, size = 200) {
    try {
        const dataURL = yield qrcode_1.default.toDataURL(text, {
            width: size,
            margin: 2,
            color: {
                dark: "#000000",
                light: "#FFFFFF",
            },
            errorCorrectionLevel: "M",
        });
        return dataURL;
    }
    catch (error) {
        console.error("Error generating QR code:", error);
        throw new Error("Failed to generate QR code");
    }
});
exports.generateQRCodeDataURL = generateQRCodeDataURL;
/**
 * Generate QR code as SVG string
 * @param text - Text or URL to encode in QR code
 * @param size - Size of the QR code (default: 200)
 * @returns Promise<string> - SVG string of the QR code
 */
const generateQRCodeSVG = (text_1, ...args_1) => __awaiter(void 0, [text_1, ...args_1], void 0, function* (text, size = 200) {
    try {
        const svg = yield qrcode_1.default.toString(text, {
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
    }
    catch (error) {
        console.error("Error generating QR code SVG:", error);
        throw new Error("Failed to generate QR code SVG");
    }
});
exports.generateQRCodeSVG = generateQRCodeSVG;
/**
 * Create a lobby invitation link
 * @param inviteToken - The invitation token
 * @returns string - Complete invitation URL
 */
const createInviteLink = (inviteToken) => {
    //@ts-ignore
    const baseUrl = window.location.origin;
    return `${baseUrl}/join-lobby?invite=${inviteToken}`;
};
exports.createInviteLink = createInviteLink;
/**
 * Generate QR code for lobby invitation
 * @param inviteToken - The invitation token
 * @param size - Size of the QR code (default: 200)
 * @returns Promise<string> - Data URL of the QR code image
 */
const generateInviteQRCode = (inviteToken_1, ...args_1) => __awaiter(void 0, [inviteToken_1, ...args_1], void 0, function* (inviteToken, size = 200) {
    const inviteLink = (0, exports.createInviteLink)(inviteToken);
    return (0, exports.generateQRCodeDataURL)(inviteLink, size);
});
exports.generateInviteQRCode = generateInviteQRCode;
