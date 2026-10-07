<?php //api/estudiantes.php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

require_once '../conf_base.php'; 
$conn = getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Buscar por término o listar todos
        $busqueda = trim($_GET['q'] ?? '');
        if ($busqueda !== '') {
            $b = $conn->real_escape_string($busqueda);
            $sql = "SELECT * FROM Estudiantes WHERE Activo=1 AND (Nombre LIKE '%$b%' OR Apellido LIKE '%$b%') ORDER BY Id DESC";
        } else {
            $sql = "SELECT * FROM Estudiantes WHERE Activo=1 ORDER BY Id DESC";
        }
        
        $res = $conn->query($sql);
        $estudiantes = [];

        if ($res) {
            while ($fila = $res->fetch_assoc()) {
                $strNotas = $fila['Notas'] ?? '';
                $notasArray = !empty($strNotas) ? array_map('floatval', explode(',', $strNotas)) : [];
                
                $nombreCompleto = trim(($fila['Nombre'] ?? '') . ' ' . ($fila['Apellido'] ?? ''));

                $estudiantes[] = [
                    'id' => (int)$fila['Id'],
                    'nombre' => $nombreCompleto,
                    'email' => $fila['Email'] ?? '',
                    'notas' => $notasArray
                ];
            }
        }

        echo json_encode($estudiantes);
        break;

    case 'POST':
        // Agregar estudiante sin recargar
        $data = json_decode(file_get_contents("php://input"), true);

        if (!empty($data['nombre']) && isset($data['notas']) && is_array($data['notas'])) {
            $nombreCompleto = trim($data['nombre']);
            
            // Separar Nombre y Apellido
            $partes = explode(' ', $nombreCompleto, 2);
            $nombre = $conn->real_escape_string($partes[0]);
            $apellido = isset($partes[1]) ? $conn->real_escape_string($partes[1]) : '';
            
            // Email enviado o generado automáticamente (ej: juan@gmail.com)
            if (!empty($data['email'])) {
                $email = $conn->real_escape_string(trim($data['email']));
            } else {
                $emailLimpio = preg_replace('/[^a-zA-Z0-9]/', '', strtolower($partes[0]));
                $email = $emailLimpio . '@gmail.com';
            }

            $notasStr = $conn->real_escape_string(implode(',', $data['notas']));

            $sql = "INSERT INTO Estudiantes (Nombre, Apellido, Email, Notas, Activo) VALUES ('$nombre', '$apellido', '$email', '$notasStr', 1)";
            
            if ($conn->query($sql)) {
                echo json_encode(["status" => "success", "message" => "Estudiante creado", "id" => $conn->insert_id]);
            } else {
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => $conn->error]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Datos incompletos"]);
        }
        break;

    case 'PUT':
        // Editar estudiante
        $data = json_decode(file_get_contents("php://input"), true);

        if (!empty($data['id']) && !empty($data['nombre']) && isset($data['notas'])) {
            $id = (int)$data['id'];
            $nombreCompleto = trim($data['nombre']);
            
            $partes = explode(' ', $nombreCompleto, 2);
            $nombre = $conn->real_escape_string($partes[0]);
            $apellido = isset($partes[1]) ? $conn->real_escape_string($partes[1]) : '';
            $notasStr = $conn->real_escape_string(implode(',', $data['notas']));

            if (!empty($data['email'])) {
                $email = $conn->real_escape_string(trim($data['email']));
                $sql = "UPDATE Estudiantes SET Nombre='$nombre', Apellido='$apellido', Email='$email', Notas='$notasStr' WHERE Id=$id";
            } else {
                $sql = "UPDATE Estudiantes SET Nombre='$nombre', Apellido='$apellido', Notas='$notasStr' WHERE Id=$id";
            }

            if ($conn->query($sql)) {
                echo json_encode(["status" => "success", "message" => "Estudiante actualizado"]);
            } else {
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => $conn->error]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Datos incompletos para actualizar"]);
        }
        break;

    case 'DELETE':
        // Eliminar estudiante (marcado lógico con Activo=0)
        $id = isset($_GET['id']) ? (int)$_GET['id'] : null;

        if (!$id) {
            $data = json_decode(file_get_contents("php://input"), true);
            $id = $data['id'] ?? null;
        }

        if ($id) {
            $sql = "UPDATE Estudiantes SET Activo=0 WHERE Id=$id";
            if ($conn->query($sql)) {
                echo json_encode(["status" => "success", "message" => "Estudiante eliminado"]);
            } else {
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => $conn->error]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "ID no proporcionado"]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["status" => "error", "message" => "Método no permitido"]);
        break;
}

$conn->close();
?>