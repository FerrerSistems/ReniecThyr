const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/api/sir/:dni', async (req, res) => {
  const { dni } = req.params;

  if (!/^\d{8}$/.test(dni)) {
    return res.status(400).json({
      estado: false,
      mensaje: 'DNI invalido. Debe contener exactamente 8 digitos numericos.'
    });
  }

  try {
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
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: body.toString()
    });

    const data = await response.json();

    if (!data || data.success === false || !data.data) {
      return res.status(404).json({
        estado: false,
        mensaje: 'DNI no encontrado.'
      });
    }

    const d = data.data;

    return res.json({
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
    });

  } catch (error) {
    return res.status(500).json({
      estado: false,
      mensaje: 'Error interno: ' + error.message
    });
  }
});

app.get('/', (req, res) => {
  res.json({ estado: true, mensaje: 'API RENIEC activa', uso: '/api/sir/12345678' });
});

app.use((req, res) => {
  res.status(404).json({ estado: false, mensaje: 'Ruta no encontrada. Uso: /api/sir/{dni}' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
