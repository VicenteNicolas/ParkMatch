import { Response } from 'express';
import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    const id_conductor = req.user?.id;
    if (!id_conductor) { res.status(401).json({ ok: false, message: 'No autenticado' }); return; }

    try {
        const [usuarios] = await pool.query<RowDataPacket[]>(
            'SELECT id, nombre, email, rut, telefono, tipo_usuario FROM Usuario WHERE id = ?',
            [id_conductor]
        );

        if (usuarios.length === 0) { res.status(404).json({ ok: false, message: 'Usuario no encontrado' }); return; }

        const [reservas] = await pool.query<RowDataPacket[]>(
            `SELECT r.id as id_reserva, r.fecha_reserva, r.hora_inicio, r.hora_fin, r.monto_total, r.estado,
                    e.direccion, e.descripcion, e.precio_hora
             FROM Reserva r
             JOIN Estacionamiento e ON r.id_estacionamiento = e.id
             WHERE r.id_conductor = ?
             ORDER BY r.fecha_reserva DESC`,
            [id_conductor]
        );

        res.status(200).json({ ok: true, perfil: usuarios[0], reservas });
    } catch (error) {
        res.status(500).json({ ok: false, message: 'Error interno del servidor' });
    }
};

// NUEVO: RF-10 - Actualizar datos del usuario en la BD
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    const id_conductor = req.user?.id;
    const { nombre, email, telefono } = req.body;

    if (!id_conductor) { res.status(401).json({ ok: false, message: 'No autenticado' }); return; }

    try {
        await pool.query<ResultSetHeader>(
            'UPDATE Usuario SET nombre = ?, email = ?, telefono = ? WHERE id = ?',
            [nombre, email, telefono, id_conductor]
        );
        res.status(200).json({ ok: true, message: 'Perfil actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        res.status(500).json({ ok: false, message: 'Error al actualizar los datos' });
    }
};

// NUEVO: RF-09 - Obtener historial de pagos reales
export const getMyPayments = async (req: AuthRequest, res: Response): Promise<void> => {
    const id_conductor = req.user?.id;
    if (!id_conductor) { res.status(401).json({ ok: false, message: 'No autenticado' }); return; }

    try {
        const [pagos] = await pool.query<RowDataPacket[]>(
            `SELECT p.id, p.fecha_pago, p.metodo_pago, p.monto, p.estado_pago,
                    r.fecha_reserva, e.descripcion
             FROM Pago p
             JOIN Reserva r ON p.id_reserva = r.id
             JOIN Estacionamiento e ON r.id_estacionamiento = e.id
             WHERE r.id_conductor = ?
             ORDER BY p.fecha_pago DESC`,
            [id_conductor]
        );
        res.status(200).json({ ok: true, pagos });
    } catch (error) {
        res.status(500).json({ ok: false, message: 'Error al cargar los pagos' });
    }
};