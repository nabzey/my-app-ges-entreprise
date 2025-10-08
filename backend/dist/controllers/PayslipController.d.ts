import { Request, Response } from 'express';
export declare class PayslipController {
    private service;
    getAll(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    update(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    generateMonthlyPayslips(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    generatePDF(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=PayslipController.d.ts.map