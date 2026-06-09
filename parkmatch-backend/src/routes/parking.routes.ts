import { Router } from 'express';
import { getAvailableParkings } from '../controllers/parking.controller';


const router = Router();

// Endpoint público o protegido según decidan, idealmente protegido para usuarios registrados
router.get('/available', getAvailableParkings);

export default router;