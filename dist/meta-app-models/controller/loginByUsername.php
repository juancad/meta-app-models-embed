<?php
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

$bd = include_once "connect.php";
$request = file_get_contents('php://input');
$body = json_decode($request);
$username = $body->id;
$password = $body->password;

$sql = "SELECT password FROM USERS WHERE username = ?";
$stmt = mysqli_prepare($bd, $sql);
mysqli_stmt_bind_param($stmt, "s", $username);
mysqli_stmt_execute($stmt);
mysqli_stmt_bind_result($stmt, $hashedPassword);

if (mysqli_stmt_fetch($stmt)) {
	if (password_verify($password, $hashedPassword)) { // La contraseña es válida
		mysqli_stmt_close($stmt); // Cerrar la sentencia preparada anterior

		// Crear la sentencia SQL preparada para evitar la inyección de código
		$sql = "SELECT * FROM USERS WHERE username=?";
		$stmt = mysqli_prepare($bd, $sql);
		mysqli_stmt_bind_param($stmt, "s", $username);
		// Ejecutar la consulta preparada
		mysqli_stmt_execute($stmt);

		// Obtener el resultado de la consulta
		$result = mysqli_stmt_get_result($stmt);

		$response = array();
		if ($row = mysqli_fetch_assoc($result)) {
			// Obtener la lista de aplicaciones del usuario
			$apps = array();

			$appsQuery = mysqli_query($bd, "SELECT * FROM APPLICATIONS WHERE username = '" . $row['username'] . "'");
			while ($app = mysqli_fetch_assoc($appsQuery)) {
				$formattedApp = array(
					"id" => $app["id"],
					"title" => $app["title"],
					"description" => $app["description"],
					"style" => json_decode($app["style"], true),
					"categories" => json_decode($app["categories"], true),
					"useRange" => (bool)$app["useRange"],
				);
				$apps[] = $formattedApp;
			}

			$response = array(
				"username" => $row["username"],
				"email" => $row["email"],
				"apps" => $apps
			);

			if (empty($response)) {
				http_response_code(401); 
				$response = array('error' => 'Las credenciales no son válidas: ' . mysqli_error($bd));
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
}
else {
	http_response_code(401); 
	$response = array('error' => 'Las credenciales no son válidas: ' . mysqli_error($bd));
}
	
// Cerrar la sentencia y la conexión
mysqli_stmt_close($stmt);
mysqli_close($bd);

echo json_encode($response);
?>