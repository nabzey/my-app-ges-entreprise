import * as QRCode from 'qrcode';

export class QRCodeGenerator {
  static generateQRCodeText(employeeId: number, employeeName: string): string {
    const qrData = JSON.stringify({
      employeeId,
      name: employeeName,
      type: 'employee_pointage',
      timestamp: Date.now()
    });
    return qrData;
  }

  static validateQRCode(qrData: string): { employeeId: number; name: string } | null {
    try {
      const parsed = JSON.parse(qrData);
      if (parsed.type === 'employee_pointage' && parsed.employeeId && parsed.name) {
        return {
          employeeId: parsed.employeeId,
          name: parsed.name
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}