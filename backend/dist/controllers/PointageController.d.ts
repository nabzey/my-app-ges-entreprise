import { Request, Response } from 'express';
export declare class PointageController {
    create(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAll(req: Request, res: Response): Promise<void>;
    getByEmployeeAndDate(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getWorkedHours(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAttendanceSummary(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    update(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    delete(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    createEmployeePointage(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getLastPointageTimeForEmployees(req: Request, res: Response): Promise<void>;
    getAttendance(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    markAbsences(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=PointageController.d.ts.map