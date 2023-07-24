<?php
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

$bd = include_once "connect.php";

// Obtener la ID de la configuración desde la URL
$id = $_GET['id'];
$username = $_GET['username'];

// Validar que el id cumpla con el tamaño máximo y formato permitido
if (empty($id) || strlen($id) > 20 || !preg_match('/^[a-zA-Z0-9ñÑ._-]+$/', $id)) {
    throw new Exception("ID inválida");
}

// Validar que el username cumpla con el tamaño máximo y formato permitido
if (empty($username) || strlen($username) > 20 || !preg_match('/^[a-zA-Z0-9ñÑ._-]+$/', $username)) {
    throw new Exception("Username inválido");
}

// Crea la entencia SQL preparada para evitar la inyección de código
$sql = "SELECT * FROM APPLICATIONS WHERE username = ? AND id = ?";
$stmt = mysqli_prepare($bd, $sql);

// Vincular los valores a los marcadores de posición
mysqli_stmt_bind_param($stmt, "ss", $username, $id);

// Ejecutar la consulta preparada
mysqli_stmt_execute($stmt);

// Obtener el resultado de la consulta
$result = mysqli_stmt_get_result($stmt);

$response = array();
if ($row = mysqli_fetch_assoc($result)) {
    $response = array(
        "id" => $row["id"],
        "title" => $row["title"],
        "description" => $row["description"],
        "style" => json_decode($row["style"], true),
        "categories" => json_decode($row["categories"], true),
        "useRange" => (bool) $row["useRange"],
        // "username" => $row["username"]
    );
} else {
	http_response_code(404);
	$response = array('error' => 'No se encontraron datos para la consulta: ' . mysqli_error($bd));
}

mysqli_stmt_close($stmt);
mysqli_close($bd);

echo json_encode($response);
?>
