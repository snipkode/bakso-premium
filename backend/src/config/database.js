const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'bakso_db',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  // Fix case sensitivity - use exact table names
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true, // Use exact model name as table name
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
  },
});

module.exports = sequelize;
