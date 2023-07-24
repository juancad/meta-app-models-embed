<?php
$id = $_GET['id'];
$username = $_GET['username'];
$route = "../users/" . $username . "/" . $id;

// Si no existe el directorio se crea
if (!is_dir($route)) {
	mkdir($route, 0777, true);
}

// Guarda los archivos en el directorio creado
move_uploaded_file($_FILES['indexFile']['tmp_name'], $route . '/index.html');
move_uploaded_file($_FILES['cssFile']['tmp_name'], $route . '/styles.css');
move_uploaded_file($_FILES['jsFile']['tmp_name'], $route . '/script.js');
?>