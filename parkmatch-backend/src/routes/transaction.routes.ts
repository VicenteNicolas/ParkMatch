import { Router } from 'express';
import { createReservation, getMyReservations, cancelReservation } from '../controllers/reservation.controller';
import { processPayment } from '../controllers/payment.controller';
import { verifyToken, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// Protegemos todas las rutas con JWT
router.use(verifyToken);

// Rutas de Reservas
router.post('/reservations', requireRole(['Conductor']), createReservation);
router.get('/reservations', requireRole(['Conductor', 'Propietario']), getMyReservations);
router.put('/reservations/:id/cancel', requireRole(['Conductor']), cancelReservation);

// Rutas de Pagos
router.post('/payments', requireRole(['Conductor']), processPayment);

export default router;