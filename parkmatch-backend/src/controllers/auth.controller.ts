import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_valparaiso_2026';

export const register = async (req: Request, res: Response): Promise<void> => {
    const { nombre, email, password, rut, telefono, tipo_usuario } = req.body;

    try {
        // Verificar duplicados (Email y RUT) [cite: 271]
        const [existingUser] = await pool.query<RowDataPacket[]>(
            'SELECT id FROM Usuario WHERE email = ? OR rut = ?', 
            [email, rut]
        );

        if (existingUser.length > 0) {
            res.status(400).json({ 
                ok: false, 
                message: 'El correo electrónico o el RUT ya se encuentran registrados en la plataforma' 
            });
            return;
        }

        // Cifrado de contraseña robusto con bcrypt (RNF-02) 
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Inserción limpia en la base de datos [cite: 269]
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO Usuario (nombre, email, password, rut, telefono, tipo_usuario) VALUES (?, ?, ?, ?, ?, ?)',
            [nombre, email, hashedPassword, rut, telefono || null, tipo_usuario]
        );

        // Generación del token JWT para inicio de sesión inmediato tras registro exitoso
        const token = jwt.sign(
            { id: result.insertId, email, tipo_usuario },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.status(201).json({
            ok: true,
            message: 'Usuario registrado exitosamente',
            token,
            user: { id: result.insertId, nombre, email, rut, tipo_usuario }
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ ok: false, message: 'Error interno del servidor al procesar el registro' });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    try {
        // Buscar el usuario por email
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM Usuario WHERE email = ?', 
            [email]
        );

        if (rows.length === 0) {
            res.status(401).json({ ok: false, message: 'Credenciales inválidas (usuario o contraseña incorrectos)' });
            return;
        }

        const user = rows[0];

        // Validar contraseña hash
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            res.status(401).json({ ok: false, message: 'Credenciales inválidas (usuario o contraseña incorrectos)' });
            return;
        }

        // Generar JWT incluyendo el rol (RNF-03) 
        const token = jwt.sign(
            { id: user.id, email: user.email, tipo_usuario: user.tipo_usuario },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.status(200).json({
            ok: true,
            token,
            user: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                rut: user.rut,
                tipo_usuario: user.tipo_usuario
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ ok: false, message: 'Error interno del servidor al procesar el ingreso' });
    }
};