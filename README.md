# Meta-aplicación web para el incrustado de modelos de IA

Este proyecto se trata de una meta-aplicación para incrustar modelos de IA para la clasificación de imágenes de TensorFlow.js

La meta-aplicación permite subir modelos de IA previamente entrenados y optimizados, y crear una aplicación web que utilice dicho modelo para predecir las imágenes de la cámara web del dispositivo. Se realizará una transformación de la imagen de la cámara a los parámetros requeridos por el tensor de entrada y se predecirá el resultado preiódicamente.

## Directorios del proyecto

- En el directorio [dist/meta-app-models-embed](dist/meta-app-models-embed) se encuentra el desplegable de la aplicación con los archivos php para la conexión con la base de datos.
- En el directorio [src](src) se encuentra el código fuente.
- El archivo [dist/base_de_datos.sql](dist/base_de_datos.sql) contiene las tablas de la base de datos de la aplicación.

## Cómo desplegar el proyecto 

Descargar los archivos necesarios para desplegar la aplicación del directorio `dist`.

- Importar la base de datos en MySQL, archivo `base_de_datos.sql`.
- Copiar el directorio `meta-app-models-embed` en un servidor web Apache. Asegurarse de haber copiado el archivo `.htaccess`, en Linux aparecerá como oculto.
- Cambiar los datos de conexión con la base de datos en el archivo `meta-app-models-embed/controller/connect.php`.
- Habilitar la compresión de archivos .zip en el servidor.

Para que el enrutamiento de la aplicación funcione correctamente en un servidor Apache:

- Ir a `/etc/apache2/apache2.conf`
  
  Buscar:
  
      <Directory /var/www/>
          Options Indexes FollowSymLinks
          AllowOverride None
          Require all granted
      </Directory>
  
    Y sustituirlo por:
  
      <Directory /var/www/>
          Options Indexes FollowSymLinks
          AllowOverride All
          Require all granted
      </Directory>
    
- Ejecutar el comando: `sudo a2enmod rewrite`.
  
## Importar en el editor

El proyecto ha sido desarrollado en Angular, utilizando como IDE: Visual Studio Code. Para importarlo se debe:

- Tener instalado Node.js: `https://nodejs.org/es/download/`
- Tener instalado Angular, mediante el comando: `npm install -g @angular/cli`
- Importar el proyecto e instalar las dependencias del fichero `package.json` usando el comando: `npm install`
- inicia el servidor de desarrollo con el comando: `ng serve`
- Abrir el enlace `http://localhost:4200` en el navegador.

## Muestra del proyecto

La meta-aplicación permite el incrustado de modelos de TensorFlow.js Para poder importarlos se debe de exportar un modelo de Keras como modelo de TensorFlow.js siguiendo el tutorial: https://www.tensorflow.org/js/tutorials/conversion/import_keras?hl=es-419

Una vez descargado el modelo de TensorFlow.js se dispondrá de un archivo model.json y uno o varios archivos binarios, que se pueden subir a la meta-aplicación en el creador de aplicaciones.

![crearaplicacion](https://github.com/juancad/meta-app-models-embeb/assets/91132611/75b4090b-e4e6-427a-9dae-64c9d061b812)

Una vez subido el modelo, se abrirá un editor de aplicaciones. En el editor se puede cambiar el título, la descripción, categorías del modelo y el estilo (colores, fuente, alineación...). En el editor se puede ver una vista previa que muestra en tiempo real cómo se ve la aplicación con las modificaciones realizadas por el usuario.

![editorapps](https://github.com/juancad/meta-app-models-embeb/assets/91132611/714832a2-59a7-43df-863c-da861eacad7a)

En el menú de inicio se muestra un listado con las aplicaciones creadas. Al seleccionar una aplicación creada se muestra su vista previa. Desde la lista se permite la descarga de la aplicación, vista desde el navegador y eliminación de la misma.

![listaapps](https://github.com/juancad/meta-app-models-embeb/assets/91132611/08e41d9f-db1d-405e-9346-78d62afa0f7b)
