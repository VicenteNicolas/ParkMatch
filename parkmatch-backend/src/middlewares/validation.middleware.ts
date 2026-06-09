import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

// Validación limpia de la estructura básica de un RUT chileno (12345678-K o 12.345.678-K)
export const validateRutFormat = (rut: string): boolean => {
    const cleanRut = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
    if (cleanRut.length < 8 || cleanRut.length > 9) return false;
    
    const cuerpo = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1);
    
    if (!/^\d+$/.test(cuerpo)) return false;
    
    let suma = 0;
    let multiplo = 2;
    
    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += multiplo * parseInt(cuerpo.charAt(i));
        multiplo = multiplo < 7 ? multiplo + 1 : 2;
    }
    
    const dvEsperado = 11 - (suma % 11);
    let dvString = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();
    
    return dv === dvString;
};

export const registerValidationRules = [
    body('nombre')
        .trim()
        .notEmpty().withMessage('El nombre es obligatorio')
        .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres'),
    body('email')
        .trim()
        .isEmail().withMessage('Debe ingresar un correo electrónico válido')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('rut')
        .trim()
        .notEmpty().withMessage('El RUT es obligatorio')
        .custom((value) => {
            if (!validateRutFormat(value)) {
                throw new Error('El RUT ingresado no es válido o tiene un formato incorrecto');
            }
            return true;
        }),
    body('telefono')
        .trim()
        .optional()
        .matches(/^\+?56\d{9}$|^9\d{8}$/).withMessage('Formato de teléfono chileno inválido (+569XXXXXXXX o 9XXXXXXXX)'),
    body('tipo_usuario')
        .isIn(['Conductor', 'Propietario', 'Administrador']).withMessage('Tipo de usuario no válido')
];

export const loginValidationRules = [
    body('email').trim().isEmail().withMessage('Ingrese un correo válido'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria')
];

export const validateFields = (req: Request, reqRes: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        reqRes.status(400).json({ ok: false, errors: errors.array() });
        return;
    }
    next();
};