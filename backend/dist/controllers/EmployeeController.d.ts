import { Request, Response } from 'express';
export declare class EmployeeController {
    login(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getDashboard(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getMyPointages(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getMyPayslips(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    downloadMyPayslipPdf(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    create(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAll(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    update(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    delete(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    toggleActif(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    confirmCode(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getQRCode(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=EmployeeController.d.ts.map