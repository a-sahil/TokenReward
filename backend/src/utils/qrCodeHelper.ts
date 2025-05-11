// backend/src/utils/qrCodeHelper.ts
import QRCode from 'qrcode';

export const generateQRCodeDataURL = async (text: string): Promise<string> => {
  try {
    const qrCodeDataURL: string = await QRCode.toDataURL(text);
    return qrCodeDataURL;
  } catch (err) {
    console.error('Error generating QR code', err);
    throw err;
  }
};