import { Router } from 'express';
import { getProfile, updateProfile, getMyPayments } from '../controllers/profile.controller';
import { verifyToken } from '../middlewares/auth.middleware'; 

const router = Router();

router.get('/', verifyToken, getProfile);
router.put('/', verifyToken, updateProfile); // Ruta para guardar edición de perfil
router.get('/payments', verifyToken, getMyPayments); // Ruta para ver "Mis Pagos"

export default router;