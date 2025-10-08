"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QRCodeGenerator = void 0;
class QRCodeGenerator {
    static generateQRCodeText(employeeId, employeeName) {
        const qrData = JSON.stringify({
            employeeId,
            name: employeeName,
            type: 'employee_pointage',
            timestamp: Date.now()
        });
        return qrData;
    }
    static validateQRCode(qrData) {
        try {
            const parsed = JSON.parse(qrData);
            if (parsed.type === 'employee_pointage' && parsed.employeeId && parsed.name) {
                return {
                    employeeId: parsed.employeeId,
                    name: parsed.name
                };
            }
            return null;
        }
        catch (error) {
            return null;
        }
    }
}
exports.QRCodeGenerator = QRCodeGenerator;
//# sourceMappingURL=qrCodeGenerator.js.map