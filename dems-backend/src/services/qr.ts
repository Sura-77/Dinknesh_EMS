import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';

const uploadDir = process.env.UPLOAD_DIR || 'uploads';
const qrDir = path.join(uploadDir, 'qr');

if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir, { recursive: true });

export async function generateQRCode(ticketCode: string): Promise<{ qr_payload: string; qr_image_url: string }> {
  const filename = `${ticketCode}.png`;
  const filepath = path.join(qrDir, filename);

  await QRCode.toFile(filepath, ticketCode, { width: 300, margin: 2 });

  return {
    qr_payload: ticketCode,
    qr_image_url: `/uploads/qr/${filename}`,
  };
}
