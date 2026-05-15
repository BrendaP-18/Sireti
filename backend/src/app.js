// =========================================
// PAC - PRESENTATION: Entry point del servidor
// =========================================
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas (Presentation Layer)
app.use('/api/auth',        require('./presentation/auth.routes'));
app.use('/api/usuarios',    require('./presentation/usuarios.routes'));
app.use('/api/equipos',     require('./presentation/equipos.routes'));
app.use('/api/soporte',     require('./presentation/soporte.routes'));
app.use('/api/calendario',  require('./presentation/calendario.routes'));
app.use('/api/prestamos',   require('./presentation/prestamos.routes'));
app.use('/api/mensajes',    require('./presentation/mensajes.routes'));
app.use('/api/reportes',    require('./presentation/reportes.routes'));

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', sistema: 'SIRETI', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor SIRETI corriendo en http://localhost:${PORT}`);
});
