const normalize = normalizr.normalize;
const denormalize = normalizr.denormalize;
const schema = normalizr.schema;
const socket = io.connect();

//------------------------------------------------------------------------------------

const formAgregarProducto = document.getElementById('formAgregarProducto');

formAgregarProducto.addEventListener('submit', (e) => {
  e.preventDefault();
  const newProd = {
    name: document.getElementById('nombre').value,
    price: document.getElementById('precio').value,
    photo: document.getElementById('foto').value,
  };
  socket.emit('addProduct', newProd);
  document.getElementById('nombre').value = '';
  document.getElementById('precio').value = '';
  document.getElementById('foto').value = '';
});

socket.on('productos', async (productos) => {
  const html = await makeHtmlTable(productos);
  document.getElementById('productos').innerHTML = html;
});

function makeHtmlTable(productos) {
  return fetch('plantillas/tabla-productos.hbs')
    .then((respuesta) => respuesta.text())
    .then((plantilla) => {
      const template = Handlebars.compile(plantilla);
      const html = template({ productos });
      return html;
    });
}

//-------------------------------------------------------------------------------------

// MENSAJES

/* --------------------- DESNORMALIZACIÓN DE MENSAJES ---------------------------- */
const idSchema = new schema.Entity('ids');
const textSchema = new schema.Entity('texts');
const dateSchema = new schema.Entity('dates');
// Definimos un esquema de autor
const authorSchema = new schema.Entity('authors', {}, { idAttribute: 'mail' });
// Definimos un esquema de mensaje
const mensajeSchema = new schema.Entity('mensajes', {
  id: idSchema,
  text: [textSchema],
  authors: [authorSchema],
  date: dateSchema,
});
// Definimos un esquema de posts
const postSchema = new schema.Entity('posts', {
  posts: [mensajeSchema],
});

/* ----------------------------------------------------------------------------- */

const inputMail = document.getElementById('inputMail');
const inputMensaje = document.getElementById('inputMensaje');
const btnEnviar = document.getElementById('btnEnviar');

const formPublicarMensaje = document.getElementById('formPublicarMensaje');
formPublicarMensaje.addEventListener('submit', (e) => {
  e.preventDefault();
  const newMessage = {
    author: {
      mail: document.getElementById('inputMail').value,
      nombre: document.querySelector('#inputUsername').value,
      apellido: document.querySelector('#inputLastname').value,
      edad: document.querySelector('#inputAge').value,
      alias: document.querySelector('#inputAlias').value,
      avatar: document.querySelector('#inputAvatar').value,
    },
    text: document.getElementById('inputMensaje').value,
  };
  console.log('newMessage', newMessage);
  if (newMessage.message !== '') {
    socket.emit('addMessage', newMessage);
  }
  inputMensaje.value = '';
});

socket.on('mensajes', async (mensajesN) => {
  // console.log(mensajesN);
  const mensajesD = denormalize(
    mensajesN.result,
    [postSchema],
    mensajesN.entities
  );
  // console.log('denorm front', mensajesD);
  const html = await makeHtmlList(mensajesD);
  const lenMensajesD = JSON.stringify(mensajesD).length;
  const lenMensajesN = JSON.stringify(mensajesN).length;
  console.log(lenMensajesD, lenMensajesN);
  document.querySelector('#compresion-info').innerText = (
    (lenMensajesN / lenMensajesD) *
    100
  ).toFixed(2);
  document.getElementById('mensajes').innerHTML = html;
});

function makeHtmlList(mensajes) {
  return mensajes
    .map((mensaje) => {
      return `
        <div>
            <b style="color:blue;">${mensaje.author.mail}</b>
            [<span style="color:brown;">${mensaje.date}</span>] :
            <i style="color:green;">${mensaje.text}</i>
            <img width="50" src="${mensaje.author.avatar}" alt=" ">
        </div>
    `;
    })
    .join(' ');
}

function check() {
  if (inputMail.value != '' && inputMail.checkValidity()) {
    btnEnviar.disabled = false;
  } else {
    btnEnviar.disabled = true;
  }
}
inputMail.addEventListener('input', check);
