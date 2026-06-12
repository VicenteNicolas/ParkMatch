// Añadimos 'Finalizada' a los estados permitidos
export type EstadoReserva = 'Pendiente' | 'Confirmada' | 'Cancelada' | 'Finalizada';
export type ProfileView   = 'reservas' | 'pagos' | 'favoritos';
export type ReservaTab    = 'proximas' | 'historial';

export interface Perfil {
  id?: number;
  nombre: string;
  email: string;
  rut: string;
  telefono?: string;
  tipo_usuario?: string;
}

export interface Reserva {
  id_reserva: number;
  descripcion: string;
  direccion: string;
  fecha_reserva: string;
  hora_inicio: string;
  hora_fin: string;
  monto_total: number;
  estado: EstadoReserva;
  tipo_estacionamiento?: string;
}

export interface Pago {
  id: number;
  descripcion: string;
  fecha_pago: string;
  metodo_pago: string;
  estado_pago: string;
  monto: number;
}