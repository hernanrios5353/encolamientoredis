const express = require('express');
const csvRoutes = require('./router/csvRoutes');
const csvController = require('./controller/csvController');

const app = express();

// Rutas
app.use('/csv', csvRoutes); // Si se desea llamar desde el cliente 

// Puerto de escucha
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
  csvController.procesarCSV();
});
