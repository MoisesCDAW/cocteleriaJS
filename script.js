/**
 * API que usa el programa.
 */
const cocteleriaAPI = "https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=Rum";
let datos; // datos obtenidos de la API


/**
 * Crea un nuevo elemento HTML y le aplica atributos y clases opcionales.
 * 
 * @param {string} tipo - El tipo de elemento HTML a crear (por ejemplo, 'div', 'span', 'p', etc.).
 * @param {Object} [atributos={}] - Un objeto que contiene los atributos a agregar al elemento.
 *                                      Las claves del objeto son los nombres de los atributos y los valores son los valores que se asignarán.
 *                                      (por ejemplo, `{ id: 'miElemento', title: 'Título' }`).
 * @param {Array<string>} [clases=[]] - Un array de cadenas con los nombres de las clases a añadir al elemento.
 *                                      (por ejemplo, `['clase1', 'clase2']`).
 * 
 * @returns {HTMLElement} El nuevo elemento HTML creado con los atributos y clases aplicadas.
 * 
 * @example
 * const div = crearElemento('div', { id: 'contenedor', title: 'Este es un contenedor' }, ['container', 'highlight']);
 * document.body.appendChild(div);
 */
function crearElemento(tipo, atributos = {}, clases = []) {
    let elemt = document.createElement(tipo);

    // Verificar si se proporcionaron atributos, y agregar cada uno al elemento
    if (Object.keys(atributos).length != 0) {
        Object.entries(atributos).forEach(([clave, valor]) => {
            elemt.setAttribute(clave, valor);
        });
    }

    if (clases.length != 0) {
        elemt.classList.add(...clases);
    }

    return elemt;
}


/**
 * Realiza una solicitud HTTP GET a la API externa y maneja los datos obtenidos.
 * 
 * Esta función consulta la URL "cocteleriaAPI", valida la respuesta y
 * devuelve los datos obtenidos en formato JSON. Si ocurre un error en la solicitud
 * o en el procesamiento de los datos, se captura y muestra en la consola.
 *
 * @returns {Object} Devuelve un objeto JSON con los datos obtenidos
 */
async function obtenerDatos(API) {

    fetch(API)

        // Comprobamos que no hay errores al consultar la API
        .then(respuesta => {
            if (respuesta.ok) {
                return respuesta.json();
            }else {

                // Creamos un error y automáticamente se ejecuta el catch
                throw new Error(respuesta.status); 
            }
        })

        // Tomamos los datos y los guardamos en una variable global "Datos"
        .then(datosAPI => {
            datos = datosAPI;

            // Asignamos el evento que se encarga de construir el carrito cuando se haga click en el botón carrito
            document.querySelector("#carrito").addEventListener("click", constructor_carrito);

            constructor_tarjetas();
        })

        .catch(err => {
            console.error("ERROR: ", err.message)
        });
}


/**
 * Cambia la cantidad de una bebida en el carrito y actualiza la interfaz de usuario.
 * La función aumenta o disminuye la cantidad de la bebida seleccionada según la acción recibida
 * y actualiza el carrito en el localStorage.
 * 
 * @param {Event} evento - Este evento debe tener una clase que contiene la acción ("mas" o "menos") 
 *                          y el "idDrink" de la bebida.
 */
function cambiarCantidad(evento){
    const clases = evento.target.className.split(" ");
    const [accion, bebidaId] = clases;
    const contentSecundario = document.querySelector(`[class~="${clases[1]}"]`).parentNode; // [class~="1234"] permite buscar clases numéricas, "~" se usa para buscar coincidencias, ya que un elemento puede tener varias clases
    const carrito = JSON.parse(localStorage.getItem("carrito"));

    // Recorremos el array obtenido del localStorage para buscar la bebida
    const bebida = carrito.bebidas.find(b => b.idDrink == bebidaId);

    let cantidad = contentSecundario.querySelector("#cantidad");

    if (accion=="mas") {
        bebida.cantidad += 1;
    }else {
        bebida.cantidad -= 1;
        if (bebida.cantidad<=0) {
            carrito.bebidas.splice(carrito.bebidas.indexOf(bebida), 1);
            contentSecundario.parentNode.remove(); // Obtenemos el contenedor principal y lo borramos
        }
    }

    // Actualizamos el texto de la cantidad en el contenedor
    cantidad.textContent = bebida.cantidad;

    localStorage.setItem("carrito", JSON.stringify(carrito));
}


/**
 * Agrega una bebida al carrito en el `localStorage`. Si la bebida ya existe en el carrito, 
 * incrementa su cantidad. Si no, la añade al carrito con cantidad 1.
 * 
 * @param {Event} evento - Este evento debe tener un id que será el "idDrink" de la bebida 
 *                          que se va a agregar al carrito.
 */
function agregarBebida(evento){
    const bebidaId = evento.target.id;

    // Creamos un Map de bebidas para buscar la bebida por su ID y conseguir los datos de la bebida
    const bebidasMap = new Map(datos.drinks.map(bebida => [bebida.idDrink, bebida]));
    const bebida = bebidasMap.get(bebidaId);

    // Obtenemos el carrito desde localStorage
    let carrito = JSON.parse(localStorage.getItem("carrito"));
    if (!carrito) {
        carrito = { bebidas: [] };
    }

    // Buscar si la bebida ya está en el carrito
    const existe = carrito.bebidas.find(b => b.idDrink == bebidaId);

    if (existe) {
        existe.cantidad += 1;
    } else {
        carrito.bebidas.push({
            idDrink: bebidaId,
            strDrink: bebida.strDrink,
            cantidad: 1
        });
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));
    alert(`Tu cóctel '${bebida.strDrink}' fue agregado al carrito!`);
}


/**
 * Gestiona la construcción y visualización del carrito de comprar.
 * La función crea dinámicamente un bloque con cada bebida que esté en el carrito y la agrega al contenedor correspondiente en el DOM.
 * El carrito de obtiene de un objeto tipo JSON alojado como String en LocalStorage "carrito".
 */
function constructor_carrito(){
    let carrito = localStorage.getItem("carrito");

    if (carrito) {
        carrito = JSON.parse(carrito);
        carrito = carrito.bebidas;
        
        if (document.querySelector(".productos")) {
            document.querySelector(".productos").remove();
        }
        const contenedor = crearElemento("div", {}, ["productos", "offcanvas-body", "d-flex",  "flex-column", "gap-2"]);
        document.querySelector(".content-carrito").append(contenedor);
        

        carrito.forEach((bebida)=>{
            const contentProducto = crearElemento("div", {}, ["d-flex", "justify-content-between", "align-items-center"]);
            const nombre = crearElemento("p", {}, ["m-0"]);
            const cantidad = crearElemento("p", {id:"cantidad"}, ["m-0", "d-flex", "align-items-center", "me-4"]);
            const contentBotones = crearElemento("div", {}, ["d-flex", "gap-2"]);
            const botonMas = crearElemento("button", {}, ["mas", bebida.idDrink, "btn"]);
            const botonMenos = crearElemento("button", {}, ["menos", bebida.idDrink, "btn"]);
            const imgMas = crearElemento("img", {src:"img/mas.png", width:"14px"}, ["mas", bebida.idDrink]);
            const imgMenos = crearElemento("img", {src:"img/menos.png", width:"14px"},["menos", bebida.idDrink]);
            
            contenedor.append(contentProducto);
            contentProducto.append(nombre, contentBotones);
            nombre.append(bebida.strDrink);
            cantidad.append(bebida.cantidad);
            contentBotones.append(cantidad, botonMas, botonMenos);
            botonMas.append(imgMas);
            botonMenos.append(imgMenos);

            botonMas.addEventListener("click", cambiarCantidad);
            botonMenos.addEventListener("click", cambiarCantidad);
        
        });
    }
}


/**
 * Gestiona la construcción y visualización de tarjetas para cada bebida obtenida de la API.
 * La función crea dinámicamente una tarjeta por cada bebida y la agrega al contenedor correspondiente en el DOM.
 * 
 * @param {Object} datos - Los datos obtenidos de la API. Se espera que el objeto contenga una propiedad `drinks` que es un array de bebidas.
 */
function constructor_tarjetas() {
    const bebidas = datos.drinks;
    const contenedor = document.querySelector(".fila-bebidas");
    const descrip = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Recusandae similique animi enim";

    bebidas.forEach((bebida)=>{
        const contentTarj = crearElemento("div", {style:"width: 16rem;"}, ["card", "p-0"]);
        const img = crearElemento("img", {src:bebida.strDrinkThumb});
        const contentBody = crearElemento("div", {}, ["card-body", "d-flex", "flex-column", "text-white",]);
        const nombre = crearElemento("h5", {}, ["card-title"]);
        const desc = crearElemento("p", {}, ["card-text"]);
        const addCarrito = crearElemento("button", {id:bebida.idDrink}, ["btn", "text-white", "rounded-pill"]);
        const imgCarrito = crearElemento("img", {src:"img/carrito.png", width:"22px", id:bebida.idDrink});

        contenedor.append(contentTarj);
        contentTarj.append(img, contentBody);
        contentBody.append(nombre, desc, addCarrito);

        nombre.append(bebida.strDrink);
        desc.append(descrip);
        addCarrito.append(imgCarrito);

        addCarrito.addEventListener("click", agregarBebida);
    });
}

// ================= INICIO ==================
obtenerDatos(cocteleriaAPI);

// localStorage.removeItem("carrito");
