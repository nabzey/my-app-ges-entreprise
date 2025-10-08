import { Request, Response } from 'express';
export declare class EntreprisesController {
    static listEntreprises(req: Request, res: Response): Promise<void>;
    static getEntrepriseStats(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=EntreprisesController.d.ts.map