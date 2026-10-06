import QRCode from 'qrcode';
import { Member, LibraryProfile } from '../types/library';

/**
 * Renders a member ID card onto an HTMLCanvasElement
 * Standard ID-1 size: 5.398 cm x 8.56 cm
 * Canvas dimensions: 640px x 1014px (high resolution 300 DPI equivalent)
 */
export async function renderMemberCardCanvas(
  member: Member,
  profile: LibraryProfile
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  const width = 640;
  const height = 1014;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot get 2d context');

  // 1. Background: Dark Charcoal #121212
  ctx.fillStyle = '#121212';
  ctx.fillRect(0, 0, width, height);

  // 2. Faceted Low-Poly geometric triangles
  const drawPoly = (points: [number, number][], color: string) => {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i][0], points[i][1]);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  };

  drawPoly([[0, 0], [360, 0], [240, 320], [0, 220]], '#1a1a1a');
  drawPoly([[360, 0], [520, 0], [520, 360], [240, 320]], '#181818');
  drawPoly([[0, 220], [240, 320], [160, 620], [0, 540]], '#161616');
  drawPoly([[240, 320], [520, 360], [400, 680], [160, 620]], '#1e1e1e');
  drawPoly([[0, 540], [160, 620], [260, 840], [0, 800]], '#181818');
  drawPoly([[160, 620], [400, 680], [360, 900], [260, 840]], '#141414');
  drawPoly([[400, 680], [520, 360], [520, 780], [360, 900]], '#1c1c1c');
  drawPoly([[0, 800], [260, 840], [160, 1014], [0, 1014]], '#171717');
  drawPoly([[260, 840], [520, 780], [520, 1014], [160, 1014]], '#131313');

  // 3. Right Caramel Brown Stripe (#9E6735)
  const stripeWidth = 124;
  const stripeRight = 36;
  const stripeX = width - stripeRight - stripeWidth;
  const stripeY = 40;
  const stripeHeight = height - 80;

  ctx.fillStyle = '#9E6735';
  ctx.beginPath();
  ctx.roundRect(stripeX, stripeY, stripeWidth, stripeHeight, 10);
  ctx.fill();

  // Vertical text: SDN5 RAMBUTAN / School Name
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 44px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Rotate text to flow vertically downwards
  ctx.translate(stripeX + stripeWidth / 2, stripeY + stripeHeight / 2);
  ctx.rotate(Math.PI / 2);
  ctx.fillText((profile.schoolName || 'SDN5 RAMBUTAN').toUpperCase(), 0, 0);
  ctx.restore();

  // 4. Photo Frame 2x3 (Top Left)
  const photoX = 48;
  const photoY = 40;
  const photoW = 336;
  const photoH = 436;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(photoX, photoY, photoW, photoH);

  if (member.photoUrl) {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = member.photoUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
      ctx.drawImage(img, photoX, photoY, photoW, photoH);
    } catch {
      // fallback text
      ctx.fillStyle = '#1A1A1A';
      ctx.font = 'bold 28px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('FOTO 2 X 3', photoX + photoW / 2, photoY + photoH / 2);
    }
  } else {
    ctx.fillStyle = '#1A1A1A';
    ctx.font = 'bold 28px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FOTO 2 X 3', photoX + photoW / 2, photoY + photoH / 2);
  }

  // 5. Member Name & ID
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 40px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'left';

  // Handle multi-line if name is long
  const rawName = (member.name || '').toUpperCase();
  const nameWords = rawName.split(' ');
  if (nameWords.length >= 2 && rawName.length > 14) {
    const line1 = nameWords.slice(0, Math.ceil(nameWords.length / 2)).join(' ');
    const line2 = nameWords.slice(Math.ceil(nameWords.length / 2)).join(' ');
    ctx.fillText(line1, photoX, 530);
    ctx.fillText(line2, photoX, 580);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 26px monospace';
    ctx.fillText(member.memberCode, photoX, 630);
  } else {
    ctx.fillText(rawName, photoX, 545);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 26px monospace';
    ctx.fillText(member.memberCode, photoX, 595);
  }

  // 6. Hairline Divider
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(photoX, 688);
  ctx.lineTo(width - 48, 688);
  ctx.stroke();

  // 7. Logo (Bottom Left) - Uses uploaded logo if available, otherwise default tree-book logo
  const treeX = photoX;
  const treeY = 724;

  let logoDrawn = false;
  if (profile.logoUrl) {
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      logoImg.src = profile.logoUrl;
      await new Promise((resolve) => {
        logoImg.onload = resolve;
        logoImg.onerror = resolve;
      });
      if (logoImg.width > 0 && logoImg.height > 0) {
        ctx.drawImage(logoImg, treeX + 4, treeY + 6, 70, 70);
        logoDrawn = true;
      }
    } catch {
      // fallback to default
    }
  }

  if (!logoDrawn) {
    // Draw colorful tree circles
    const drawCircle = (cx: number, cy: number, r: number, color: string) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    };
    drawCircle(treeX + 40, treeY + 22, 14, '#22C55E');
    drawCircle(treeX + 24, treeY + 32, 12, '#16A34A');
    drawCircle(treeX + 56, treeY + 32, 12, '#15803D');
    drawCircle(treeX + 40, treeY + 40, 13, '#10B981');
    drawCircle(treeX + 18, treeY + 44, 10, '#84CC16');
    drawCircle(treeX + 62, treeY + 44, 10, '#4ADE80');

    // Book base under tree
    ctx.fillStyle = '#0284C7';
    ctx.beginPath();
    ctx.moveTo(treeX + 40, treeY + 44);
    ctx.lineTo(treeX + 40, treeY + 70);
    ctx.lineTo(treeX + 18, treeY + 74);
    ctx.lineTo(treeX + 18, treeY + 60);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#0369A1';
    ctx.beginPath();
    ctx.moveTo(treeX + 40, treeY + 44);
    ctx.lineTo(treeX + 40, treeY + 70);
    ctx.lineTo(treeX + 62, treeY + 74);
    ctx.lineTo(treeX + 62, treeY + 60);
    ctx.closePath();
    ctx.fill();
  }

  // 8. Library text beside logo
  const textX = treeX + 85;
  ctx.textAlign = 'left';

  ctx.fillStyle = '#1E88E5';
  ctx.font = '900 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('PERPUSTAKAAN', textX, treeY + 30);

  ctx.fillStyle = '#0077B6';
  ctx.font = '900 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillText((profile.libraryName || 'GUDANG ILMU').toUpperCase(), textX, treeY + 54);

  ctx.fillStyle = '#22C55E';
  ctx.font = '900 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText((profile.schoolName || 'SDN5 RAMBUTAN').toUpperCase(), textX, treeY + 76);

  // Bottom tag: KARTU ANGGOTA
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('KARTU ANGGOTA', photoX, 940);

  // 9. QR Code (Bottom Right)
  const qrBoxW = 170;
  const qrBoxH = 170;
  const qrBoxX = width - stripeRight - qrBoxW;
  const qrBoxY = 740;

  // White rounded container
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(qrBoxX, qrBoxY, qrBoxW, qrBoxH, 20);
  ctx.fill();

  // Generate QR Code onto an offscreen canvas
  try {
    const qrPayload = JSON.stringify({
      id: member.memberCode,
      nama: member.name,
      sekolah: profile.schoolName,
    });
    const qrCanvas = document.createElement('canvas');
    await QRCode.toCanvas(qrCanvas, qrPayload, {
      width: qrBoxW - 16,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
    });
    ctx.drawImage(qrCanvas, qrBoxX + 8, qrBoxY + 8, qrBoxW - 16, qrBoxH - 16);
  } catch (err) {
    console.error('QR code canvas error:', err);
  }

  // ID under QR code
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = 'bold 18px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(member.memberCode, qrBoxX + qrBoxW / 2, 940);

  return canvas;
}
