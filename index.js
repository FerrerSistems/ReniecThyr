const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.get('/api/sir/:dni', async (req, res) => {
  const { dni } = req.params;

  if (!/^\d{8}$/.test(dni)) {
    return res.status(400).json({ estado: false, mensaje: 'DNI inválido.' });
  }

  try {
    const response = await fetch('https://buscardniperu.com/wp-admin/admin-ajax.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0',
        'Origin': 'https://buscardniperu.com',
        'Referer': 'https://buscardniperu.com/',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: `dni=${dni}&action=consulta_dni_api&tipo=dni&pagina=1`
    });

    const data = await response.json();

    if (!data.success || !data.data) {
      return res.status(404).json({ estado: false, mensaje: 'DNI no encontrado.' });
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

  } catch (e) {
    return res.status(500).json({ estado: false, mensaje: 'Error: ' + e.message });
  }
});

app.get('/', (req, res) => {
  res.json({ estado: true, mensaje: 'API RENIEC activa', uso: '/api/sir/12345678' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Servidor en puerto ${PORT}`));
