/**
 * UNIDAD 5A — JS + PHP Integración AJAX
 */

// ==========================================
// ETAPA 1 — Funciones Matemáticas / Auxiliares
// ==========================================

function calcularPromedio(notas) {
  if (!notas || notas.length === 0) return 0;
  const suma = notas.reduce((acc, nota) => acc + nota, 0);
  return Number((suma / notas.length).toFixed(2));
}

function estaAprobado(nota, minima = 6) {
  return nota >= minima;
}

function obtenerCalificacion(promedio) {
  if (promedio >= 9) return "Sobresaliente";
  if (promedio >= 7.5) return "Muy bueno";
  if (promedio >= 6) return "Bueno";
  return "Desaprobado";
}

function parsearNotas(textoNotas) {
  if (!textoNotas) return [];
  return textoNotas
    .split(",")
    .map(val => parseFloat(val.trim()))
    .filter(val => !isNaN(val) && val >= 0 && val <= 10);
}

// ==========================================
// ETAPA 2 — Elementos del DOM
// ==========================================

const formEstudiante = document.getElementById("formEstudiante");
const inputNombre = document.getElementById("inputNombre");
const inputEmail = document.getElementById("inputEmail");
const inputNotas = document.getElementById("inputNotas");
const inputNotaMinima = document.getElementById("inputNotaMinima");
const inputBuscador = document.getElementById("inputBuscador");

const errorMsg = document.getElementById("errorMsg");
const successMsg = document.getElementById("successMsg");
const tablaEstudiantes = document.getElementById("tablaEstudiantes");

const resTotal = document.getElementById("resTotal");
const resAprobados = document.getElementById("resAprobados");
const resDesaprobados = document.getElementById("resDesaprobados");
const resPromedioGeneral = document.getElementById("resPromedioGeneral");

// Modal
const modalEditar = document.getElementById("modalEditar");
const formEditarEstudiante = document.getElementById("formEditarEstudiante");
const editId = document.getElementById("editId");
const editNombre = document.getElementById("editNombre");
const editEmail = document.getElementById("editEmail");
const editNotas = document.getElementById("editNotas");

let listaEstudiantes = [];

function mostrarFeedback(msg, esError = false) {
  if (esError) {
    errorMsg.textContent = msg;
    errorMsg.style.display = "block";
    successMsg.style.display = "none";
  } else {
    successMsg.textContent = msg;
    successMsg.style.display = "block";
    errorMsg.style.display = "none";
  }
  setTimeout(() => {
    errorMsg.style.display = "none";
    successMsg.style.display = "none";
  }, 3000);
}

// ==========================================
// ETAPA 3 — API Fetch Operations
// ==========================================

async function cargarEstudiantes(termino = '') {
  try {
    const response = await fetch(`api/estudiantes.php?q=${encodeURIComponent(termino)}`);
    if (!response.ok) throw new Error("Error en la respuesta del servidor");
    
    listaEstudiantes = await response.json();
    renderizarUI();
  } catch (error) {
    console.error("Error al cargar estudiantes:", error);
    mostrarFeedback("Error de comunicación con el servidor", true);
  }
}

function renderizarUI() {
  const notaMinima = parseFloat(inputNotaMinima.value) || 6;
  tablaEstudiantes.innerHTML = "";

  if (!Array.isArray(listaEstudiantes) || listaEstudiantes.length === 0) {
    tablaEstudiantes.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: #64748b;">No se encontraron estudiantes.</td>
      </tr>
    `;
    resTotal.textContent = 0;
    resAprobados.textContent = 0;
    resDesaprobados.textContent = 0;
    resPromedioGeneral.textContent = "0.00";
    return;
  }

  let totalPromedios = 0;
  let contadorAprobados = 0;

  listaEstudiantes.forEach((est) => {
    const notasArray = Array.isArray(est.notas) ? est.notas : [];
    const promedio = calcularPromedio(notasArray);
    const aprobado = estaAprobado(promedio, notaMinima);
    const calificacion = obtenerCalificacion(promedio);

    totalPromedios += promedio;
    if (aprobado) contadorAprobados++;

    const nombreEscapado = String(est.nombre || '').replace(/'/g, "\\'");
    const emailEscapado = String(est.email || '').replace(/'/g, "\\'");
    const notasTexto = notasArray.join(',');

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${est.nombre}</strong></td>
      <td>${est.email ? est.email : '<em>Sin correo</em>'}</td>
      <td>${notasArray.length > 0 ? notasArray.join(", ") : "<em>Sin notas</em>"}</td>
      <td>${promedio.toFixed(2)}</td>
      <td>${calificacion}</td>
      <td>
        <span class="badge ${aprobado ? 'badge-aprobado' : 'badge-desaprobado'}">
          ${aprobado ? 'Aprobado' : 'Desaprobado'}
        </span>
      </td>
      <td>
        <button class="btn btn-warning btn-sm" onclick="abrirModal(${est.id}, '${nombreEscapado}', '${emailEscapado}', '${notasTexto}')">✏️</button>
        <button class="btn btn-danger btn-sm" onclick="eliminarEstudiante(${est.id})">✕</button>
      </td>
    `;
    tablaEstudiantes.appendChild(tr);
  });

  const total = listaEstudiantes.length;
  const desaprobados = total - contadorAprobados;
  const promedioGeneral = total > 0 ? (totalPromedios / total).toFixed(2) : "0.00";

  resTotal.textContent = total;
  resAprobados.textContent = contadorAprobados;
  resDesaprobados.textContent = desaprobados;
  resPromedioGeneral.textContent = promedioGeneral;
}

// ==========================================
// ETAPA 4 — Event Listeners & CRUD
// ==========================================

// Agregar Estudiante (POST)
formEstudiante.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = inputNombre.value.trim();
  const email = inputEmail ? inputEmail.value.trim() : "";
  const notasValidas = parsearNotas(inputNotas.value);

  if (!nombre || notasValidas.length === 0) {
    mostrarFeedback("Ingrese un nombre y al menos una nota válida (0-10).", true);
    return;
  }

  try {
    const res = await fetch("api/estudiantes.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: nombre, email: email, notas: notasValidas })
    });

    const data = await res.json();
    if (res.ok) {
      mostrarFeedback("Estudiante agregado correctamente.");
      inputNombre.value = "";
      if (inputEmail) inputEmail.value = "";
      inputNotas.value = "";
      cargarEstudiantes(inputBuscador.value.trim());
    } else {
      mostrarFeedback(data.message || "Error al agregar", true);
    }
  } catch (err) {
    mostrarFeedback("Error en el servidor al intentar agregar.", true);
  }
});

// Buscador en tiempo real
inputBuscador.addEventListener("input", (e) => {
  cargarEstudiantes(e.target.value.trim());
});

// Recalcular estado con nota mínima
inputNotaMinima.addEventListener("input", () => {
  renderizarUI();
});

// Eliminar Estudiante (DELETE)
window.eliminarEstudiante = async function(id) {
  if (!confirm("¿Está seguro de eliminar este estudiante?")) return;

  try {
    const res = await fetch(`api/estudiantes.php?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      mostrarFeedback("Estudiante eliminado.");
      cargarEstudiantes(inputBuscador.value.trim());
    } else {
      mostrarFeedback("Error al eliminar el estudiante.", true);
    }
  } catch (err) {
    mostrarFeedback("Error en la conexión al eliminar.", true);
  }
};

// Modales y Edición (PUT)
window.abrirModal = function(id, nombre, email, notas) {
  editId.value = id;
  editNombre.value = nombre;
  if (editEmail) editEmail.value = email;
  editNotas.value = notas;
  modalEditar.style.display = "flex";
};

window.cerrarModal = function() {
  modalEditar.style.display = "none";
};

formEditarEstudiante.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = parseInt(editId.value);
  const nombre = editNombre.value.trim();
  const email = editEmail ? editEmail.value.trim() : "";
  const notasValidas = parsearNotas(editNotas.value);

  if (!nombre || notasValidas.length === 0) {
    alert("Datos inválidos");
    return;
  }

  try {
    const res = await fetch("api/estudiantes.php", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, nombre, email, notas: notasValidas })
    });

    if (res.ok) {
      mostrarFeedback("Estudiante actualizado exitosamente.");
      cerrarModal();
      cargarEstudiantes(inputBuscador.value.trim());
    } else {
      mostrarFeedback("Error al actualizar.", true);
    }
  } catch (err) {
    mostrarFeedback("Error de conexión al actualizar.", true);
  }
});

// Inicializar
document.addEventListener("DOMContentLoaded", () => {
  cargarEstudiantes();
});