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
