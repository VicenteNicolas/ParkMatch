import { Request, Response } from 'express';
import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { AuthRequest } from '../middlewares/auth.middleware';

export const processPayment = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id_reserva, metodo_pago } = req.body;
    const id_conductor = req.user?.id;

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Validar que la reserva existe, pertenece al usuario y está Pendiente
        const [reservas] = await connection.query<RowDataPacket[]>(
            `SELECT monto_total FROM Reserva WHERE id = ? AND id_conductor = ? AND estado = 'Pendiente'`,
            [id_reserva, id_conductor]
        );

        if (reservas.length === 0) {
            res.status(404).json({ ok: false, message: 'Reserva no encontrada o ya procesada.' });
            return;
        }

        const monto = reservas[0].monto_total;

        // Registrar el pago
        await connection.query<ResultSetHeader>(
            `INSERT INTO Pago (id_reserva, metodo_pago, monto, estado_pago) VALUES (?, ?, ?, 'Aprobado')`,
            [id_reserva, metodo_pago, monto]
        );

        // Confirmar la reserva (RF-06)
        await connection.query<ResultSetHeader>(
            `UPDATE Reserva SET estado = 'Confirmada' WHERE id = ?`,
            [id_reserva]
        );

        await connection.commit();

        res.status(200).json({ ok: true, message: 'Pago procesado exitosamente. Reserva confirmada.' });

    } catch (error) {
        await connection.rollback();
        console.error('Error en el pago:', error);
        res.status(500).json({ ok: false, message: 'Fallo al procesar el pago digital.' });
    } finally {
        connection.release();
    }
};