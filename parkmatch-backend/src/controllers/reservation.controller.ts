import { Request, Response } from 'express';
import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createReservation = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id_estacionamiento, fecha_reserva, hora_inicio, hora_fin, monto_total } = req.body;
    const id_conductor = req.user?.id;

    if (!id_conductor) {
        res.status(401).json({ ok: false, message: 'Usuario no autenticado' });
        return;
    }

    const connection = await pool.getConnection();

    try {
        // Iniciar transacción para asegurar la concurrencia (CP-04)
        await connection.beginTransaction();

        // Verificar disponibilidad bloqueando las filas concurrentes
        const [conflictos] = await connection.query<RowDataPacket[]>(
            `SELECT id FROM Reserva 
             WHERE id_estacionamiento = ? 
             AND fecha_reserva = ? 
             AND estado != 'Cancelada'
             AND (
                 (hora_inicio <= ? AND hora_fin > ?) OR
                 (hora_inicio < ? AND hora_fin >= ?) OR
                 (? <= hora_inicio AND ? >= hora_fin)
             ) FOR UPDATE`,
            [id_estacionamiento, fecha_reserva, hora_inicio, hora_inicio, hora_fin, hora_fin, hora_inicio, hora_fin]
        );

        if (conflictos.length > 0) {
            await connection.rollback();
            res.status(409).json({ 
                ok: false, 
                message: 'Conflicto de disponibilidad: El espacio ya fue reservado en este bloque horario.' 
            });
            return;
        }

        // Insertar la reserva (RF-05)
        const [result] = await connection.query<ResultSetHeader>(
            `INSERT INTO Reserva (id_conductor, id_estacionamiento, fecha_reserva, hora_inicio, hora_fin, monto_total, estado) 
             VALUES (?, ?, ?, ?, ?, ?, 'Pendiente')`,
            [id_conductor, id_estacionamiento, fecha_reserva, hora_inicio, hora_fin, monto_total]
        );

        await connection.commit();

        res.status(201).json({
            ok: true,
            message: 'Reserva pre-confirmada. Proceda al pago.',
            id_reserva: result.insertId
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error al crear reserva:', error);
        res.status(500).json({ ok: false, message: 'Error interno del servidor al procesar la reserva.' });
    } finally {
        connection.release();
    }
};

export const getMyReservations = async (req: AuthRequest, res: Response): Promise<void> => {
    const id_usuario = req.user?.id;
    const rol = req.user?.tipo_usuario;

    try {
        let query = '';
        let params = [id_usuario];

        // RF-09: Historial diferenciado por rol
        if (rol === 'Conductor') {
            query = `SELECT r.*, e.direccion, p.estado_pago 
                     FROM Reserva r 
                     JOIN Estacionamiento e ON r.id_estacionamiento = e.id 
                     LEFT JOIN Pago p ON r.id = p.id_reserva
                     WHERE r.id_conductor = ? ORDER BY r.fecha_reserva DESC`;
        } else if (rol === 'Propietario') {
            query = `SELECT r.*, u.nombre as conductor, u.telefono 
                     FROM Reserva r 
                     JOIN Estacionamiento e ON r.id_estacionamiento = e.id 
                     JOIN Usuario u ON r.id_conductor = u.id
                     WHERE e.id_propietario = ? ORDER BY r.fecha_reserva DESC`;
        }

        const [reservas] = await pool.query<RowDataPacket[]>(query, params);
        res.status(200).json({ ok: true, reservas });

    } catch (error) {
        console.error('Error al obtener reservas:', error);
        res.status(500).json({ ok: false, message: 'Error al recuperar el historial.' });
    }
};

export const cancelReservation = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const id_conductor = req.user?.id;

    try {
        // RF-07: Cancelación de reserva
        const [result] = await pool.query<ResultSetHeader>(
            `UPDATE Reserva SET estado = 'Cancelada' 
             WHERE id = ? AND id_conductor = ? AND estado = 'Pendiente'`,
            [id, id_conductor]
        );

        if (result.affectedRows === 0) {
            res.status(400).json({ ok: false, message: 'No se puede cancelar esta reserva o no te pertenece.' });
            return;
        }

        res.status(200).json({ ok: true, message: 'Reserva cancelada exitosamente.' });
    } catch (error) {
        res.status(500).json({ ok: false, message: 'Error al cancelar la reserva.' });
    }
};