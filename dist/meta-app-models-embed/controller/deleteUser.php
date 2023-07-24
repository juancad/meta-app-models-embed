<?php
header("Access-Control-Allow-Methods: DELETE");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

// Incluir el archivo de conexión a la base de datos
$bd = include_once "connect.php";

$json = json_decode(file_get_contents("php://input"));

// Obtiene los datos

$username = $json->username;
$password = $json->password;

$route = "../users/" . $username;

// Validar que el username cumpla con el tamaño máximo y formato permitido
if (empty($username) || strlen($username) > 20 || !preg_match('/^[a-zA-Z0-9ñÑ._-]+$/', $username)) {
    throw new Exception("Username inválido");
}

$sql = "SELECT password FROM USERS WHERE username = ?";
$stmt = mysqli_prepare($bd, $sql);
mysqli_stmt_bind_param($stmt, "s", $username);
mysqli_stmt_execute($stmt);
mysqli_stmt_bind_result($stmt, $hashedPassword);

if (mysqli_stmt_fetch($stmt)) {
	mysqli_stmt_close($stmt);
	if (password_verify($password, $hashedPassword)) { // La contraseña es válida
		$sql = "DELETE FROM USERS WHERE username=?";
		$stmt = mysqli_prepare($bd, $sql);
		mysqli_stmt_bind_param($stmt, "s", $username);
		
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
						$response = array('message' => 'El registro y el directorio se han eliminado correctamente del servidor.');
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
			$response = array('error' => 'No se ha podido ejecutar la sentencia.');
		}
	}
	else {
		http_response_code(401); 
		$response = array('error' => 'Las credenciales no son válidas: ' . mysqli_error($bd));
	}
}
else {
	http_response_code(401); 
	$response = array('error' => 'Las credenciales no son válidas: ' . mysqli_error($bd));
}
	
	
	
	
// Cerrar la sentencia y la conexión
mysqli_stmt_close($stmt);
mysqli_close($bd);

echo json_encode($response); // Devolver respuesta en formato JSON
?>