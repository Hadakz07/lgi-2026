<?php
header('Content-Type: application/json');
require_once 'conexion.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $buscar = $_GET['q'] ?? '';
        if ($buscar !== '') {
            $stmt = $pdo->prepare("SELECT * FROM productos WHERE nombre LIKE ? ORDER BY id DESC");
            $stmt->execute(["%$buscar%"]);
        } else {
            $stmt = $pdo->query("SELECT * FROM productos ORDER BY id DESC");
        }
        echo json_encode($stmt->fetchAll());
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);

        // Validar si es una venta múltiple desde el carrito
        if (isset($data['accion']) && $data['accion'] === 'registrar_venta') {
            $items = $data['items'] ?? [];
            
            if (empty($items)) {
                http_response_code(400);
                echo json_encode(['error' => 'El carrito está vacío']);
                exit;
            }

            try {
                // Iniciar transacción para asegurar integridad de datos
                $pdo->beginTransaction();

                $totalVenta = 0;

                // 1. Validar stock de todos los productos antes de procesar
                foreach ($items as $item) {
                    $stmt = $pdo->prepare("SELECT stock, precio, nombre FROM productos WHERE id = ?");
                    $stmt->execute([$item['id']]);
                    $prod = $stmt->fetch();

                    if (!$prod) {
                        throw new Exception("Producto con ID {$item['id']} no encontrado.");
                    }

                    if ($prod['stock'] < $item['cantidad']) {
                        throw new Exception("Stock insuficiente para el producto: {$prod['nombre']}. Stock disponible: {$prod['stock']}");
                    }

                    $totalVenta += $prod['precio'] * $item['cantidad'];
                }

                // 2. Insertar en la tabla 'ventas'
                $stmt = $pdo->prepare("INSERT INTO ventas (total) VALUES (?)");
                $stmt->execute([$totalVenta]);
                $ventaId = $pdo->lastInsertId();

                // 3. Registrar el detalle y descontar el stock de cada producto
                foreach ($items as $item) {
                    $stmt = $pdo->prepare("SELECT precio FROM productos WHERE id = ?");
                    $stmt->execute([$item['id']]);
                    $prod = $stmt->fetch();
                    $precioUnitario = $prod['precio'];

                    // Insertar detalle venta
                    $stmtDetalle = $pdo->prepare("INSERT INTO detalle_venta (venta_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)");
                    $stmtDetalle->execute([$ventaId, $item['id'], $item['cantidad'], $precioUnitario]);

                    // Descontar stock
                    $stmtStock = $pdo->prepare("UPDATE productos SET stock = stock - ? WHERE id = ?");
                    $stmtStock->execute([$item['cantidad'], $item['id']]);
                }

                // Confirmar transacción
                $pdo->commit();
                echo json_encode(['mensaje' => '¡Venta registrada con éxito!', 'venta_id' => $ventaId]);

            } catch (Exception $e) {
                // Revertir cambios si ocurre un error
                $pdo->rollBack();
                http_response_code(400);
                echo json_encode(['error' => $e->getMessage()]);
            }
            exit;
        }
        //creacion normal del producto
        if (!isset($data['nombre'], $data['precio'], $data['stock'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Campos incompletos']);
            exit;
        }

        // Validación en servidor (Nivel 2)
        if ($data['precio'] < 0 || $data['stock'] < 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Precio y stock no pueden ser negativos']);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO productos (nombre, precio, stock) VALUES (?, ?, ?)");
        $stmt->execute([$data['nombre'], $data['precio'], $data['stock']]);
        echo json_encode(['id' => $pdo->lastInsertId(), 'mensaje' => 'Producto agregado con éxito']);
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['id'], $data['nombre'], $data['precio'], $data['stock'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Campos incompletos']);
            exit;
        }

        if ($data['precio'] < 0 || $data['stock'] < 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Precio y stock no pueden ser negativos']);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE productos SET nombre = ?, precio = ?, stock = ? WHERE id = ?");
        $stmt->execute([$data['nombre'], $data['precio'], $data['stock'], $data['id']]);
        echo json_encode(['mensaje' => 'Producto actualizado']);
        break;


    case 'PATCH':
        // Desafío Nivel 3: Ajuste rápido de stock (+1 / -1)
        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['id'], $data['cambio'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Parámetros insuficientes']);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE productos SET stock = GREATEST(0, stock + ?) WHERE id = ?");
        $stmt->execute([$data['cambio'], $data['id']]);
        echo json_encode(['mensaje' => 'Stock actualizado']);
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'ID no proporcionado']);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM productos WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['mensaje' => 'Producto eliminado']);
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Método no permitido']);
        break;
}