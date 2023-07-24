<?php
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

// Incluir el archivo de conexión a la base de datos
$bd = include_once "connect.php";

$json = json_decode(file_get_contents("php://input"));

// Obtiene los datos del formulario
$id = $json->id;
$title = $json->title;
$description = $json->description;
$style = json_encode($json->style);
$categories = json_encode($json->categories);
$useRange = $json->useRange;
$username = $_GET['username'];

// Validar que el id cumpla con el tamaño máximo y formato permitido
if (empty($id) || strlen($id) > 20 || !preg_match('/^[a-zA-Z0-9ñÑ._-]+$/', $id)) {
    // Manejar el error o enviar una respuesta de error adecuada
    throw new Exception("ID inválida");
}

// Crea la entencia SQL preparada para evitar la inyección de código
$sql = "INSERT INTO APPLICATIONS (id, title, description, style, categories, useRange, username) VALUES (?, ?, ?, ?, ?, ?, ?)";
$stmt = mysqli_prepare($bd, $sql);

// Vincular los valores a los marcadores de posición
mysqli_stmt_bind_param($stmt, "sssssis", $id, $title, $description, $style, $categories, $useRange, $username);


try {
    if (mysqli_stmt_execute($stmt)) {
        $response = array('message' => 'El registro se ha guardado correctamente en la base de datos.');
    } else {
        http_response_code(409);
        $response = array('error' => 'No se ha podido ejecutar la sentencia.');
    }
} catch (mysqli_sql_exception $e) {
	http_response_code(409);
    $response = array('error' => 'Error al intentar crear la aplicación: ' . $e->getMessage());
}

// Cerrar la sentencia y la conexión
mysqli_stmt_close($stmt);
mysqli_close($bd);

echo json_encode($response);
?>