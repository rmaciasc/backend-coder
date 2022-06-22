const knex = require('knex');

class ContenedorSQL {
  constructor(config, tabla) {
    this.knex = knex(config);
    this.tabla = tabla;
  }

  async listar(id) {
    id = parseInt(id);
    const row = await this.knex(this.tabla).where({ id: id });
    // await this.knex.destroy();
    console.log(row);
    if (!row) {
      return { error: 'id no encontrado' };
    } else {
      return row;
    }
  }

  async listarAll() {
    try {
      let rows = await this.knex(this.tabla).select('*');
      // await this.knex.destroy();
      if (rows.length > 0) {
        return rows;
      } else {
        console.log(`${this.tabla} está vacía`);
        return null;
      }
    } catch (error) {
      console.log(`${this.tabla} no fue encontrada. Error: ${error}`);
    }
  }

  async guardar(elem) {
    return await this.knex(this.tabla).insert(elem);
  }

  async actualizar(elem, id) {
    id = parseInt(id);
    return await this.knex(this.tabla).where({ id: id }).update(elem);
  }

  async borrar(id) {
    id = parseInt(id);
    return await this.knex(this.tabla).where({ id: id }).del();
  }

  async borrarAll() {
    return await this.knex(this.tabla).del();
  }

  async desconectar() {
    await this.knex.destroy();
  }
}

module.exports = ContenedorSQL;
