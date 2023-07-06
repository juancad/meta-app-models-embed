import { Injectable } from '@angular/core';
import { Application } from '../models/application.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { Align } from '../models/style.model';

@Injectable({
  providedIn: 'root'
})
/**
 * Servicio para consumir la API y guardar el usuario que ha iniciado sesión en la aplicación.
 */
export class AppsService {
  baseUrl: string;
  user: User = null;
  private loggedInKey = 'loggedInUser'; // para las cookies que contienen el usuario que ha iniciado sesión

  constructor(private http: HttpClient) {
    this.baseUrl = "."; // url de la app en el servidor
    const storedUser = localStorage.getItem(this.loggedInKey); // carga el almacenado en las cookies
    this.user = storedUser ? JSON.parse(storedUser) : null;
  }

  /**
   * Guarda el usuario en las cookies.
   */
  saveCoockies() {
    localStorage.setItem(this.loggedInKey, JSON.stringify(this.user));
  }

  /**
   * Inicio de sesión del usuario.
   * @param id identificador del usuario, puede ser username o email
   * @param password contraseña del usuario
   * @param type true si el identificador es username o false si es email
   * @returns Observable con la repsuesta de la API conteniendo el usuario que ha iniciado sesión
   */
  login(id: string, password: string, type: boolean): Observable<User> {
    let url = this.baseUrl;
    const body = { id: id, password: password };

    if (type) {
      url += "/controller/loginByUsername.php";
    }
    else {
      url += "/controller/loginByEmail.php";
    }

    return this.http.post<User>(url, body);
  }

  /**
   * Cierra la sesión del usuario, eliimna la instancia y los datos del usuario de las cookies.
   */
  logout(): void {
    this.user = null;
    localStorage.removeItem(this.loggedInKey);
  }

  /**
   * Registra un nuevo usuario en la aplicación.
   * @param user datos del usuario a registrar
   * @param password contraseña del usuario
   * @returns Observable con la respuesta de la API conteniendo el usuario que se ha registrado
   */
  register(user: User, password: string): Observable<User> {
    const body = { user, password: password };
    return this.http.post<User>(this.baseUrl + "/controller/postUser.php", JSON.stringify(body));
  }

  /**
   * Permite obtener los datos del usuario actualizados de la base de datos.
   * @returns Observable con la respuesta de la API conteniendo el usuario que se ha obtenido
   */
  getUser(): Observable<User> {
    return this.http.get<User>(this.baseUrl + "/controller/getUser.php?username=" + this.user.username);
  }

  /**
   * Actualiza los datos de un usuario del servidor. 
   * @param newusername nuevo username
   * @param newemail nueva contraseña
   * @param password contraseña actual del usuario
   * @returns Observable con la respuesta de la API
   */
  putUser(newusername: string, newemail: string, password: string) {
    const body = { user: this.user, newusername: newusername, newemail: newemail, password: password };
    return this.http.put(this.baseUrl + "/controller/putUser.php", JSON.stringify(body));
  }

  /**
   * Elimina todos los datos del usuario del servidor.
   * @param password contraseña del usuario
   * @returns Observable con la respuesta de la API
   */
  deleteUser(password: string) {
    const body = { username: this.user.username, password: password };
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(body)
    };

    return this.http.delete(this.baseUrl + "/controller/deleteUser.php", httpOptions);
  }

  /**
   * Cambia la contraseña del usuario en la base de datos.
   * @param password contraseña actual
   * @param newpassword nueva contraseña
   * @returns Observable con la respuesta de la API
   */
  changePassword(password: string, newpassword: string) {
    const body = { username: this.user.username, password: password, newpassword: newpassword };
    return this.http.put(this.baseUrl + "/controller/changePassword.php", JSON.stringify(body));
  }

  /**
   * Permite obtener los datos de una aplicación por su id
   * @param id identificador de la aplicación a obtener
   * @returns Observable con la respuesta de la API conteniendo la aplicación que se ha obtenido
   */
  getApp(id: string): Observable<Application> {
    return this.http.get<Application>(this.baseUrl + "/controller/getApp.php?id=" + id + "&username=" + this.user.username);
  }

  /**
   * Añade una nueva aplicación en la base de datos.
   * @param app aplicación a añadir
   * @returns Observable con la respuesta de la API
   */
  postApp(app: Application) {
    return this.http.post(this.baseUrl + "/controller/postApp.php?username=" + this.user.username, JSON.stringify(app));
  }

  /**
   * Actualiza una aplicación de la base de datos.
   * @param app nuevos datos de la aplicación
   * @param oldid actual id de la aplicación a actualizar
   * @returns Observable con la respuesta de la API
   */
  putApp(app: Application, oldid: string) {
    return this.http.put(this.baseUrl + "/controller/putApp.php?oldid=" + oldid + "&username=" + this.user.username, JSON.stringify(app));
  }

  /**
   * Elimina una aplicación del servidor.
   * @param id identificador de la aplicación a eliminar
   * @returns Observable con la respuesta de la API
   */
  deleteApp(id: string) {
    return this.http.delete(this.baseUrl + "/controller/deleteApp.php?id=" + id + "&username=" + this.user.username);
  }

  /**
   * Sube los archivos de la aplicación al servidor en el directorio .../username/appid 
   * Llama a la función que genera cada tipo de archivo.
   * @param app datos de la aplicación
   * @returns Observable con la respuesta de la API
   */
  uploadAppFiles(app: Application) {
    const html = this.createHTML(app);
    const css = this.createCSS(app);
    const js = this.createJS(app);
    const formData = new FormData();
    const headers = new HttpHeaders();

    formData.append('indexFile', html, html.name);
    formData.append('cssFile', css, css.name);
    formData.append('jsFile', js, js.name);

    return this.http.post(this.baseUrl + "/controller/uploadAppFiles.php?id=" + app.id + "&username=" + this.user.username, formData, { headers });
  }

  /**
   * Sube los archivos del modelo al servidor en el directorio .../username/appid/model
   * @param id identificador de la aplicación
   * @param json archivos json a subir
   * @param bin archivos binarios a subir
   * @returns 
   */
  uploadModelFIles(id: string, json: File, bin: FileList) {
    const formData = new FormData();
    formData.append('json', json, json.name);

    for (let i = 0; i < bin.length; i++) {
      formData.append('bin[]', bin[i], bin[i].name);
    }

    return this.http.post(this.baseUrl + "/controller/uploadModelFiles.php?id=" + id + "&username=" + this.user.username, formData);
  }

  /**
   * Permite descargar los archivos del directorio .../username/appid del servidor en formato .zip
   * @param id identificador de la aplicación a descargar
   */
  downloadApp(id: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const options = { headers: headers, responseType: 'blob' as 'json' };
    const rutaDirectorio = "../users/" + this.user.username + "/" + id;
    const rutaCodificada = encodeURIComponent(rutaDirectorio);

    this.http.get(this.baseUrl + `/controller/downloadApp.php?ruta=${rutaCodificada}`, options)
      .subscribe((response: any) => {
        const blob = new Blob([response], { type: 'application/zip' });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.download = 'app.zip';
        anchor.href = url;
        anchor.click();
      });
  }

  /**
   * Permite abrir la ruta de una aplicación en una pestaña nueva del navegador.
   * @param id identificador de la aplicación a abrir
   */
  view(id: string) {
    window.open(`${this.baseUrl}/users/${this.user.username}/${id}/index.html`, "_blank");
  }

  /**
   * Genera el archivo HTML de la aplicación.
   * @param app datos aplicación de la cual generar el HTML
   * @returns fichero con el título y contenido del HTML de la aplicación
   */
  createHTML(app: Application): File {
    const HTMLContent = "<!DOCTYPE html>\n" +
      "<html>\n" +
      "\t<head>\n" +
      "\t\t<meta charset=\"UTF-8\">\n" +
      "\t\t<link rel=\"stylesheet\" href=\"styles.css\">\n" +
      "\t</head>\n" +
      "\n" +
      "\t<body>\n" +
      "\t\t" + app.title + "\n" +
      "\t\t<div id=\"cam\">\n" +
      "\t\t\t<video id=\"video\" autoplay loop muted playsinline hidden></video>\n" +
      "\t\t\t<canvas id=\"canvas\"></canvas>\n" +
      "\t\t\t<button id=\"rotateCamera\" aria-label=\"Rotar cámara\" onclick=\"rotateCamera();\">\n" +
      "\t\t\t\t<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"25\" height=\"25\" fill=\"currentColor\" class=\"bi bi-arrow-repeat\" viewBox=\"0 0 16 16\">\n" +
      "\t\t\t\t\t<path d=\"M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z\"/>\n" +
      "\t\t\t\t\t<path fill-rule=\"evenodd\" d=\"M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z\"/>\n" +
      "\t\t\t\t</svg>\n" +
      "\t\t\t</button>\n" +
      "\t\t\t<h2 id=\"result\"></h2>\n" +
      "\t\t\t<p id=\"output\"></p>\n" +
      "\t\t</div>\n" +
      "\t\t" + app.description + "\n" +
      "\t\t<script src=\"https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js\"></script>\n" +
      "\t\t<script src=\"script.js\"></script>\n" +
      "\t</body>\n" +
      "</html>";
    ;

    const blob = new Blob([HTMLContent], { type: 'text/html' });
    const html = new File([blob], 'index.html', { type: 'text/html' });

    return html;
  }

  /**
   * Genera el archivo CSS de la aplicación.
   * @param app datos aplicación de la cual generar el CSS
   * @returns fichero con el título y contenido del CSS de la aplicación
   */
  createCSS(app: Application): File {
    const CSSContent =
      "body {\n" +
      "\tbackground-color: " + app.style.backgroundColor + ";\n" +
      "\tfont-family: " + app.style.font + ";\n" +
      "\tcolor: " + app.style.textColor + ";\n" +
      "}\n" +
      "\n" +
      "#canvas {\n" +
      "\tmax-width: 100%;\n" +
      "}\n" +
      "\n" +
      "#cam {\n" +
      "\ttext-align: " + Align[app.style.camAlign] + ";\n" +
      "}\n" +
      "\n" +
      "#rotateCamera {\n" +
      "\tposition: absolute;\n" +
      "\tmargin-top: 10px;\n" +
      "\tmargin-left: -50px;\n" +
      "\tborder-radius: 100%;\n" +
      "\tpadding: 7px 7px 3px 7px;\n" +
      "\tborder: 0px;\n" +
      "}";

    const blob = new Blob([CSSContent], { type: 'text/css' });
    const css = new File([blob], 'styles.css', { type: 'text/css' });

    return css;
  }

  /**
   * Genera el archivo JS de la aplicación.
   * @param app datos aplicación de la cual generar el JS
   * @returns fichero con el título y contenido del JS de la aplicación
   */
  createJS(app: Application): File {
    var categoriesList = "const categories = [";
    var getCategorie = "";

    for (let i = 0; i < app.categories.length; i++) {
      const categorie = app.categories[i];
      categoriesList += "\"" + categorie.name + "\"";

      if (i < app.categories.length - 1) {
        categoriesList += ", ";
      }
    }

    categoriesList += "];";

    if (app.useRange) {
      var minValuesList = "const minValues = [";
      var maxValuesList = "const maxValues = [";

      for (let i = 0; i < app.categories.length; i++) {
        const categorie = app.categories[i];
        minValuesList += categorie.minVal;
        maxValuesList += categorie.maxVal;

        if (i < app.categories.length - 1) {
          minValuesList += ", ";
          maxValuesList += ", ";
        }
      }

      minValuesList += "];";
      maxValuesList += "];";
      categoriesList += "\n" + minValuesList;
      categoriesList += "\n" + maxValuesList;
    }

    if (app.useRange) {
      getCategorie = "\tfor (let i = 0; i < categories.length; i++) {\n" +
        "\t\tif (prediction >= minValues[i] && prediction < maxValues[i]) {\n" +
        "\t\t\tresult.innerHTML = \"Resultado: \" + categories[i];\n" +
        "\t\t}\n" +
        "\t}";
    }
    else {
      getCategorie = "\tconst index = tf.argMax(prediction).dataSync()[0]; \n" +
        "\tif (categories.length > index) {\n" +
        "\t\tresult.innerHTML = \"Resultado: \" + categories[index];\n" +
        "\t} else {\n" +
        "\t\tresult.innerHTML = \"Resultado: \" + index;\n" +
        "\t}";
    }

    const JSContent = "var videoElement = document.getElementById('video');\n" +
      "var canvasElement = document.getElementById(\"canvas\");\n" +
      "var output = document.getElementById(\"output\");\n" +
      "var result = document.getElementById(\"result\");\n" +
      "var ctx = canvasElement.getContext('2d', { willReadFrequently: true });\n" +
      "var facingMode = \"user\"; // Fixed the variable name\n" +
      "var currentStream = null;\n" +
      "var model = null;\n" +
      "var prediction;\n" +
      "var inputShape = null;\n" +
      "const camWidth = 420;\n" +
      "const camHeight = 420;\n" +
      categoriesList + "\n" +
      "\n" +
      "videoElement.width = camWidth;\n" +
      "videoElement.height = camHeight;\n" +
      "canvasElement.width = camWidth;\n" +
      "canvasElement.height = camHeight;\n" +
      "\n" +
      "console.log(\"Cargando...\");\n" +
      "result.innerHTML = \"Cargando...\";\n" +
      "\n" +
      "tf.loadLayersModel(\"./model/model.json\")\n" +
      "\t.then((loadModel) => {\n" +
      "\t\tmodel = loadModel;\n" +
      "\t\tinputShape = model.inputs[0].shape;\n" +
      "\t\t// Cambia los valores null del array por el valor 1\n" +
      "\t\tinputShape = inputShape.map((value) => (value === null ? 1 : value));\n" +
      "\t\tconsole.log(\"Modelo cargado. inputShape:\" + inputShape);\n" +
      "\t\tshowCam(); // Now you can call showCam() after it has been defined\n" +
      "\t})\n" +
      "\t.catch((error) => {\n" +
      "\t\tmodel = null;\n" +
      "\t\toutput.innerHTML = 0;\n" +
      "\t\tresult.innerHTML = \"No se ha podido cargar el modelo correctamente.\";\n" +
      "\t\tconsole.log(error);\n" +
      "\t});\n" +
      "\n" +
      "function showCam() {\n" +
      "\tlet options = {\n" +
      "\t\taudio: false,\n" +
      "\t\tvideo: {\n" +
      "\t\t\tfacingMode: facingMode,\n" +
      "\t\t\twidth: camWidth,\n" +
      "\t\t\theight: camHeight,\n" +
      "\t\t},\n" +
      "\t};\n" +
      "\n" +
      "\tif (navigator.mediaDevices.getUserMedia) {\n" +
      "\t\tnavigator.mediaDevices\n" +
      "\t\t\t.getUserMedia(options)\n" +
      "\t\t\t.then((stream) => {\n" +
      "\t\t\t\tcurrentStream = stream;\n" +
      "\t\t\t\tvideo.srcObject = stream;\n" +
      "\t\t\t\tvideo.onloadedmetadata = () => {\n" +
      "\t\t\t\t\tvideo.play();\n" +
      "\t\t\t\t};\n" +
      "\t\t\t\tprocessCamera();\n" +
      "\t\t\t\tpredict();\n" +
      "\t\t\t})\n" +
      "\t\t\t.catch(function (err) {\n" +
      "\t\t\t\talert(\"No se ha podido utilizar la cámara.\");\n" +
      "\t\t\t\tconsole.log(err);\n" +
      "\t\t\t\talert(err);\n" +
      "\t\t\t});\n" +
      "\t} else {\n" +
      "\t\talert(\"No existe la función getUserMedia.\");\n" +
      "\t}\n" +
      "}\n" +
      "\n" +
      "function processCamera() {\n" +
      "\tctx.drawImage(video, 0, 0, camWidth, camHeight, 0, 0, camWidth, camHeight);\n" +
      "\tsetTimeout(processCamera, 20);\n" +
      "};\n" +
      "\n" +
      "function rotateCamera() {\n" +
      "\tif (currentStream) {\n" +
      "\t\tcurrentStream.getTracks().forEach((track) => {\n" +
      "\t\t\ttrack.stop();\n" +
      "\t\t});\n" +
      "\t}\n" +
      "\n" +
      "\tfacingMode = facingMode == \"user\" ? \"environment\" : \"user\";\n" +
      "\n" +
      "\tlet opciones = {\n" +
      "\t\taudio: false,\n" +
      "\t\tvideo: {\n" +
      "\t\t\tfacingMode: facingMode,\n" +
      "\t\t\twidth: camWidth,\n" +
      "\t\t\theight: camHeight\n" +
      "\t\t}\n" +
      "\t}\n" +
      "\n" +
      "\tnavigator.mediaDevices.getUserMedia(opciones)\n" +
      "\t\t.then(stream => {\n" +
      "\t\t\tcurrentStream = stream;\n" +
      "\t\t\tvideo.srcObject = stream;\n" +
      "\t\t})\n" +
      "\t\t.catch(function (err) {\n" +
      "\t\t\tconsole.log(\"No se ha podido cambiar la cámara.\", err);\n" +
      "\t\t})\n" +
      "};\n" +
      "\n" +
      "function predict() {\n" +
      "\tif (model != null) {\n" +
      "\t\t//el método tidy() libera la memoria después de ejecutar una serie de operaciones\n" +
      "\t\ttf.tidy(() => {\n" +
      "\t\t\tvar imageData = ctx.getImageData(0, 0, camWidth, camHeight);\n" +
      "\t\t\tvar imageTensor = tf.browser.fromPixels(imageData);\n" +
      "\t\t\tconst sorted = inputShape.slice().sort((a, b) => b - a);\n" +
      "\t\t\tconst highestValue1 = sorted[0];\n" +
      "\t\t\tconst highestValue2 = sorted[1];\n" +
      "\t\t\tvar tensor;\n" +
      "\n" +
      "\t\t\t// redimensiona la imagen a las dimensiones requeridas por el tensor\n" +
      "\t\t\timageTensor = tf.image.resizeBilinear(imageTensor, [highestValue1, highestValue2]);\n" +
      "\n" +
      "\t\t\t// convertir la imagen a escala de grises si el modelo utiliza sólo 1 canal de color\n" +
      "\t\t\tif (!inputShape.includes(2) && !inputShape.includes(3) && !inputShape.includes(4)) {\n" +
      "\t\t\t\timageTensor = imageTensor.mean(2, true);\n" +
      "\t\t\t}\n" +
      "\n" +
      "\t\t\t// normaliza los valores de los píxeles\n" +
      "\t\t\timageTensor = imageTensor.div(255);\n" +
      "\n" +
      "\t\t\ttry { // intenta con las dimensiones anteriores conseguidas (highestValue1 x highestValue2)\n" +
      "\t\t\t\ttensor = imageTensor.reshape(inputShape);\n" +
      "\t\t\t}\n" +
      "\t\t\tcatch (error) {\n" +
      "\t\t\t\t// si no son correctas las dimenesiones es que están al revés, intenta con (highestValue2 x highestValue1)\n" +
      "\t\t\t\timageTensor = tf.image.resizeBilinear(imageTensor, [highestValue2, highestValue1]);\n" +
      "\n" +
      "\t\t\t\tif (!inputShape.includes(2) && !inputShape.includes(3) && !inputShape.includes(4)) {\n" +
      "\t\t\t\t\timageTensor = imageTensor.mean(2, true);\n" +
      "\t\t\t\t}\n" +
      "\t\t\t\timageTensor = imageTensor.div(255);\n" +
      "\t\t\t\ttensor = imageTensor.reshape(inputShape);\n" +
      "\t\t\t}\n" +
      "\n" +
      "\t\t\tprediction = model.predict(tensor).dataSync();\n" +
      "\t\t\toutput.innerHTML = prediction;\n" +
      "\t\t});\n" +
      "\t}\n" +
      "\n" +
      getCategorie + "\n" +
      "\n" +
      "\tsetTimeout(predict.bind(this), 150);\n" +
      "}";

    const blob = new Blob([JSContent], { type: 'text/javascript' });
    const js = new File([blob], 'script.js', { type: 'text/javascript' });

    return js;
  }
}