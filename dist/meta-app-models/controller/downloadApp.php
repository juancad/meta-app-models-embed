<?php

function comprimirDirectorio($carpetaOrigen, $archivoDestino) {
    $zip = new ZipArchive();
    if ($zip->open($archivoDestino, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
        die('No se pudo crear el archivo ZIP');
    }

    $directorioRaiz = basename($carpetaOrigen);
    $iterador = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($carpetaOrigen, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::SELF_FIRST
    );

    foreach ($iterador as $ruta => $objeto) {
        $rutaLocal = substr($ruta, strlen($carpetaOrigen) + 1);
        if ($objeto->isFile()) {
            $zip->addFile($ruta, $rutaLocal);
        } elseif ($objeto->isDir()) {
            $zip->addEmptyDir($rutaLocal);
        }
    }

    $zip->close();
}

// Obtener la ruta del directorio desde Angular
$data = json_decode(file_get_contents('php://input'), true);
$rutaCodificada = $_GET['ruta'];
$rutaDecodificada = urldecode($rutaCodificada);

// Ruta y nombre de archivo ZIP de destino
$archivoDestino = 'app.zip';

// Comprimir el directorio
comprimirDirectorio($rutaDecodificada, $archivoDestino);

// Enviar el archivo ZIP como respuesta al cliente
header('Content-Type: application/zip');
header('Content-Disposition: attachment; filename="' . basename($archivoDestino) . '"');
header('Content-Length: ' . filesize($archivoDestino));
readfile($archivoDestino);

// Eliminar el archivo ZIP después de la descarga
unlink($archivoDestino);
?>
