<?php
$alumnos= array(
    ["Ana Garcia", "Sistemas",[8,7,7,8]],
    ["Juan Perez","Redes",[4,5,4,5]],
    ["Maria Lopez","Sitemas",[9,9,10,8]],
    ["Calos Ruiz","Redes",[5,5,6,4]]);

$cantAprobados=0;
$cantDesaprobados=0;

$mejorAlumno="";
$mejorPromedio=-1;

echo "<h2>Listado de Alumnos con Promedio</h2>"."<br>";

//calculo y recorre:

foreach ($alumnos as $alumno){
    $suma_notas= array_sum($alumnos[3]);
}