import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import parkingRoutes from './routes/parking.routes'; 
import transactionRoutes from './routes/transaction.routes';
import profileRoutes from './routes/profile.routes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/parkings', parkingRoutes); 

app.use('/api', transactionRoutes); 

app.use('/api/profile', profileRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`[ParkMatch Backend] Servidor corriendo fluidamente en el puerto ${PORT}`);
});

export default app;