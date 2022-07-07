const knexLib = require('knex');
const config = require('../src/config.js');

//////////////////////////////////////////////////////////////////////////////
class ClienteSql {
  constructor(config, table) {
    this.knex = knexLib(config);
    this.table = table;
  }

  createTableMessages() {
    return this.knex.schema.dropTableIfExists(this.table).finally(() => {
      return this.knex.schema.createTable(this.table, (table) => {
        table.increments('id').primary();
        table.string('mail', 255).notNullable();
        table.string('message', 500).notNullable();
        table.timestamp('date').defaultTo(this.knex.fn.now());
      });
    });
  }

  createTableProducts() {
    return this.knex.schema.dropTableIfExists(this.table).finally(() => {
      return this.knex.schema.createTable(this.table, (table) => {
        table.increments('id').primary();
        table.string('name', 255).notNullable();
        table.float('price').notNullable();
        table.string('photo', 500).notNullable();
      });
    });
  }

  close() {
    this.knex.destroy();
  }
}

prod = new ClienteSql(config.mariaDb, 'productos');
mess = new ClienteSql(config.sqlite3, 'mensajes');

// const crearTablas = async () => {
//   await prod.createTableProducts();
//   await mess.createTableMessages();
//   return 'tablas creadas';
// };

// console.log(crearTablas());

prod
  .createTableProducts()
  .then(console.log('Tabla productos creada'))
  .finally(prod.close());
mess
  .createTableMessages()
  .then(console.log('Tabla mensajes creada'))
  .finally(mess.close());
