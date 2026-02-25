const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────
app.use(express.json());

// ─── Función principal de consulta ───────────────────────────
async function consultarDNI(dni) {
  const { default: fetch } = await import('node-fetch');

  const body = new URLSearchParams({
    dni: dni,
    action: 'consulta_dni_api',
    tipo: 'dni',
    pagina: '1'
  });

  const response = await fetch('https://buscardniperu.com/wp-admin/admin-ajax.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Origin': 'https://buscardniperu.com',
      'Referer': 'https://buscardniperu.com/',
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'Accept-Language': 'es-PE,es;q=0.9',
      'X-Requested-With': 'XMLHttpRequest'
    },
    body: body.toString(),
    timeout: 15000
  });

  if (!response.ok) {
    throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

// ─── Formatear respuesta ──────────────────────────────────────
function formatearRespuesta(data) {
  const d = data.data;
  return {
    estado: true,
    mensaje: 'Encontrado',
    resultado: {
      dni: d.dni,
      nombres: d.nombres,
      apellido_paterno: d.ap_pat,
      apellido_materno: d.ap_mat,
      nombre_completo: `${d.nombres} ${d.ap_pat} ${d.ap_mat}`.trim(),
      sexo: d.sexo === '1' ? 'MASCULINO' : 'FEMENINO',
      fecha_nacimiento: d.fecha_nac,
      estado_civil: d.est_civil,
      direccion: d.direccion,
      ubigeo: d.ubigeo_dir,
      madre: d.madre,
      padre: d.padre,
      fecha_inscripcion: d.fch_inscripcion,
      fecha_emision: d.fch_emision,
      fecha_caducidad: d.fch_caducidad,
      digito_ruc: d.dig_ruc
    }
  };
}

// ─── Ruta principal GET /api/sir/:dni ─────────────────────────
app.get('/api/sir/:dni', async (req, res) => {
  const { dni } = req.params;

  // Validación
  if (!dni) {
    return res.status(400).json({
      estado: false,
      mensaje: 'DNI no proporcionado.'
    });
  }

  if (!/^\d{8}$/.test(dni)) {
    return res.status(400).json({
      estado: false,
      mensaje: 'DNI inválido. Debe contener exactamente 8 dígitos numéricos.'
    });
  }

  try {
    const data = await consultarDNI(dni);

    // Respuesta vacía o sin success
    if (!data || data.success === false || !data.data) {
      return res.status(404).json({
        estado: false,
        mensaje: 'DNI no encontrado en la base de datos.'
      });
    }

    return res.status(200).json(formatearRespuesta(data));

  } catch (error) {
    // Timeout
    if (error.type === 'request-timeout' || error.message.includes('timeout')) {
      return res.status(504).json({
        estado: false,
        mensaje: 'Tiempo de espera agotado. Intente nuevamente.'
      });
    }

    // Error de red
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        estado: false,
        mensaje: 'No se pudo conectar al servidor de consulta. Intente más tarde.'
      });
    }

    // Error de JSON inválido
    if (error instanceof SyntaxError) {
      return res.status(502).json({
        estado: false,
        mensaje: 'Respuesta inválida del servidor externo.'
      });
    }

    // Error genérico
    console.error('[ERROR]', error.message);
    return res.status(500).json({
      estado: false,
      mensaje: 'Error interno del servidor.',
      detalle: error.message
    });
  }
});

// ─── Ruta raíz (health check) ─────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    estado: true,
    mensaje: 'API RENIEC activa',
    uso: '/api/sir/{8_digitos}'
  });
});

// ─── Ruta no encontrada ───────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    estado: false,
    mensaje: 'Ruta no encontrada. Uso correcto: /api/sir/{dni}'
  });
});

// ─── Iniciar servidor ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
