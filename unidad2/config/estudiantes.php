<?php
require_once 'conf_base.php';
$conn = getConnection();

// Lógica de búsqueda integrada
$busqueda = trim($_GET['q'] ?? '');
if ($busqueda) {
    $b = $conn->real_escape_string($busqueda);
    $sql = "SELECT * FROM Estudiantes WHERE activo=1 AND (Nombre LIKE '%$b%' OR Apellido LIKE '%$b%') ORDER BY Apellido";
} else {
    $sql = "SELECT * FROM Estudiantes WHERE activo=1 ORDER BY Apellido";
}
$res = $conn->query($sql);
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Gestión de Estudiantes</title>
    <!-- Importación de Pico CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css">
</head>
<body>
    <main class="container">
        <h2>Panel de Estudiantes</h2>
        <hr>
        
        <div class="grid">
            <!-- SECCIÓN 1: FORMULARIO (Columna Izquierda) -->
            <div>
                <article>
                    <header><strong>Agregar Nuevo</strong></header>
                    <form action="insert.php" method="POST">
                        <label>Nombre: <input type="text" name="Nombre" required></label>
                        <label>Apellido: <input type="text" name="Apellido" required></label>
                        <label>Email: <input type="email" name="Email" required></label>
                        <button type="submit">Guardar Estudiante</button>
                    </form>
                </article>
            </div>

            <!-- SECCIÓN 2: BUSCADOR Y TABLA (Columna Derecha) -->
            <div>
                <!-- Buscador -->
                <form action="estudiantes.php" method="GET">
                    <fieldset role="group">
                        <input type="search" name="q" value="<?= htmlspecialchars($busqueda) ?>" placeholder="Buscar por nombre o apellido...">
                        <button type="submit">Buscar</button>
                    </fieldset>
                </form>

                <!-- Tabla de Resultados -->
                <figure>
                    <table class="striped">
                        <thead>
                            <tr>
                                <th>Nombre Completo</th>
                                <th>Email</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php while ($fila = $res->fetch_assoc()): ?>
                            <tr>
                                <td><?= htmlspecialchars($fila['Nombre'] . ' ' . $fila['Apellido']) ?></td>
                                <td><?= htmlspecialchars($fila['Email']) ?></td>
                                <td>
                                    <!-- Botón Eliminar/Editar con estilo secundario -->
                                    <div role="group">
                                        <a href="edit.php?id=<?=  $fila['Id'] ?>"
                                            role="button" class="outline">
                                            Editar
                                        </a>
                                        <a href="eliminate.php?eliminar=<?= $fila['Id'] ?>" 
                                            role="button" class="secondary outline"
                                            onclick="return confirm('¿Eliminar a <?= htmlspecialchars($fila['Nombre']) ?>?')">
                                            Eliminar
                                        </a>
                                    </div>
                                </td>    
                                </td>
                            </tr>
                            <?php endwhile; ?>
                        </tbody>
                    </table>
                </figure>
                <small>Total de registros: <strong><?= $res->num_rows ?></strong></small>
            </div>
        </div>
    </main>
</body>
</html>