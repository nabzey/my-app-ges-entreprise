import { Request, Response } from 'express';
export declare class PayRunsController {
    generateMonthlyPayRuns(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getPayRuns(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    approvePayRun(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    closePayRun(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=PayRunsController.d.ts.map