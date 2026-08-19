<?php
require_once 'conf_base.php';

if(isset($_GET['eliminar'])){
    $id= (int)$_GET['eliminar']; //int asegura que sea un numero
    $conn= getConnection();
    $conn->query("UPDATE Estudiantes SET activo=0 WHERE Id=$id");
    header('Location: estudiantes.php?mensaje=eliminado');
    exit;
}
?>