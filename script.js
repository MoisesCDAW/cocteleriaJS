/**
 * API que usa el programa.
 */
const cocteleriaAPI = "https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=Rum";


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

        .then(respuesta => {
            if (respuesta.ok) {
                return respuesta.json();
            }else {
                throw new Error(respuesta.status);
            }
        })

        .then(datos => {
            constructor_tarjetas(datos);
        })

        .catch(err => {
            console.error("ERROR: ", err.message)
        });
}


/**
 * Gestiona la construcción y visualización de tarjetas para cada bebida obtenida de la API.
 * La función crea dinámicamente una tarjeta por cada bebida y la agrega al contenedor correspondiente en el DOM.
 * 
 * @param {Object} datos - Los datos obtenidos de la API. Se espera que el objeto contenga una propiedad `drinks` que es un array de bebidas.
 */
function constructor_tarjetas(datos) {
    const bebidas = datos.drinks;
    const contenedor = document.querySelector(".fila-bebidas");
    const descrip = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Recusandae similique animi enim";

    bebidas.forEach((bebida)=>{
        const contentTarj = crearElemento("div", {style:"width: 16rem;"}, ["card", "p-0"]);
        const img = crearElemento("img", {src:bebida.strDrinkThumb});
        const contentBody = crearElemento("div", {}, ["card-body", "d-flex", "flex-column", "text-white",]);
        const nombre = crearElemento("h5", {}, ["card-title"]);
        const desc = crearElemento("p", {}, ["card-text"]);
        const addCarrito = crearElemento("button", {value:bebida.strDrink}, ["btn", "text-white", "rounded-pill"]);
        const imgCarrito = crearElemento("img", {src:"img/carrito.png", width:"22px"});

        contenedor.append(contentTarj);
        contentTarj.append(img, contentBody);
        contentBody.append(nombre, desc, addCarrito);

        nombre.append(bebida.strDrink);
        desc.append(descrip);
        addCarrito.append(imgCarrito);
    });
}





// ================= INICIO ==================
obtenerDatos(cocteleriaAPI);


