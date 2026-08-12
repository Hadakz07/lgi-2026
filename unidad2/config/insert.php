<?php
require_once('conf_base.php');
$mensaje='';
if ($_SERVER['REQUEST_METHOD']==='POST'){
    $nombre= trim($_POST['Nombre']?? '');
    $apellido= trim($_POST['Apellido']?? '');
    $email= trim($_POST['Email']?? '');

    if (empty($nombre) || empty($apellido) || empty($email)){
        $mensaje= 'Datos invalidos.';
    } else{
        $conn= getConnection();
        $nombre= $conn->real_escape_string($_POST['Nombre']);
        $apellido= $conn->real_escape_string($_POST['Apellido']);
        $email= $conn->real_escape_string($_POST['Email']);
        $sql=("INSERT INTO Estudiantes (Nombre,Apellido,Email) VALUES ('$nombre','$apellido','$email')");

        if($conn->query($sql)){
            header('Location: estudiantes.php');
            exit;
        } else{
            $mensaje='Error'.$conn->error;
        }
        $conn->close();
    }
}
?>
<!DOCTYPE html>
<html lang="es">
    <body>
        <?php if ($mensaje):?>
            <p><strong><?=htmlspecialchars($mensaje)?></strong></p>
        <?php endif;?>
        
        <form method="post">
            <label>Nombre: <input type="text" name="Nombre" required></label><br>
            <label>Apellido: <input type="text" name="Apellido" required></label><br>
            <label>Email: <input type="email" name="Email" required></label><br>
            <button type="submit">Agregar estudiante </button>
        </form>
    </body>
</html>