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
};
