const knex = require('knex');
const { logger } = require('./logger');

// Configuración de la base de datos
const dbConfig = {
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
      rejectUnauthorized: false // <--- ESTO ES OBLIGATORIO PARA AIVEN
    },
    charset: 'utf8mb4',
    // Quita la línea de timezone: 'UTC' si te sigue dando el warning que vimos antes
  },
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 100,
  },
  migrations: {
    directory: '../prisma/migrations',
    tableName: 'knex_migrations',
  },
  seeds: {
    directory: '../prisma/seeds',
  },
  debug: process.env.NODE_ENV === 'development',
};

// Crear instancia de Knex
const db = knex(dbConfig);

// Función para conectar a la base de datos
async function connectDatabase() {
  try {
    // Verificar conexión
    await db.raw('SELECT 1');
    logger.info('✅ Conexión a MySQL establecida correctamente');
    
    // Verificar si las tablas existen
    const tables = await db.raw('SHOW TABLES');
    logger.info(`📊 Base de datos contiene ${tables[0].length} tablas`);
    
  } catch (error) {
    logger.error('❌ Error al conectar con la base de datos:', error);
    throw error;
  }
}

// Función para cerrar la conexión
async function closeDatabase() {
  try {
    await db.destroy();
    logger.info('🔌 Conexión a la base de datos cerrada');
  } catch (error) {
    logger.error('Error al cerrar la conexión a la base de datos:', error);
  }
}

// Función para verificar el estado de la conexión
async function checkDatabaseHealth() {
  try {
    await db.raw('SELECT 1');
    return true;
  } catch (error) {
    logger.error('Error en health check de la base de datos:', error);
    return false;
  }
}

module.exports = {
  db,
  connectDatabase,
  closeDatabase,
  checkDatabaseHealth
}; 
