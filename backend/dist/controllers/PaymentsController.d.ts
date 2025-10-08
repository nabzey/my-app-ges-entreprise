import { Request, Response } from 'express';
export declare class PaymentsController {
    recordPayment(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getPayments(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    downloadPaymentReceipt(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=PaymentsController.d.ts.map