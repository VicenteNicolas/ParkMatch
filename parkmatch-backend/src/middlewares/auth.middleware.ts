import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_valparaiso_2026';

export interface AuthRequest extends Request {
    user?: {
        id: number;
        email: string;
        tipo_usuario: 'Conductor' | 'Propietario' | 'Administrador';
    };
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(403).json({ ok: false, message: 'Token de acceso no proporcionado' });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as AuthRequest['user'];
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ ok: false, message: 'Token inválido o expirado' });
    }
};

export const requireRole = (roles: Array<'Conductor' | 'Propietario' | 'Administrador'>) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user || !roles.includes(req.user.tipo_usuario)) {
            res.status(403).json({ 
                ok: false, 
                message: 'Acceso denegado: No posee los permisos requeridos para esta acción' 
            });
            return;
        }
        next();
    };
};