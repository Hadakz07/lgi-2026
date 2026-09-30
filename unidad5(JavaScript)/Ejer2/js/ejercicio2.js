/**
 * UNIDAD 5A · JavaScript Fundamentos
 * Ejercicio 2 — Funciones, Arrays y Formulario
 */

// ==========================================
// ETAPA 1 — Funciones y Arrays
// ==========================================

/**
 * 1. Calcula el promedio de un array de números.
 * @param {number[]} notas
 * @returns {number}
 */
function calcularPromedio(notas) {
  if (!notas || notas.length === 0) return 0;
  const suma = notas.reduce((acc, nota) => acc + nota, 0);
  return Number((suma / notas.length).toFixed(2));
}

/**
 * 2. Determina si una nota alcanza el mínimo especificado.
 * @param {number} nota 
 * @param {number} minima - Por defecto 6
 * @returns {boolean}
 */
function estaAprobado(nota, minima = 6) {
  return nota >= minima;
}

/**
 * ETAPA 2 — Categorización de Calificación
 * @param {number} promedio 
 * @returns {string}
 */
function obtenerCalificacion(promedio) {
  if (promedio >= 9) return "Sobresaliente";
  if (promedio >= 7.5) return "Muy bueno";
  if (promedio >= 6) return "Bueno";
  return "Desaprobado";
}

// --- Pruebas por Consola (Etapa 1 & 2) ---
console.log("=== ETAPA 1: Pruebas de Funciones en Consola ===");
console.log("Promedio [8, 9, 7.5]:", calcularPromedio([8, 9, 7.5])); // Expected: 8.17
console.log("Promedio [3, 5, 4]:", calcularPromedio([3, 5, 4]));     // Expected: 4.00
console.log("Promedio [10, 10]:", calcularPromedio([10, 10]));       // Expected: 10.00

console.log("estaAprobado(6, 6):", estaAprobado(6, 6)); // Expected: true (caso límite)
console.log("estaAprobado(5.9, 6):", estaAprobado(5.9, 6)); // Expected: false
console.log("estaAprobado(6.5, 7):", estaAprobado(6.5, 7)); // Expected: false (mínimo modificado)

// 3. Array inicial con 5 estudiantes
const estudiantesIniciales = [
  { nombre: "Laura Giménez", notas: [8, 9, 7.5] },
  { nombre: "Carlos Gómez", notas: [3, 5, 4] },
  { nombre: "Mariana Ríos", notas: [9, 9.5, 10] },
  { nombre: "Esteban Paz", notas: [6, 6, 6] },
  { nombre: "Lucía Fernández", notas: [2, 4, 5] }
];

// 4. map() para promedios
const estudiantesConPromedio = estudiantesIniciales.map(est => ({
  nombre: est.nombre,
  notas: est.notas,
  promedio: calcularPromedio(est.notas),
  calificacion: obtenerCalificacion(calcularPromedio(est.notas))
}));

console.log("--- Tabla de Estudiantes (map) ---");
console.table(estudiantesConPromedio);

// 5. filter() para aprobados
const aprobadosIniciales = estudiantesConPromedio.filter(est => estaAprobado(est.promedio, 6));

console.log(`--- Aprobados: ${aprobadosIniciales.length} de ${estudiantesConPromedio.length} ---`);
aprobadosIniciales.forEach(est => console.log(`- ${est.nombre}: Promedio ${est.promedio}`));


// ==========================================
// ETAPA 3 — Formulario e Interfaz Visual
// ==========================================

// Estado de la aplicación
let listaEstudiantes = JSON.parse(localStorage.getItem("estudiantes_lgi")) || [...estudiantesIniciales];

// Elementos del DOM
const formEstudiante = document.getElementById("formEstudiante");
const inputNombre = document.getElementById("inputNombre");
const inputNotas = document.getElementById("inputNotas");
const inputNotaMinima = document.getElementById("inputNotaMinima");
const errorMsg = document.getElementById("errorMsg");
const tablaEstudiantes = document.getElementById("tablaEstudiantes");
const btnLimpiar = document.getElementById("btnLimpiar");

// Elementos del Resumen
const resTotal = document.getElementById("resTotal");
const resAprobados = document.getElementById("resAprobados");
const resDesaprobados = document.getElementById("resDesaprobados");
const resPromedioGeneral = document.getElementById("resPromedioGeneral");

/**
 * Parsea un texto de notas separadas por coma y filtra valores inválidos (0–10).
 * @param {string} textoNotas 
 * @returns {number[]} Array de números válidos
 */
function parsearNotas(textoNotas) {
  if (!textoNotas) return [];
  
  return textoNotas
    .split(",")
    .map(val => parseFloat(val.trim()))
    .filter(val => !isNaN(val) && val >= 0 && val <= 10);
}

/**
 * Renderiza la tabla y recalcula las estadísticas en base a la nota mínima actual.
 */
function renderizarUI() {
  const notaMinima = parseFloat(inputNotaMinima.value) || 6;

  // Limpiar tabla
  tablaEstudiantes.innerHTML = "";

  if (listaEstudiantes.length === 0) {
    tablaEstudiantes.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: #64748b;">No hay estudiantes cargados en la lista.</td>
      </tr>
    `;
  }

  let totalPromedios = 0;
  let contadorAprobados = 0;

  listaEstudiantes.forEach((est, index) => {
    const promedio = calcularPromedio(est.notas);
    const aprobado = estaAprobado(promedio, notaMinima);
    const calificacion = obtenerCalificacion(promedio);

    totalPromedios += promedio;
    if (aprobado) contadorAprobados++;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${est.nombre}</strong></td>
      <td>${est.notas.join(", ")}</td>
      <td>${promedio.toFixed(2)}</td>
      <td>${calificacion}</td>
      <td>
        <span class="badge ${aprobado ? 'badge-aprobado' : 'badge-desaprobado'}">
          ${aprobado ? 'Aprobado' : 'Desaprobado'}
        </span>
      </td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="eliminarEstudiante(${index})">✕</button>
      </td>
    `;
    tablaEstudiantes.appendChild(tr);
  });

  // Actualizar resumen
  const total = listaEstudiantes.length;
  const desaprobados = total - contadorAprobados;
  const promedioGeneral = total > 0 ? (totalPromedios / total).toFixed(2) : "0.00";

  resTotal.textContent = total;
  resAprobados.textContent = contadorAprobados;
  resDesaprobados.textContent = desaprobados;
  resPromedioGeneral.textContent = promedioGeneral;

  // Persistir en localStorage
  localStorage.setItem("estudiantes_lgi", JSON.stringify(listaEstudiantes));
}

/**
 * Maneja el evento submit del formulario
 */
formEstudiante.addEventListener("submit", (e) => {
  e.preventDefault();
  errorMsg.style.display = "none";

  const nombre = inputNombre.value.trim();
  const notasValidas = parsearNotas(inputNotas.value);

  // Validación: si no se ingresó ninguna nota válida
  if (!nombre || notasValidas.length === 0) {
    errorMsg.textContent = "Error: Debe ingresar un nombre y al menos una nota válida (entre 0 y 10).";
    errorMsg.style.display = "block";
    return;
  }

  // Agregar nuevo estudiante
  listaEstudiantes.push({
    nombre: nombre,
    notas: notasValidas
  });

  // Limpiar campos del formulario
  inputNombre.value = "";
  inputNotas.value = "";
  inputNombre.focus();

  renderizarUI();
});

/**
 * Recalcula estados dinámicamente si cambia la nota mínima
 */
inputNotaMinima.addEventListener("input", () => {
  renderizarUI();
});

/**
 * Elimina un estudiante por índice
 * @param {number} index 
 */
window.eliminarEstudiante = function(index) {
  listaEstudiantes.splice(index, 1);
  renderizarUI();
};

/**
 * Limpia toda la lista
 */
btnLimpiar.addEventListener("click", () => {
  if (listaEstudiantes.length === 0) return;
  if (confirm("¿Está seguro de que desea limpiar toda la lista de estudiantes?")) {
    listaEstudiantes = [];
    renderizarUI();
  }
});

// Carga inicial al abrir la página
document.addEventListener("DOMContentLoaded", renderizarUI);