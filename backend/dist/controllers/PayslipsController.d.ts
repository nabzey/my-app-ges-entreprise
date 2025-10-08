import { Request, Response } from 'express';
export declare class PayslipsController {
    getPayslips(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getPayslipsByEmployee(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    downloadPayslipPdf(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    downloadMyPayslipPdf(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getPendingPayslipsCount(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=PayslipsController.d.ts.map