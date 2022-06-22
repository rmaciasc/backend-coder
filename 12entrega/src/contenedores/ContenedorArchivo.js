const fs = require('fs');

class ContenedorArchivo {
  constructor(ruta) {
    this.filename = ruta;
  }

  async listar(id) {
    let content = [];
    let foundObject = {};
    try {
      content = await fs.promises.readFile(this.filename, 'utf-8');
      if (content.length > 0) {
        content = JSON.parse(content);
        foundObject = await content.find((x) => x.id === id);
      } else {
        console.log(`${this.filename} está vacío`);
        return null;
      }
    } catch (error) {
      console.log(`${this.filename} no fue encontrado. Error: ${error}`);
    }
    return foundObject;
  }

  async listarAll() {
    let content = [];
    try {
      content = await fs.promises.readFile(this.filename, 'utf-8');
      if (content.length > 0) {
        content = JSON.parse(content);
      } else {
        console.log(`${this.filename} está vacío`);
        return null;
      }
    } catch (error) {
      console.log(`${this.filename} no fue encontrado. Error: ${error}`);
    }
    return content;
  }

  async guardar(obj) {
    let content = [];
    try {
      // try to read content
      content = await fs.promises.readFile(this.filename, 'utf8');
      if (content.length > 0) {
        console.log('content: ', content);
        content = JSON.parse(content);
      } else {
        console.log(`El archivo ${this.filename} está vacío.`);
        content = [];
      }
    } catch (err) {
      console.log(`${this.filename} no fue encontrado, creando archivo...`);
      obj.id = 1;
      obj.date = new Date().toLocaleString();
      await fs.promises.writeFile(this.filename, JSON.stringify([obj]));
      return obj.id;
    }

    try {
      // append new object to content
      const currentId = content.length;
      obj.id = currentId + 1;
      obj.date = new Date().toLocaleString();
      content.push(obj);
      await fs.promises.writeFile(this.filename, JSON.stringify(content));
      console.log('Objeto guardado!!');
    } catch (err) {
      console.log(`Error al guardar ${this.filename}: ${err}`);
    }
  }

  async actualizar(elem, id) {
    id = parseInt(id);
    const objectIndex = this.productos.findIndex((x) => x.id === id);
    elem.id = id;
    this.productos[objectIndex] = elem;

    return this.productos[objectIndex];
  }

  async borrar(id) {
    try {
      let content = await fs.promises.readFile(this.filename, 'utf-8');
      if (content.length > 0) {
        content = JSON.parse(content);
        const objectIndex = content.findIndex((x) => x.id === id);
        console.log(objectIndex);
        content.splice(objectIndex, 1);
        await fs.promises.writeFile(
          this.filename,
          JSON.stringify(content, null, 2),
          'utf-8'
        );
        console.log(`${id} ha sido eliminado de ${this.filename}`);
      } else {
        console.log(`${this.filename} está vacío`);
        return null;
      }
    } catch (error) {
      console.log(`${this.filename} no fue encontrado. Error: ${error}`);
    }
  }

  async borrarAll() {
    await fs.promises.writeFile(this.filename, []);
  }
}

module.exports = ContenedorArchivo;
