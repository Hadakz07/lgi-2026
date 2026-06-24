<?php
    //leer y limpiar
    $nombre= isset($_POST['name']) ? trim($_POST['name']) : '';
    $nota1= isset($_POST['nt1']) ? floatval($_POST['nt1']) : 0;
    $nota2= isset($_POST['nt2']) ? floatval($_POST['nt2']) : 0;
    $nota3= isset($_POST['nt3']) ? floatval($_POST['nt3']) : 0;
    $nota4= isset($_POST['nt4']) ? floatval($_POST['nt4']) : 0;

    //suma
    $suma= $nota1 + $nota2 + $nota3 + $nota4;
    $promedio= $suma/4;
    $promedio_formato= number_format($promedio,2);
    
    //Mostar resultados:
    if ($promedio >=6){
        $estado= '<span style="color: green;">Aprobado</span>';
    }else{
        $estado= '<span style="color: ref;">Desaprobado</span>';
        }
    
    //Salida
    echo "<h2>Resultados</h2>";
    echo "Alumno: " . htmlspecialchars($nombre) . "<br>";
    echo "Notas: $nota1, $nota2, $nota3, $nota4<br>";
    echo "Promedio: $promedio_formato<br>";
    echo "Estado: $estado<br>";
    