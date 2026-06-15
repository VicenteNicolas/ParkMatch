export interface User {
  id: number;
  nombre: string;
  email: string;
  rut: string;
  tipo_usuario: 'Conductor' | 'Propietario' | 'Administrador';
}

export interface AuthResponse {
  ok: boolean;
  message: string;
  token?: string;
  user?: User;
  errors?: string[]; 
}

// DTOs: Lo que viaja desde el Frontend hacia el Backend
export interface LoginDTO {
  email: string;
  password?: string; // Opcional en el modelo frontal si se limpia tras el envío
}

export interface RegisterDTO {
  nombre: string;
  rut: string;
  email: string;
  password?: string;
  tipo_usuario: 'Conductor' | 'Propietario';
  telefono?: string;
}