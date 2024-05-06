const express = require('express');
const router = express.Router();
const csvController = require('../controller/csvController');

// Ruta para procesar el CSV
router.get('/procesarcsv', async (req, res) => {
    try {
        await csvController.procesarCSV();
        return res.status(200).send('Proceso CSV iniciado correctamente');
    } catch (error) {
        console.error('Error al procesar el CSV:', error);
        return res.status(500).send('Error al procesar el CSV');
    }
});

module.exports = router;
