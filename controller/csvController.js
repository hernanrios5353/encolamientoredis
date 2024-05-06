const Queue = require('bull');
const fs = require('fs');
const es = require('event-stream');
const path = require('path');

// Constantes
const REDIS_URL = 'redis://localhost:6379';
const CSV_FILE_PATH = path.join(__dirname, '..', 'data', 'autos.csv');
let autosToyota = [];


// Crear cola
const lineQueue = new Queue('line_queue', REDIS_URL);


// Función para procesar el CSV
const procesarCSV = async () => {
    try {

        // Verificar conexión a Redis
        await new Promise((resolve, reject) => {
            lineQueue.client.ping((error, result) => {
                if (error) {
                    console.error('Error de conexión a Redis:', error);
                    reject(error);
                } else {
                    console.log('Redis está en línea:', result);
                    resolve();
                }
            });
        });

        // Limpiar la cola
        await limpiarCola();

        // Procesar CSV
        lineQueue.process((job, done) => {
            setTimeout(async () => {
                const { data } = job;  // Extraer el dato del trabajo

                F_pushAutoToyota(data); // Agregar el dato a la lista de autos Toyota
                done();
            }, 500);                    // Simular un retraso de 0.5 segundos
        });

        // Manejar el evento cuando un trabajo se completa
        lineQueue.on('completed', async (job) => {
            console.log(`Trabajo completado: ${job.id}`);
            await verificarColaVacia(); // Verificar si la cola está vacía en Redis después de que se completa un trabajo
        });


        // Leer archivo CSV y agregar trabajos a la cola
        const fileStream = fs.createReadStream(CSV_FILE_PATH, "utf-8");
        fileStream.pipe(es.split())
            .on('data', (data) => {
                lineQueue.add({ data }, {
                    attempts: 1
                });
            })
            .on('close', () => {
                console.log('El archivo se ha cerrado correctamente.');
            });

        console.log('Proceso CSV iniciado correctamente');

        return { success: true, message: 'Proceso CSV iniciado correctamente' }; // Devolver respuesta de éxito
    } catch (error) {
        console.error('Error al procesar el CSV:', error);
        return { success: false, message: 'Error al procesar el CSV' }; // Devolver respuesta de error
    }
};

// Función para limpiar la cola
const limpiarCola = () => {
    return new Promise((resolve, reject) => {
        lineQueue.empty()
            .then(() => {
                console.log('Reiniciando la cola');
                resolve();
            })
            .catch((error) => {
                console.error('Error al limpiar la cola:', error);
                reject(error);
            });
    });
};

const F_pushAutoToyota = async (dataObj) => {

    
    try {
        const data = dataObj.data; // Acceder a la propiedad 'data' dentro del objeto
        const marca = data.split(';')[0].trim(); // Obtener el primer elemento de la cadena

        if (marca === 'Toyota') { // Evaluar si la marca es Toyota
            autosToyota.push(marca);
        }

    } catch (error) {
        console.error('Error al procesar el dato:', error);
    }
}

// Función para verificar si la cola está vacía en Redis
const verificarColaVacia = async () => {
    try {
        const counts = await lineQueue.getJobCounts(); // Obtener el recuento de trabajos en la cola
        const pendingJobsCount = counts.waiting + counts.active + counts.delayed; // Calcular el recuento total de trabajos pendientes
        if (pendingJobsCount === 0) {
            console.log('La cola está vacía. Todos los trabajos han sido procesados.');
            console.log('Total de autos marca Toyota :', autosToyota);
            // Aquí puedes realizar cualquier acción adicional que desees cuando la cola esté vacía
        }
    } catch (error) {
        console.error('Error al verificar la cola:', error);
    }
};


module.exports = {
    procesarCSV
};
