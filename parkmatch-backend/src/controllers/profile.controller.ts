import { Response } from 'express';
import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    const id_usuario = req.user?.id;
    if (!id_usuario) { res.status(401).json({ ok: false, message: 'No autenticado' }); return; }

    try {
        const [usuarios] = await pool.query<RowDataPacket[]>(
            'SELECT id, nombre, email, rut, telefono, tipo_usuario FROM Usuario WHERE id = ?',
            [id_usuario]
        );

        if (usuarios.length === 0) { res.status(404).json({ ok: false, message: 'Usuario no encontrado' }); return; }

        const perfil = usuarios[0];
        let reservasQuery = '';
        let params = [];

        if (perfil.tipo_usuario === 'Propietario') {
            reservasQuery = `
                SELECT r.id as id_reserva, r.fecha_reserva, r.hora_inicio, r.hora_fin, r.monto_total, r.estado,
                       e.direccion, e.descripcion, e.precio_hora,
                       u.nombre as conductor_nombre, u.telefono as conductor_telefono
                FROM Reserva r
                JOIN Estacionamiento e ON r.id_estacionamiento = e.id
                JOIN Usuario u ON r.id_conductor = u.id
                WHERE e.id_propietario = ?
                ORDER BY r.fecha_reserva DESC`;
            params = [id_usuario];
        } else {
            reservasQuery = `
                SELECT r.id as id_reserva, r.fecha_reserva, r.hora_inicio, r.hora_fin, r.monto_total, r.estado,
                       e.direccion, e.descripcion, e.precio_hora
                FROM Reserva r
                JOIN Estacionamiento e ON r.id_estacionamiento = e.id
                WHERE r.id_conductor = ?
                ORDER BY r.fecha_reserva DESC`;
            params = [id_usuario];
        }

        const [reservas] = await pool.query<RowDataPacket[]>(reservasQuery, params);
        res.status(200).json({ ok: true, perfil, reservas });
    } catch (error) {
        res.status(500).json({ ok: false, message: 'Error interno del servidor' });
    }
};


export const responderReserva = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { estado } = req.body; // 'Confirmada' o 'Cancelada'
    const id_propietario = req.user?.id;

    try {
        // Valida que la reserva pertenezca a un estacionamiento del propietario
        const [verificacion] = await pool.query<RowDataPacket[]>(
            `SELECT r.id FROM Reserva r
             JOIN Estacionamiento e ON r.id_estacionamiento = e.id
             WHERE r.id = ? AND e.id_propietario = ?`,
            [id, id_propietario]
        );

        if (verificacion.length === 0) {
            res.status(403).json({ ok: false, message: 'No tienes permiso sobre esta reserva' }); return;
        }

        await pool.query(`UPDATE Reserva SET estado = ? WHERE id = ?`, [estado, id]);

        res.status(200).json({ ok: true, message: `Reserva ${estado.toLowerCase()} exitosamente` });
    } catch (error) {
        res.status(500).json({ ok: false, message: 'Error al actualizar reserva' });
    }
};