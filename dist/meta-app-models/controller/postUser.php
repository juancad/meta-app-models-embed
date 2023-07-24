<?php
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization");
header("Access-Control-Allow-Origin: *");

// Incluir el archivo de conexión a la base de datos
$bd = include_once "connect.php";

$json = json_decode(file_get_contents("php://input"));

// Obtiene los datos del formulario
$username = $json->user->username;
$email = $json->user->email;
$password = $json->password;
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);
$route = "../users/" . $username;

// Validar que el username cumpla con el tamaño máximo y formato permitido
if (empty($username) || strlen($username) > 20 || !preg_match('/^[a-zA-Z0-9ñÑ._-]+$/', $username)) {
    // Manejar el error o enviar una respuesta de error adecuada
    throw new Exception("Username inválido");
}

// Crear la sentencia SQL preparada para evitar la inyección de código
$sql = "INSERT INTO USERS (username, email, password) VALUES (?, ?, ?)";
$stmt = mysqli_prepare($bd, $sql);

// Vincular los valores a los marcadores de posición
mysqli_stmt_bind_param($stmt, "sss", $username, $email, $hashedPassword);


try {
    if (mysqli_stmt_execute($stmt)) {
		if (!is_dir($route)) {
			mkdir($route, 0777, true);
		}
        $response = array('message' => 'El registro se ha guardado correctamente en la base de datos.');
    } else {
        http_response_code(409);
        $response = array('error' => 'No se ha podido ejecutar la sentencia.');
    }
} catch (mysqli_sql_exception $e) {
	http_response_code(409);
    $response = array('error' => 'Error al intentar crear el usuario: ' . $e->getMessage());
}

// Cerrar la sentencia y la conexión
mysqli_stmt_close($stmt);
mysqli_close($bd);

echo json_encode($response);
?>