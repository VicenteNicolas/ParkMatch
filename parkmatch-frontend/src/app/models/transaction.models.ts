export interface CreateReservationDTO {
  id_estacionamiento: number | null;
  fecha_reserva: string;
  hora_inicio: string;
  hora_fin: string;
  monto_total: number;
}

export interface PaymentRequestDTO {
  id_reserva: number;
  metodo_pago: string;
}

export interface TransactionResponse {
  ok: boolean;
  message: string;
  id_reserva?: number;
}