const pool = require('../config/database'); // Asegúrate de que la ruta coincida con tu archivo de conexión DB

exports.obtenerPerfil = async (req, res) => {
  try {
    // El id viene del token JWT decodificado por tu middleware de autenticación
    const id_conductor = req.user.id; 

    // 1. Consultar datos reales del Usuario (según tabla Usuario)
    const [usuarios] = await pool.query(
      'SELECT id, nombre, email, rut, telefono, tipo_usuario FROM Usuario WHERE id = ?',
      [id_conductor]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ ok: false, message: 'Usuario no encontrado en la base de datos' });
    }

    // 2. Consultar el historial de Reservas con JOIN a Estacionamiento
    // Se extraen los campos exactos definidos en tu diagrama ER
    const [reservas] = await pool.query(
      `SELECT r.id as id_reserva, r.fecha_reserva, r.hora_inicio, r.hora_fin, r.monto_total, r.estado,
              e.direccion, e.descripcion, e.precio_hora
       FROM Reserva r
       JOIN Estacionamiento e ON r.id_estacionamiento = e.id
       WHERE r.id_conductor = ?
       ORDER BY r.fecha_reserva DESC`,
      [id_conductor]
    );

    // 3. Devolver los datos al frontend
    res.status(200).json({ ok: true, perfil: usuarios[0], reservas });

  } catch (error) {
    console.error('Error SQL al obtener el perfil:', error);
    res.status(500).json({ ok: false, message: 'Error interno del servidor' });
  }
};