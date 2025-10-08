import { Request, Response } from 'express';
export declare class CongeController {
    private service;
    createCongeRequest(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getMyCongeRequests(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getMyCongeRequestById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    cancelCongeRequest(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getCongeBalance(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAllCongeRequests(req: Request, res: Response): Promise<void>;
    getCongeRequestById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    approveCongeRequest(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    rejectCongeRequest(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getCongeRequestsByEmployee(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=CongeController.d.ts.map