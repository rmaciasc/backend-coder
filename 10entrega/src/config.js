module.exports = {
  sqlite3: {
    client: 'sqlite3',
    connection: {
      filename: `${__dirname}\\DB\\ecommerce.sqlite`,
    },
    useNullAsDefault: true,
  },
  mariaDb: {
    client: 'mysql',
    connection: {
      host: 'localhost',
      user: 'root',
      // password: 'coderhouse',
      database: 'coderhouse',
      port: 3306,
    },
  },
  TIEMPO_EXPIRACION: 60000,
  URL_BASE_DE_DATOS:
    'mongodb+srv://rmacias:LXkNcbolg0BPR1Ne@cluster0.se8cs.mongodb.net/?retryWrites=true&w=majority',
};
