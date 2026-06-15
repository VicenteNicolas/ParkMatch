// Entidad base reflejando la base de datos
export interface Estacionamiento {
  id: number;
  direccion: string;
  latitud: number;
  longitud: number;
  precio_hora: number;
  descripcion: string;
  disponibilidad?: boolean;
}

// Entidad extendida para la UI (Home, Mapas)
export interface EstacionamientoDetalle extends Estacionamiento {
  nombre?: string;
  tipo?: string;
  rating?: number;
  reviews?: number;
  tiempo?: string;
  distancia?: string;
  imagen?: string;
  isFavorite?: boolean;
}

// Respuesta estandarizada del backend para arrays de datos
export interface ParkingResponse<T = Estacionamiento> {
  ok: boolean;
  message?: string;
  data: T[];
}