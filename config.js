// Variable global para almacenar el estado del carrito de compras
let carrito = [];

// Configuración de datos de contacto de la empresa
const numeroWhatsApp = "5493883310865"; // Número de WhatsApp oficial en Jujuy
const mensajeConsultaNav = "¡Hola Puna Serena! 🌵 Quisiera hacer una consulta sobre los aromatizadores ecológicos.";

/**
 * Inicializa el enlace del botón de consulta en el Navbar asignando la URL de WhatsApp
 */
function inicializarBotonWhatsAppNav() {
    const btnConsultar = document.getElementById("btnConsultarNav");
    if (btnConsultar) {
        const mensajeCodificado = encodeURIComponent(mensajeConsultaNav);
        btnConsultar.href = `https://wa.me/${numeroWhatsApp}?text=${mensajeCodificado}`;
    }
}

/**
 * Alterna la visibilidad del menú desplegable en dispositivos móviles
 */
function alternarMenuMovil() {
    const menu = document.getElementById('mobileMenu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

/**
 * Muestra u oculta el panel lateral del carrito de compras
 */
function alternarCarrito() {
    const panel = document.getElementById('cartPanel');
    const overlay = document.getElementById('cartOverlay');

    if (panel && overlay) {
        panel.classList.toggle('translate-x-full');
        overlay.classList.toggle('opacity-0');
        overlay.classList.toggle('pointer-events-none');
    }
}

/**
 * Agrega un nuevo producto al carrito o incrementa su cantidad si ya existe
 * @param {number} id - Identificador único del producto
 * @param {string} nombre - Nombre comercial del producto
 * @param {number} precioBase - Precio unitario en ARS
 * @param {string} idSelectFragancia - ID del elemento select para obtener la fragancia elegida
 * @param {string} categoria - Categoría del producto (hogar, auto, empresa)
 */
function agregarAlCarrito(id, nombre, precioBase, idSelectFragancia, categoria) {
    const select = document.getElementById(idSelectFragancia);
    const fragancia = select ? select.value : 'Aroma Estándar';

    const indiceExistente = carrito.findIndex(item => item.id === id && item.fragancia === fragancia);

    if (indiceExistente > -1) {
        carrito[indiceExistente].cantidad += 1;
    } else {
        carrito.push({
            id: id,
            nombre: nombre,
            precio: precioBase,
            fragancia: fragancia,
            cantidad: 1,
            categoria: categoria
        });
    }

    actualizarInterfazCarrito();
    mostrarNotificacion(`¡${nombre} agregado al carrito!`);
}

/**
 * Agrega el Servicio de Refundido de cera directamente al carrito y despliega el panel
 */
function agregarRefundidoDirecto() {
    agregarAlCarrito(5, 'Servicio de Refundido', 3000, 'fragrance-5', 'hogar');
    alternarCarrito();
}

/**
 * Recalcula subtotales, aplica la promoción 2x $9.000 para barras de hogar y renderiza los elementos en el carrito
 */
function actualizarInterfazCarrito() {
    const contenedorItems = document.getElementById('cartItemsContainer');
    const contadorCarrito = document.getElementById('cartCount');
    const elementoSubtotal = document.getElementById('cartSubtotal');
    const elementoTotal = document.getElementById('cartTotal');
    const filaPromo = document.getElementById('promoDiscountRow');
    const elementoDescuentoPromo = document.getElementById('promoDiscount');

    // Calcular el total de productos individuales en el carrito
    const totalUnidades = carrito.reduce((suma, item) => suma + item.cantidad, 0);
    if (contadorCarrito) {
        contadorCarrito.innerText = totalUnidades;
    }

    // Estado cuando el carrito está vacío
    if (carrito.length === 0) {
        if (contenedorItems) {
            contenedorItems.innerHTML = `
                <div class="text-center py-12 text-gray-400 space-y-3">
                    <i class="fas fa-shopping-basket text-4xl text-sand"></i>
                    <p class="text-sm">Tu carrito está vacío</p>
                    <a href="#catalogo" onclick="alternarCarrito()" class="inline-block text-xs bg-terracotta text-white px-4 py-2 rounded-full font-semibold">
                        Explorar Productos
                    </a>
                </div>
            `;
        }
        if (elementoSubtotal) elementoSubtotal.innerText = '$0';
        if (elementoTotal) elementoTotal.innerText = '$0';
        if (filaPromo) filaPromo.style.display = 'none';
        return;
    }

    // Renderizado de cada producto dentro del carrito
    let htmlItems = '';
    let subtotalSinDescuento = 0;
    let cantidadBarrasHogar = 0;

    carrito.forEach((item, indice) => {
        subtotalSinDescuento += item.precio * item.cantidad;
        if (item.id === 1 || item.id === 2) {
            cantidadBarrasHogar += item.cantidad;
        }

        htmlItems += `
            <div class="bg-sand-soft/60 p-3 rounded-2xl border border-sand flex items-center justify-between gap-3 text-xs">
                <div class="flex-1">
                    <h4 class="font-bold text-sage font-serif">${item.nombre}</h4>
                    <span class="text-[10px] text-terracotta font-medium block">${item.fragancia}</span>
                    <span class="text-gray-500 font-semibold">$${item.precio.toLocaleString('es-AR')}</span>
                </div>

                <div class="flex items-center gap-2 bg-white px-2 py-1 rounded-xl border border-sand">
                    <button onclick="cambiarCantidad(${indice}, -1)" class="text-gray-500 hover:text-terracotta font-bold px-1">-</button>
                    <span class="font-bold text-sage w-4 text-center">${item.cantidad}</span>
                    <button onclick="cambiarCantidad(${indice}, 1)" class="text-gray-500 hover:text-terracotta font-bold px-1">+</button>
                </div>

                <button onclick="eliminarProducto(${indice})" class="text-gray-400 hover:text-red-500 p-1">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
    });

    if (contenedorItems) {
        contenedorItems.innerHTML = htmlItems;
    }

    // Lógica promocional: 2 barras de Línea Hogar ($5.000 c/u) por $9.000 ($1.000 de descuento por par)
    let descuentoTotal = 0;
    if (cantidadBarrasHogar >= 2) {
        const paresPromocionales = Math.floor(cantidadBarrasHogar / 2);
        descuentoTotal = paresPromocionales * 1000;
    }

    if (descuentoTotal > 0 && filaPromo && elementoDescuentoPromo) {
        filaPromo.style.display = 'flex';
        elementoDescuentoPromo.innerText = `-$${descuentoTotal.toLocaleString('es-AR')}`;
    } else if (filaPromo) {
        filaPromo.style.display = 'none';
    }

    const precioFinalTotal = subtotalSinDescuento - descuentoTotal;

    if (elementoSubtotal) elementoSubtotal.innerText = `$${subtotalSinDescuento.toLocaleString('es-AR')}`;
    if (elementoTotal) elementoTotal.innerText = `$${precioFinalTotal.toLocaleString('es-AR')}`;
}

/**
 * Incrementa o decrementa la cantidad de un producto específico en el carrito
 * @param {number} indice - Índice del elemento en el arreglo del carrito
 * @param {number} cambio - Cantidad a sumar o restar (+1 o -1)
 */
function cambiarCantidad(indice, cambio) {
    if (carrito[indice]) {
        carrito[indice].cantidad += cambio;
        if (carrito[indice].cantidad <= 0) {
            carrito.splice(indice, 1);
        }
        actualizarInterfazCarrito();
    }
}

/**
 * Elimina un producto individual del carrito según su índice
 * @param {number} indice - Índice del elemento en el arreglo del carrito
 */
function eliminarProducto(indice) {
    if (carrito[indice]) {
        carrito.splice(indice, 1);
        actualizarInterfazCarrito();
    }
}

/**
 * Filtra los productos visibles en el catálogo según la categoría seleccionada
 * @param {string} categoria - Nombre de la categoría ('todos', 'hogar', 'auto', 'empresa')
 * @param {Event} evento - Evento de clic para cambiar los estilos del botón activo
 */
function filtrarProductos(categoria, evento) {
    const tarjetas = document.querySelectorAll('.product-card');
    const botones = document.querySelectorAll('.cat-btn');

    botones.forEach(btn => {
        btn.classList.remove('bg-sage', 'text-white', 'active');
        btn.classList.add('bg-white', 'text-gray-700');
    });

    if (evento && evento.target) {
        evento.target.classList.add('bg-sage', 'text-white', 'active');
        evento.target.classList.remove('bg-white', 'text-gray-700');
    }

    tarjetas.forEach(tarjeta => {
        if (categoria === 'todos' || tarjeta.dataset.category === categoria) {
            tarjeta.style.display = 'flex';
        } else {
            tarjeta.style.display = 'none';
        }
    });
}

/**
 * Calcula el ahorro estimado anual según la cantidad de barras consumidas usando el servicio de refundido
 */
function calcularAhorroRefundido() {
    const inputCantidad = document.getElementById('barsCount');
    const displayBarras = document.getElementById('barsDisplay');
    const displayAhorro = document.getElementById('savingsAmount');

    if (inputCantidad && displayBarras && displayAhorro) {
        const cantidad = parseInt(inputCantidad.value);
        displayBarras.innerText = `${cantidad} barras al año`;

        // Cálculo: Precio lleno ($5.000) vs Primera compra ($5.000) + Reutilizaciones ($3.000)
        const costoPrecioLleno = cantidad * 5000;
        const costoConRefundido = 5000 + ((cantidad - 1) * 3000);
        const ahorroTotal = costoPrecioLleno - costoConRefundido;

        displayAhorro.innerText = `$${ahorroTotal.toLocaleString('es-AR')}`;
    }
}

/**
 * Genera el mensaje estructurado con el pedido del carrito y abre el chat de WhatsApp
 */
function procesarPedidoWhatsApp() {
    if (carrito.length === 0) {
        alert('Tu carrito está vacío. Agregá productos antes de realizar el pedido.');
        return;
    }

    const selectEntrega = document.getElementById('deliveryOption');
    const metodoEntrega = selectEntrega ? selectEntrega.value : 'A coordinar';

    let mensajePedido = `*NUEVO PEDIDO - PUNA SERENA*\n`;
    mensajePedido += `---------------------------------\n`;

    carrito.forEach((item) => {
        mensajePedido += `• *${item.nombre}* (x${item.cantidad})\n`;
        mensajePedido += `   Aroma: ${item.fragrance}\n`;
        mensajePedido += `   Subtotal: $${(item.precio * item.cantidad).toLocaleString('es-AR')}\n\n`;
    });

    const elementoTotal = document.getElementById('cartTotal');
    const textoTotal = elementoTotal ? elementoTotal.innerText : '$0';

    mensajePedido += `---------------------------------\n`;
    mensajePedido += `*Total Estimado:* ${textoTotal}\n`;
    mensajePedido += `*Opción de Entrega:* ${metodoEntrega}\n\n`;
    mensajePedido += `¡Hola! Quisiera coordinar el pago y la entrega de mi pedido. Gracias!`;

    const mensajeCodificado = encodeURIComponent(mensajePedido);
    window.open(`https://wa.me/${numeroWhatsApp}?text=${mensajeCodificado}`, '_blank');
}

/**
 * Muestra un mensaje flotante temporal (Toast) en la pantalla
 * @param {string} mensaje - Texto a mostrar en la notificación
 */
function mostrarNotificacion(mensaje) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');

    if (toast && toastMsg) {
        toastMsg.innerText = mensaje;
        toast.classList.remove('translate-y-20', 'opacity-0');

        setTimeout(() => {
            toast.classList.add('translate-y-20', 'opacity-0');
        }, 3000);
    }
}

/**
 * Inicia el carrusel/slider de imágenes de fondo para la sección Hero
 */
function iniciarSliderFondoHero() {
    const diapositivas = document.querySelectorAll('.hero-bg-slide');
    if (diapositivas.length === 0) return;

    let indiceActual = 0;
    const intervaloTiempo = 5000; // Cambia la imagen cada 5 segundos

    setInterval(() => {
        diapositivas[indiceActual].classList.remove('active');
        indiceActual = (indiceActual + 1) % diapositivas.length;
        diapositivas[indiceActual].classList.add('active');
    }, intervaloTiempo);
}

// Escuchar la carga del DOM e iniciar el slider
document.addEventListener('DOMContentLoaded', () => {
    iniciarSliderFondoHero();
});

// Inicialización de funciones al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    inicializarBotonWhatsAppNav();
});