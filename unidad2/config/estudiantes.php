<?php
require_once 'conf_base.php';
$conn= getConnection();
$res= $conn->query('SELECT * FROM Estudiantes WHERE activo=1 ORDER BY Apellido');
?>
<table>
    <thead><tr><th>Nombre</th><th>Email</th></tr></thead>
    <tbody>
    <?php while ($f= $res->fetch_assoc()): ?>
        <tr>
            <td><?=  htmlspecialchars($f['Nombre'].' '.$f['Apellido']) ?></td>
            <td><?=  htmlspecialchars($f['Email']) ?></td>
        </tr>
    <?php endwhile; ?>
    </tbody>
</table>
<p>Total: <?= $res->num_rows ?> Estudiantes</p>