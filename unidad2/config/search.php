<?php
require_once 'conf_base.php';

$conn= getConnection();

$busqueda= trim($_GET['q']?? '');

if($busqueda){
    $b= $conn->real_escape_string($busqueda);
    $sql= "SELECT * FROM Estudiantes WHERE activo=1 AND (Nombre LIKE '%$b%') ORDER BY Apellido";
}else{
    $sql= 'SELECT * FROM Estudiantes WHERE activo=1 ORDER BY Apellido';
}

$resultado= $conn->query($sql);
?>

<form method="get">
    <input type="text" name="q" value="<?= htmlspecialchars($busqueda) ?>"
        placeholder="Buscar por nombre o apellido">
    <button type="submit">Buscar</button>
    <php if($busqueda):?>
        <a href="?">Ver todos</a>
    </php endif;?>
</form>
<p>Resultados: <?= $resultado->num_rows ?></p>

<!--require_once 'estudiantes.php';(tabla)-->
