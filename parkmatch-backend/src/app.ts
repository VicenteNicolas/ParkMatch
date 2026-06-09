import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import parkingRoutes from './routes/parking.routes'; // <-- 1. Agrega esta importación

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Montaje de rutas
app.use('/api/auth', authRoutes);
app.use('/api/parkings', parkingRoutes); // <-- 2. Conecta la ruta aquí

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`[ParkMatch Backend] Servidor corriendo fluidamente en el puerto ${PORT}`);
});

export default app;