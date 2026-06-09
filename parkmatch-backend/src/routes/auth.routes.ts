import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';
import { registerValidationRules, loginValidationRules, validateFields } from '../middlewares/validation.middleware';

const router = Router();

// RF-01: Registro e Inicio de sesión de usuarios [cite: 231]
router.post('/register', registerValidationRules, validateFields, register);
router.post('/login', loginValidationRules, validateFields, login);

export default router;