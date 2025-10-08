import { Request, Response } from 'express';
export declare class PayRunController {
    private service;
    getAll(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    approvePayRun(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    closePayRun(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getByStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getByPeriod(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=PayRunController.d.ts.map