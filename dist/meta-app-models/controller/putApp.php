<?php
header("Access-Control-Allow-Methods: PUT");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

// Incluir el archivo de conexión a la base de datos
$bd = include_once "connect.php";

$json = json_decode(file_get_contents("php://input"));

// Obtiene los datos
$oldid = $_GET['oldid'];
$id = $json->id;
$title = $json->title;
$description = $json->description;
$style = json_encode($json->style);
$categories = json_encode($json->categories);
$useRange = $json->useRange;
$username = $_GET['username'];

$route = "../users/" . $username . "/" . $oldid; // Ruta de la carpeta
$newRoute = "../users/" . $username . "/" . $id; // Nueva carpeta ruta

// Validar que la newid y el id cumpla con el tamaño máximo y formato permitido
if (empty($oldid) || strlen($oldid) > 20 || !preg_match('/^[a-zA-Z0-9ñÑ._-]+$/', $oldid)) {
    // Manejar el error o enviar una respuesta de error adecuada
    throw new Exception("ID inválida");
}
if (empty($id) || strlen($id) > 20 || !preg_match('/^[a-zA-Z0-9ñÑ._-]+$/', $id)) {
    // Manejar el error o enviar una respuesta de error adecuada
    throw new Exception("nueva ID inválida");
}

// Crea la entencia SQL preparada para evitar la inyección de código
$sql = "UPDATE APPLICATIONS SET id=?, title=?, description=?, style=?, categories=?, useRange=?, username=? WHERE id=?";
$stmt = mysqli_prepare($bd, $sql);
// Vincular los valores a los marcadores de posición
mysqli_stmt_bind_param($stmt, "sssssiss", $id, $title, $description, $style, $categories, $useRange, $username, $oldid);

try {
    if (mysqli_stmt_execute($stmt)) {
		rename($route, $newRoute); // cambia el nombre de la carpeta de la app
        $response = array('message' => 'El registro se ha guardado correctamente en la base de datos.');
    } else {
        http_response_code(409);
        $response = array('error' => 'No se ha podido ejecutar la sentencia.');
    }
} catch (mysqli_sql_exception $e) {
	http_response_code(409);
    $response = array('error' => 'Error al intentar actualizar el usuario: ' . $e->getMessage());
}

// Cerrar la sentencia y la conexión
mysqli_stmt_close($stmt);
mysqli_close($bd);

echo json_encode($response);
?>
