const QRCode = require('qrcode');

// Generate a QR code for a session
exports.generateSessionQR = async (sessionId) => {
  try {
    const data = `${process.env.APP_URL}/attendance/session/${sessionId}`;
    
    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(data);
    
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return null;
  }
};

// Generate a QR code for certificate verification
exports.generateCertificateQR = async (certificateId) => {
  try {
    const data = `${process.env.APP_URL}/certificate/verify/${certificateId}`;
    
    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(data);
    
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating certificate QR code:', error);
    return null;
  }
};