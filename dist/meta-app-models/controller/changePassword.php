<?php
header("Access-Control-Allow-Methods: PUT");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

// Incluir el archivo de conexión a la base de datos
$bd = include_once "connect.php";

$json = json_decode(file_get_contents("php://input"));

// Obtener los datos del formulario
$username = $json->username;
$password = $json->password;
$newpassword = $json->newpassword;

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
		// cambio de contraseña
		if(strlen($newpassword) > 0) {
			$hashedPassword = password_hash($newpassword, PASSWORD_DEFAULT);
			$sql = "UPDATE USERS SET password=? WHERE username=?";
			$stmt = mysqli_prepare($bd, $sql);
			mysqli_stmt_bind_param($stmt, "ss", $hashedPassword, $username);
			try {
				if(mysqli_stmt_execute($stmt)) {
					$response = array('message' => 'El registro se ha actualizado correctamente en la base de datos.');
				}
				else {
					http_response_code(409);
					$response = array('error' => 'Error al intentar actualizar el usuario: ' . $e->getMessage());
				}
			} catch (mysqli_sql_exception $e) {
				http_response_code(409);
				$response = array('error' => 'Error al intentar actualizar el usuario: ' . $e->getMessage());
			}
			// Cerrar la conexión
			mysqli_stmt_close($stmt);
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

mysqli_close($bd);

echo json_encode($response);
?>
