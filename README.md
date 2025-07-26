# Proyecto Node.js con Express, Winston y Manejo de Errores

Este proyecto es una API REST construida con **Node.js** y **Express.js**, que implementa un sistema avanzado de **logs y monitoreo** usando **Winston**, junto con **manejo de errores sincronizados y asincrónicos**, además de middleware personalizados.

## Descripción del Proyecto

Este proyecto es una implementación robusta de un sistema de logging y manejo de errores en Express.js, diseñado para proporcionar visibilidad completa sobre el comportamiento de la aplicación y facilitar el debugging y mantenimiento.

## Arquitectura del Sistema

### Componentes Principales

1. **Sistema de Logging**
   - **Winston**: Motor principal de logging que:
     - Maneja logs de diferentes niveles (info, warn, error)
     - Formatea los logs con timestamp y metadata
     - Envía logs a múltiples destinos (consola y archivos)
   - **Morgan**: Middleware para logging HTTP que:
     - Registra todas las peticiones HTTP
     - Captura información de la petición (método, ruta, status)
     - Integra con Winston para centralizar logs
   - **Archivos de Log**:
     - `combined.log`: Logs generales de la aplicación
     - `error.log`: Logs específicos de errores
     - `rejections.log`: Logs de promesas rechazadas

2. **Manejo de Errores**
   - **Middleware Global de Errores**:
     - Captura todos los errores no manejados
     - Formatea la respuesta de error
     - Loguea información detallada del error
   - **Manejo de Errores 404**:
     - Detecta rutas no encontradas
     - Genera respuesta 404 estándar
     - Loguea intentos de acceso a rutas inexistentes
   - **Captura de Excepciones**:
     - Maneja errores no capturados
     - Captura promesas rechazadas
     - Detiene el proceso en caso de errores críticos

### Estructura de Directorios

```
Proyecto-express/
├── app.js              # Archivo principal que:
│   ├── Configura Express
│   ├── Inicializa Winston
│   ├── Configura Morgan
│   ├── Define rutas
│   └── Configura manejo de errores
├── logs/              # Directorio para archivos de log
│   ├── combined.log   # Logs generales
│   ├── error.log      # Logs de errores específicos
│   └── rejections.log # Logs de promesas rechazadas
├── node_modules/      # Dependencias del proyecto
└── package.json       # Configuración del proyecto
```

## Funcionalidades Principales

### Logging

```javascript
// Configuración de Winston
const logger = createLogger({
    level: 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Marca de tiempo precisa
        errors({ stack: true }), // Captura stack traces
        splat(), // Manejo de argumentos variádicos
        json() // Formato estructurado para análisis
    ),
    transports: [
        new Console({ format: combine(colorize(), simple()) }), // Logs en consola con colores
        new File({ filename: 'logs/combined.log' }), // Logs generales
        new File({ filename: 'logs/error.log', level: 'error' }) // Solo errores
    ]
});

// Logging HTTP con Morgan
morgan('dev', {
    stream: {
        write: message => logger.info(message.trim()) // Envía logs HTTP a Winston
    }
});
```

### Manejo de Errores

```javascript
// Middleware de error global
app.use((err, req, res, next) => {
    // Determina el código de estado correcto
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    // Loguea el error con información contextual
    logger.error(`Error ${statusCode} - ${err.message}`, {
        stack: err.stack, // Stack trace completo
        ip: req.ip, // IP del cliente
        userAgent: req.get('user-agent'), // Información del navegador
        url: req.originalUrl, // URL que causó el error
        method: req.method // Método HTTP
    });
    
    // Responde al cliente
    res.status(statusCode).json({
        message: err.message, // Mensaje del error
        stack: process.env.NODE_ENV === 'production' ? null : err.stack // Stack trace en desarrollo
    });
});
```

### Endpoints y su Funcionalidad

1. `GET /` - Ruta principal que:
   - Registra acceso a la página principal
   - No requiere autenticación
   - Es punto de entrada para la API

2. `GET /api/saludo` - Endpoint de ejemplo que:
   - Retorna un mensaje de saludo
   - Muestra el funcionamiento básico de la API
   - Es útil para pruebas iniciales

3. `GET /api/error-sincronico` - Simulación de error sincrónico que:
   - Genera un error de forma controlada
   - Muestra el manejo de errores sincrónicos
   - Es útil para pruebas de manejo de errores

4. `GET /api/error-asincronico` - Simulación de error asincrónico que:
   - Genera un error dentro de una promesa
   - Muestra el manejo de errores asincrónicos
   - Es útil para probar manejo de promesas

5. `404` - Middleware para rutas no encontradas que:
   - Maneja todas las rutas no definidas
   - Genera respuesta 404 estándar
   - Loguea intentos de acceso a rutas inexistentes

## Tecnologías Implementadas y su Función

1. **Express.js**: Framework web para Node.js que:
   - Maneja rutas HTTP
   - Proporciona middleware
   - Gestiona peticiones y respuestas

2. **Winston**: Sistema de logging avanzado que:
   - Maneja múltiples niveles de log
   - Proporciona formato estructurado
   - Soporta múltiples destinos de log

3. **Morgan**: Middleware de logging HTTP que:
   - Registra peticiones HTTP
   - Muestra estadísticas de rendimiento
   - Integra con Winston para centralización

4. **Node.js**: Entorno de ejecución JavaScript que:
   - Ejecuta JavaScript en el servidor
   - Proporciona API de sistema operativo
   - Maneja eventos asincrónicos

## Instalación y Ejecución

1. **Requisitos**:
   - Node.js instalado
   - npm (Node Package Manager)
   - Git para clonar el repositorio

2. **Pasos de Instalación**:
   ```bash
   # Clonar el repositorio
   git clone [URL_DEL_REPOSITORIO]
   
   # Instalar dependencias
   npm install
   
   # Iniciar el servidor
   node app.js
   ```

## Autor

Desarrollado por [Yeraldin Arboleda]

## Licencia

ISC License