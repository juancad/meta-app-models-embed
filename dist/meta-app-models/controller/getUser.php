<?php
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

$bd = include_once "connect.php";

// Obtener el nombre de usuario
$username = $_GET['username'];

// Validar que el username sea correcto
if (empty($username) || strlen($username) > 20 || !preg_match('/^[a-zA-Z0-9ñÑ._-]+$/', $username)) {
    // Manejar el error o enviar una respuesta de error adecuada
    throw new Exception("username inválido");
} else {
    // Crear la sentencia SQL preparada para evitar la inyección de código
    $sql = "SELECT email, username FROM USERS WHERE username=?";
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
			http_response_code(404);
			$response = array('error' => 'No se encontraron datos para la consulta: ' . mysqli_error($bd));
        }
    } else {
		http_response_code(404); 
		$response = array('error' => 'No se encontraron datos para la consulta: ' . mysqli_error($bd));
	}
}

mysqli_stmt_close($stmt);
mysqli_close($bd);

echo json_encode($response);
?>
