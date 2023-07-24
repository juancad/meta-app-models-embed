<?php

$id = $_GET['id'];
$username = $_GET['username'];

$ruta = "../users/" . $username . "/" . $id . "/model/";

if (!is_dir($ruta)) {
	mkdir($ruta, 0777, true);
}

// Verificar si se recibieron archivos
if (isset($_FILES['json']) && isset($_FILES['bin'])) {
	// Ruta donde se guardarán los archivos subidos
	
	// sube el json
	if($_FILES['json']['name'] === 'model.json') {
		move_uploaded_file($_FILES['json']['tmp_name'], $ruta . $_FILES['json']['name']);
	} else {
		$response = ['error' => true, 'message' => 'El nombre del archivo JSON no es válido.'];
		echo json_encode($response);
		exit;
	}
	
	// manejar los archivos bin individuales
	$binCount = count($_FILES['bin']['name']);
	
	for ($i = 0; $i < $binCount; $i++) {
		if (preg_match('/^group\d+-shard\d+of\d+\.bin$/', $_FILES['bin']['name'][$i])) {
			move_uploaded_file($_FILES['bin']['tmp_name'][$i], $ruta . $_FILES['bin']['name'][$i]);
		} else {
			$response = ['error' => true, 'message' => 'El nombre del archivo BIN no es válido: ' . $binFilename];
			echo json_encode($response);
			exit;
		}
	 }

	// Respuesta al cliente
	$response = ['success' => true, 'message' => 'Archivos subidos correctamente.'];
	echo json_encode($response);
} else {
  $response = ['error' => false, 'message' => 'No se han recibido archivos.'];
  echo json_encode($response);
}
?>
