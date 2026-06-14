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
        let params = [id_usuario];
        let estacionamientos: any[] = [];

        // Lógica diferenciada por tipo de usuario
        if (perfil.tipo_usuario === 'Propietario') {
            // Trae las reservas hechas a SUS estacionamientos
            reservasQuery = `
                SELECT r.id as id_reserva, r.fecha_reserva, r.hora_inicio, r.hora_fin, r.monto_total, r.estado,
                       e.direccion, e.descripcion, e.precio_hora,
                       u.nombre as conductor_nombre, u.telefono as conductor_telefono
                FROM Reserva r
                JOIN Estacionamiento e ON r.id_estacionamiento = e.id
                JOIN Usuario u ON r.id_conductor = u.id
                WHERE e.id_propietario = ?
                ORDER BY r.fecha_reserva DESC`;

            // Novedad: Trae los estacionamientos que tiene publicados
            const [estacionamientosData] = await pool.query<RowDataPacket[]>(
                `SELECT id, direccion, latitud, longitud, precio_hora, descripcion, disponibilidad
                 FROM Estacionamiento
                 WHERE id_propietario = ?`,
                [id_usuario]
            );
            estacionamientos = estacionamientosData;
        } else {
            // Trae las reservas que él hizo como Conductor
            reservasQuery = `
                SELECT r.id as id_reserva, r.fecha_reserva, r.hora_inicio, r.hora_fin, r.monto_total, r.estado,
                       e.direccion, e.descripcion, e.precio_hora
                FROM Reserva r
                JOIN Estacionamiento e ON r.id_estacionamiento = e.id
                WHERE r.id_conductor = ?
                ORDER BY r.fecha_reserva DESC`;
        }

        const [reservas] = await pool.query<RowDataPacket[]>(reservasQuery, params);
        res.status(200).json({ ok: true, perfil, reservas, estacionamientos });
    } catch (error) {
        console.error('Error en getProfile:', error);
        res.status(500).json({ ok: false, message: 'Error interno del servidor' });
    }
};

// Función restaurada
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

// Función restaurada
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
        console.error('Error al responder reserva:', error);
        res.status(500).json({ ok: false, message: 'Error al actualizar reserva' });
    }
};