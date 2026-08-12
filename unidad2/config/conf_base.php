<?php
//config/database.php
define('DB_HOST','localhost');
define('DB_USER','root');
define('DB_PASS','alumno');
define('DB_NAME','Sistema_Estudiantes');

function getConnection(): mysqli{
    $conn= new mysqli(DB_HOST,DB_USER,DB_PASS,DB_NAME);
    if ($conn->connect_error){
        die('Error: '.$conn->connect_error);
    }
    $conn->set_charset('utf8mb4');
    return $conn;
}
?>