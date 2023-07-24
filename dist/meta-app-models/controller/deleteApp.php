<?php
header("Access-Control-Allow-Methods: DELETE");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

// Incluir el archivo de conexión a la base de datos
$bd = include_once "connect.php";

// Obtiene los datos

$id = $_GET['id'];
$username = $_GET['username'];

$route = "../users/" . $username . "/" . $id;

// Validar que el id cumpla con el tamaño máximo y formato permitido
if (empty($id) || strlen($id) > 20 || !preg_match('/^[a-zA-Z0-9ñÑ._-]+$/', $id)) {
    throw new Exception("ID inválida");
}
// Validar que el username sea correcto
if (empty($username) || strlen($username) > 20 || !preg_match('/^[a-zA-Z0-9ñÑ._-]+$/', $username)) {
    // Manejar el error o enviar una respuesta de error adecuada
    throw new Exception("username inválido");
}

// Sanitizar el valor del id
$id = mysqli_real_escape_string($bd, $id);

// Crea la entencia SQL preparada para evitar la inyección de código
$sql = "DELETE FROM APPLICATIONS WHERE username=? AND id=?";
$stmt = mysqli_prepare($bd, $sql);

// Vincular los valores a los marcadores de posición
mysqli_stmt_bind_param($stmt, "ss", $username, $id);

// Ejecuta la sentencia

if (mysqli_stmt_execute($stmt)) {
	if (is_dir($route)) { // Verifica si la carpeta existe
	    $archivos = new RecursiveIteratorIterator(
			new RecursiveDirectoryIterator($route, RecursiveDirectoryIterator::SKIP_DOTS),
			RecursiveIteratorIterator::CHILD_FIRST
		);
	
		foreach ($archivos as $archivo) {
			if ($archivo->isDir()) {
				rmdir($archivo->getRealPath());
			} else {
				unlink($archivo->getRealPath());
			}
		}
		
		if (rmdir($route)) { // Elimina la carpeta
			if (mysqli_stmt_execute($stmt)) {
				$response = array('message' => 'El registro se ha eliminado correctamente de la base de datos.');
			}
			else {
				$response = array('error' => 'Error al eliminar el registro: ' . mysqli_error($bd));
			}
		}
		else {
			$response = array('message' => 'El registro se ha eliminado correctamente de la base de datos pero la carpeta no se ha podido eliminar.');
		}
	}
	else {
		$response = array('message' => 'El registro se ha eliminado correctamente de la base de datos pero la carpeta no existe.');
	}
}
else {
	http_response_code(409);
	$response = array('error' => 'Error al eliminar el registro: ' . mysqli_error($bd));
}

// Cerrar la sentencia y la conexión
mysqli_stmt_close($stmt);
mysqli_close($bd);

echo json_encode($response); // Devolver respuesta en formato JSON
?>