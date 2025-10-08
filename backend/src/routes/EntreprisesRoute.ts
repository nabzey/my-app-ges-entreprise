import { Router } from 'express';
import { EntreprisesController } from '../controllers/EntreprisesController';

const router = Router();

router.get('/', EntreprisesController.listEntreprises);
router.get('/:id/stats', EntreprisesController.getEntrepriseStats);

export default router;
