// Importacion de librerias necesarias
const express = require("express");
const morgan = require("morgan");
const winston = require("winston");

// Inicializar la APP con express
const app = express();
const PORT = process.env.PORT || 3000;

// 

// Configuracion de wiston - logger
const logger = winston.createLogger({
  // Nivel de LOG por defecto, no mostrara solo (INFO, WARN, ERROR)
  level: "info",
  // Es el formato de los LOGS, y realizamos varios formatos
  format: winston.format.combine(
    winston.format.timestamp({
      // Creamos la marca de tiempo en fecha y hora
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.errors({ stack: true }), // El stack trece para errores
    winston.format.splat(), // Interpolacion de cadenas
    winston.format.json() // Exporta los LOGS en formato JSON para analisis
  ),
  // Donde se guaran los LOGS
  transports: [
    // La consola para ver en la terminal
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // Arregla colores
        winston.format.simple() // Formato simple para la Consola
      ),
    }), 
    // Enviar a un archivo para todos los LOGS en combined.log
    new winston.transports.File({ filename: "logs/combined.log" }),
    // Archivo para el manejo de errores
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
  ],
  // Manejo de excepciones no tomadas o capturadas y promesas rechazadas
  exceptionHandlers: [
    new winston.transports.File({ filename: "logs/rejections.log" }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: "logs/rejections.log" }),
  ],
});

// Utilizar el Middleware, parser en el cuerpo de la solicitud JSON
app.use(express.json());

// Configuracion para Middleware de Logging HTTP.
const morganStream = {
  write: (message) => logger.info(message.trim()),
};

// Usamos Morgan con el formato DEV para desarrolladores
// Y se enlaza con el stream de winston para los LOGS de HTTP
app.use(morgan("dev", { stream: morganStream }));

// Definimos rutas
app.get("/", (req, res) => {
  logger.info("GET / - Solicitud a la ruta raiz (PRINCIPAL)");
});

app.get("/api/saludo", (req, res) => {
  logger.info("GET /api/saludo - Recibiendo solicitud de la ruta saludo");
  res.status(200).json({
    message: "¡ HOLA ! Saludo desde el SERVIDOR 😊",
  });
});

// Ruta para simular un error Sincronico
app.get("/api/error-sincronico", (req, res, next) => {
  logger.warn("GET /api/error-sincronico - Simulacion de un error sincronico");
  try {
    // Intentamos hacer algo que posiblemente fallara
    throw new Error(" ¡UPSS: Algo salio mal de forma sincronica 😡!");
  } catch (error) {
    // Si ocurre un error, lo pasamos al middleware de errores con next()
    next(error);
  }
});

// Ruta para simular un error Asincronico
app.get('/api/error-asincronico', async (req, res, next) => {
  // Registra un mensaje de advertencia en el logger (registrador de eventos)
  logger.warn('GET /api/error-asincronico - Simulacion de un error asincronico');
  try {
    // Crea una nueva promesa que se resuelve o rechaza después de un tiempo determinado (500ms)
    await new Promise((resolve, reject) => {
      // Simula un error asincrónico después de un tiempo determinado
      setTimeout(() => {
        // Rechaza la promesa y lanza un error
        reject(new Error(" ¡UPSS: Algo salio mal de forma asincronica !"));
      }, 500);
    });
    // Si la promesa se resuelve correctamente, devuelve una respuesta JSON
    // (Esto no se debería ver porque se rechaza intencionalmente)
    res.json({
      message: "Esto no se deberia ver"
    });
  } catch (error) {
    // Si se produce un error en el bloque try, se captura en el bloque catch
    // y se pasa al siguiente middleware de errores utilizando la función next()
    next(error);
  }
});

// Middleware para rutas no encontradas 404
app.use((req, res, next) => {
  const error = new Error(`Ruta no encontrada - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Middleware de error: se ejecuta cuando se produce un error en la aplicación
app.use((err, req, res, next) => {
  // Establece el código de estado de la respuesta en 500 (Internal Server Error) si no está establecido
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode); // Establece el código de estado de la respuesta

  // Registra el error en el logger (registrador de eventos)
  logger.error(
  `Error ${statusCode} - ${err.message} - ${req.originalUrl} - ${req.method}`,
  {
    stack: err.stack,
    ip: req.ip,
    userAgent: req.get("user-agent"),
  }
);

  // Devuelve una respuesta JSON con información sobre el error
  res.json({
    message: err.message, // Mensaje del error
    stack: process.env.NODE_ENV === "production" ? null : err.stack, // Pila de llamadas del error (solo en modo desarrollo)
  });
});


// Manejo de excepciones y rechazsos globales
// Captura errpr de programacion no manejado
process.on('uncaughtException', (err) => {
  logger.error('Excepcion no capturada (uncaughtException):', err);
  process.exit(1);
});

// Captura de promesas rechazadas
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promesa rechazada (unhandledRejection):', reason, promise);
  process.exit(1);
});

// Iniciar el servidor
app.listen(PORT, () => {
  logger.info(`Servidor EXPRESS corriendo en el puerto: ${PORT} http://localhost:${PORT}`);
  logger.info(`Probar la API en: http://localhost:${PORT}`);
  logger.info(
    `Pruebe rutas: http://localhost:${PORT}/api/saludo, 
    http://localhost:${PORT}/api/error-sincronico, 
    http://localhost:${PORT}/api/error-asincronico, 
    http://localhost:${PORT}/api/inexistente`
  );
});
