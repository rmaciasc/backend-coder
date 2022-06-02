const admin = require('firebase-admin');
const fs = require('fs');

const config = JSON.parse(
  fs.readFileSync(
    './DB/segunda-coderhouse-firebase-adminsdk-4lccv-51c4cbe770.json',
    'utf8'
  )
);

admin.initializeApp({
  credential: admin.credential.cert(config),
  databaseURL: 'https://segunda-coderhouse/firebaseio.com',
});

console.log('Conectado a Firebase');
const db = admin.firestore();

class ContenedorFirebase {
  constructor(collection) {
    this.collection = db.collection(collection);
  }

  async listar(id) {
    const doc = this.collection.doc(id);
    const result = await doc.get().data;
    if (!result) {
      return { error: 'id no encontrado' };
    } else {
      return result;
    }
  }

  async listarAll() {
    try {
      const results = [];
      let snap = await this.collection.get();
      if (snap.docs) {
        snap.forEach((doc) => {
          results.push({ id: doc.id, ...doc.data() });
        });
        return results;
      } else {
        console.log(`La colección ${this.collection} está vacía.`);
        return false;
      }
    } catch (error) {
      console.log(`${this.collection} no fue encontrada. Error: ${error}`);
    }
  }

  async guardar(elem) {
    try {
      elem.date = new Date().toLocaleString();
      return this.collection.doc().set(elem);
    } catch (error) {
      console.log(error);
    }
  }

  async actualizar(elem, id) {
    return await this.collection.doc(id).update(elem);
  }

  async borrar(id) {
    return await this.collection.doc(id).delete();
  }

  async borrarAll() {
    return await this.collection.doc().delete();
  }
}

module.exports = ContenedorFirebase;
