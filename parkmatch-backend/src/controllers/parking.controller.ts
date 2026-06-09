import { Request, Response } from 'express';
import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

export const getAvailableParkings = async (req: Request, res: Response): Promise<void> => {
    try {
        // RF-04: Visualización de disponibilidad en tiempo real
        // Solo traemos estacionamientos marcados como disponibles por sus dueños
        const query = `
            SELECT 
                e.id, 
                e.direccion, 
                e.latitud, 
                e.longitud, 
                e.precio_hora, 
                e.descripcion,
                u.nombre as propietario
            FROM Estacionamiento e
            JOIN Usuario u ON e.id_propietario = u.id
            WHERE e.disponibilidad = TRUE
        `;

        const [estacionamientos] = await pool.query<RowDataPacket[]>(query);

        res.status(200).json({
            ok: true,
            data: estacionamientos
        });

    } catch (error) {
        console.error('Error al obtener estacionamientos:', error);
        res.status(500).json({ 
            ok: false, 
            message: 'Error al cargar el mapa de estacionamientos disponibles.' 
        });
    }
};