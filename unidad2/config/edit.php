<?php
require_once 'conf_base.php';
$conn = getConnection();

// 1. Validar que recibimos un ID por la URL
$id = $_GET['id'] ?? null;
if (!$id) {
    header('Location: estudiantes.php');
    exit;
}

$id = (int)$id; // Aseguramos que sea un número

// 2. Si el formulario fue enviado (POST), procesamos la actualización
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nombre = $conn->real_escape_string($_POST['Nombre']);
    $apellido = $conn->real_escape_string($_POST['Apellido']);
    $email = $conn->real_escape_string($_POST['Email']);
    
    $sql_update = "UPDATE Estudiantes SET Nombre='$nombre', Apellido='$apellido', Email='$email' WHERE Id=$id";
    
    if ($conn->query($sql_update)) {
        header('Location: estudiantes.php?mensaje=actualizado');
        exit;
    } else {
        $error = "Error al actualizar: " . $conn->error;
    }
}

// 3. Obtener los datos actuales del estudiante para rellenar el formulario
$sql = "SELECT * FROM Estudiantes WHERE Id=$id AND activo=1";
$res = $conn->query($sql);
$estudiante = $res->fetch_assoc();

// Si el estudiante no existe o fue eliminado, lo devolvemos al panel
if (!$estudiante) {
    header('Location: estudiantes.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Editar Estudiante</title>
    <!-- Importación de Pico CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css">
</head>
<body>
    <main class="container">
        <article>
            <header>
                <h2>Editar Estudiante</h2>
            </header>
            
            <?php if(isset($error)): ?>
                <p style="color: red;"><?= htmlspecialchars($error) ?></p>
            <?php endif; ?>

            <!-- El formulario apunta a este mismo archivo y envía el ID en la URL -->
            <form action="edit.php?id=<?= $id ?>" method="POST">
                <label>
                    Nombre:
                    <!-- Usamos el atributo 'value' para rellenar el input con el dato actual -->
                    <input type="text" name="Nombre" value="<?= htmlspecialchars($estudiante['Nombre']) ?>" required>
                </label>
                
                <label>
                    Apellido:
                    <input type="text" name="Apellido" value="<?= htmlspecialchars($estudiante['Apellido']) ?>" required>
                </label>
                
                <label>
                    Email:
                    <input type="email" name="Email" value="<?= htmlspecialchars($estudiante['Email']) ?>" required>
                </label>
                
                <div class="grid">
                    <!-- Botón para cancelar y volver -->
                    <a href="estudiantes.php" role="button" class="secondary outline">Cancelar</a>
                    <!-- Botón para guardar -->
                    <button type="submit">Guardar Cambios</button>
                </div>
            </form>
        </article>
    </main>
</body>
</html>