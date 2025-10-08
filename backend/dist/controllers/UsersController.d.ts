import { Request, Response } from "express";
export declare class UsersController {
    createUser(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    createEntreprise(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getEntreprises(req: Request, res: Response): Promise<void>;
    login(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAdminsAndCaissiers(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getUsersByEntreprise(req: Request, res: Response): Promise<void>;
    initEntrepriseData(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    impersonateEntreprise(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getEntreprisePersonnel(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getGlobalStats(req: Request, res: Response): Promise<void>;
    changeUserRole(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=UsersController.d.ts.map