const API_URL = 'api.php';

// Elementos del DOM
const form = document.getElementById('form-producto');
const inputId = document.getElementById('producto-id');
const inputNombre = document.getElementById('nombre');
const inputPrecio = document.getElementById('precio');
const inputStock = document.getElementById('stock');
const btnGuardar = document.getElementById('btn-guardar');
const btnCancelar = document.getElementById('btn-cancelar');
const inputBuscar = document.getElementById('buscar');
const tablaBody = document.getElementById('tabla-productos');
const valorTotalElem = document.getElementById('valor-total');

// Formateador de moneda en pesos (Nivel 2)
const formatearPesos = (valor) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(valor);
};

// Cargar/Listar productos
async function cargarProductos(query = '') {
    try {
        const res = await fetch(`${API_URL}?q=${encodeURIComponent(query)}`);
        const productos = await res.json();
        renderTabla(productos);
    } catch (err) {
        console.error('Error al cargar productos:', err);
    }
}

// Renderizar la tabla y calcular total
function renderTabla(productos) {
    tablaBody.innerHTML = '';
    let totalInventario = 0;

    productos.forEach(prod => {
        const precio = parseFloat(prod.precio);
        const stock = parseInt(prod.stock);
        totalInventario += precio * stock;

        const tr = document.createElement('tr');
        if (stock < 5) tr.classList.add('stock-bajo'); // Resaltar stock bajo (Nivel 2)

        tr.innerHTML = `
            <td>${prod.id}</td>
            <td>${prod.nombre}</td>
            <td>${formatearPesos(precio)}</td>
            <td><strong>${stock}</strong></td>
            <td>
                <!-- Ajuste PATCH +1 / -1 (Nivel 3) -->
                <button class="btn btn-sm btn-outline-secondary me-1" onclick="cambiarStock(${prod.id}, -1)">-1</button>
                <button class="btn btn-sm btn-outline-secondary" onclick="cambiarStock(${prod.id}, 1)">+1</button>
            </td>
            <td>
                <button class="btn btn-sm btn-warning me-1" onclick="prepararEdicion(${JSON.stringify(prod).replace(/"/g, '&quot;')})">Editar</button>
                <button class="btn btn-sm btn-danger" onclick="eliminarProducto(${prod.id})">Eliminar</button>
            </td>
        `;
        tablaBody.appendChild(tr);
    });

    valorTotalElem.textContent = formatearPesos(totalInventario);
}

// Guardar o Editar (POST / PUT)
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = inputId.value;
    const nombre = inputNombre.value.trim();
    const precio = parseFloat(inputPrecio.value);
    const stock = parseInt(inputStock.value);

    // Validación cliente (Nivel 2)
    if (precio < 0 || stock < 0) {
        alert('El precio y el stock deben ser valores positivos.');
        return;
    }

    const payload = { nombre, precio, stock };
    let method = 'POST';

    if (id) {
        payload.id = id;
        method = 'PUT';
    }

    try {
        const res = await fetch(API_URL, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            resetForm();
            cargarProductos();
        } else {
            const data = await res.json();
            alert(data.error || 'Error al guardar');
        }
    } catch (err) {
        console.error('Error al guardar producto:', err);
    }
});

// Variable global para almacenar el carrito temporal de la venta actual
let carritoVenta = [];

// Cargar productos en el selector (<select>) del modal de ventas
async function cargarSelectProductos() {
    try {
        const res = await fetch(API_URL);
        const productos = await res.json();
        const select = document.getElementById('venta-producto-id');
        select.innerHTML = '';

        productos.forEach(prod => {
            if (parseInt(prod.stock) > 0) { // Solo mostrar productos con stock disponible
                const option = document.createElement('option');
                option.value = prod.id;
                option.dataset.precio = prod.precio;
                option.dataset.nombre = prod.nombre;
                option.dataset.stock = prod.stock;
                option.textContent = `${prod.nombre} (Stock: ${prod.stock}) - ${formatearPesos(prod.precio)}`;
                select.appendChild(option);
            }
        });
    } catch (err) {
        console.error('Error al cargar productos para la venta:', err);
    }
}

// Agregar producto al carrito temporal
function agregarAlCarrito() {
    const select = document.getElementById('venta-producto-id');
    const optionSelected = select.options[select.selectedIndex];
    
    if (!optionSelected) {
        alert('Selecciona un producto válido.');
        return;
    }

    const id = parseInt(optionSelected.value);
    const nombre = optionSelected.dataset.nombre;
    const precio = parseFloat(optionSelected.dataset.precio);
    const stockMax = parseInt(optionSelected.dataset.stock);
    const cantidad = parseInt(document.getElementById('venta-cantidad').value);

    if (isNaN(cantidad) || cantidad <= 0) {
        alert('Ingresa una cantidad válida.');
        return;
    }

    // Verificar si ya existe en el carrito para sumar la cantidad
    const indexExistente = carritoVenta.findIndex(item => item.id === id);
    let cantidadTotalActual = cantidad;

    if (indexExistente !== -1) {
        cantidadTotalActual += carritoVenta[indexExistente].cantidad;
    }

    if (cantidadTotalActual > stockMax) {
        alert(`No puedes agregar esa cantidad. Stock disponible: ${stockMax}`);
        return;
    }

    if (indexExistente !== -1) {
        carritoVenta[indexExistente].cantidad = cantidadTotalActual;
    } else {
        carritoVenta.push({ id, nombre, precio, cantidad });
    }

    renderCarrito();
}

// Renderizar la tabla del carrito y calcular el total de la venta
function renderCarrito() {
    const tbody = document.getElementById('tabla-carrito');
    tbody.innerHTML = '';
    let totalGeneral = 0;

    carritoVenta.forEach((item, index) => {
        const subtotal = item.precio * item.cantidad;
        totalGeneral += subtotal;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.nombre}</td>
            <td>${formatearPesos(item.precio)}</td>
            <td>${item.cantidad}</td>
            <td>${formatearPesos(subtotal)}</td>
            <td><button class="btn btn-sm btn-danger" onclick="eliminarDelCarrito(${index})">❌</button></td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('carrito-total').textContent = formatearPesos(totalGeneral);
}

// Quitar producto del carrito temporal
function eliminarDelCarrito(index) {
    carritoVenta.splice(index, 1);
    renderCarrito();
}

// Enviar la venta completa al backend
async function finalizarVenta() {
    if (carritoVenta.length === 0) {
        alert('El carrito está vacío.');
        return;
    }

    const payload = {
        accion: 'registrar_venta',
        items: carritoVenta.map(item => ({ id: item.id, cantidad: item.cantidad }))
    };

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.ok) {
            alert(data.mensaje);
            carritoVenta = []; // Vaciar carrito local
            renderCarrito();
            
            // Cerrar modal usando Bootstrap
            const modalEl = document.getElementById('modalVenta');
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            modalInstance.hide();

            // Recargar la tabla principal de productos para ver el stock actualizado
            cargarProductos(inputBuscar.value);
        } else {
            alert(data.error || 'Error al procesar la venta');
        }
    } catch (err) {
        console.error('Error al registrar venta:', err);
        alert('Error de conexión con el servidor.');
    }
}

// Cambiar stock rápido (PATCH - Nivel 3)
async function cambiarStock(id, cambio) {
    try {
        const res = await fetch(API_URL, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, cambio })
        });
        if (res.ok) cargarProductos(inputBuscar.value);
    } catch (err) {
        console.error('Error al modificar stock:', err);
    }
}

// Preparar formulario para edición
function prepararEdicion(prod) {
    inputId.value = prod.id;
    inputNombre.value = prod.nombre;
    inputPrecio.value = prod.precio;
    inputStock.value = prod.stock;
    btnGuardar.textContent = 'Actualizar';
    btnCancelar.classList.remove('d-none');
}

// Cancelar edición
btnCancelar.addEventListener('click', resetForm);

function resetForm() {
    inputId.value = '';
    form.reset();
    btnGuardar.textContent = 'Guardar';
    btnCancelar.classList.add('d-none');
}

// Eliminar producto (DELETE)
async function eliminarProducto(id) {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;

    try {
        const res = await fetch(`${API_URL}?id=${id}`, { method: 'DELETE' });
        if (res.ok) cargarProductos(inputBuscar.value);
    } catch (err) {
        console.error('Error al eliminar producto:', err);
    }
}

// Buscador (Debounce básico o en tiempo real)
inputBuscar.addEventListener('input', (e) => {
    cargarProductos(e.target.value);
});

// Carga inicial
cargarProductos();