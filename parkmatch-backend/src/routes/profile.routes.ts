import { Router } from 'express';
import { getProfile, updateProfile, getMyPayments, responderReserva } from '../controllers/profile.controller';
import { verifyToken } from '../middlewares/auth.middleware'; 

const router = Router();

router.get('/', verifyToken, getProfile);
router.put('/', verifyToken, updateProfile); // Editar perfil
router.get('/payments', verifyToken, getMyPayments); // Ver "Mis Pagos"
router.put('/reservations/:id/respond', verifyToken, responderReserva);

export default router;