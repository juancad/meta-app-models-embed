var videoElement = document.getElementById('video');
var canvasElement = document.getElementById("canvas");
var output = document.getElementById("output");
var result = document.getElementById("result");
var ctx = canvasElement.getContext('2d', { willReadFrequently: true });
var facingMode = "user"; // Fixed the variable name
var currentStream = null;
var model = null;
var prediction;
var inputShape = null;
const camWidth = 420;
const camHeight = 420;
const categories = ["airplane", "automobile", "bird", "cat", "deer", "dog", "frog", "horse", "ship", "truck"];

videoElement.width = camWidth;
videoElement.height = camHeight;
canvasElement.width = camWidth;
canvasElement.height = camHeight;

console.log("Cargando...");
result.innerHTML = "Cargando...";

tf.loadLayersModel("./model/model.json")
	.then((loadModel) => {
		model = loadModel;
		inputShape = model.inputs[0].shape;
		// Cambia los valores null del array por el valor 1
		inputShape = inputShape.map((value) => (value === null ? 1 : value));
		console.log("Modelo cargado. inputShape:" + inputShape);
		showCam(); // Now you can call showCam() after it has been defined
	})
	.catch((error) => {
		model = null;
		output.innerHTML = 0;
		result.innerHTML = "No se ha podido cargar el modelo correctamente.";
		console.log(error);
	});

function showCam() {
	let options = {
		audio: false,
		video: {
			facingMode: facingMode,
			width: camWidth,
			height: camHeight,
		},
	};

	if (navigator.mediaDevices.getUserMedia) {
		navigator.mediaDevices
			.getUserMedia(options)
			.then((stream) => {
				currentStream = stream;
				video.srcObject = stream;
				video.onloadedmetadata = () => {
					video.play();
				};
				processCamera();
				predict();
			})
			.catch(function (err) {
				alert("No se ha podido utilizar la cámara.");
				console.log(err);
				alert(err);
			});
	} else {
		alert("No existe la función getUserMedia.");
	}
}

function processCamera() {
	ctx.drawImage(video, 0, 0, camWidth, camHeight, 0, 0, camWidth, camHeight);
	setTimeout(processCamera, 20);
};

function rotateCamera() {
	if (currentStream) {
		currentStream.getTracks().forEach((track) => {
			track.stop();
		});
	}

	facingMode = facingMode == "user" ? "environment" : "user";

	let opciones = {
		audio: false,
		video: {
			facingMode: facingMode,
			width: camWidth,
			height: camHeight
		}
	}

	navigator.mediaDevices.getUserMedia(opciones)
		.then(stream => {
			currentStream = stream;
			video.srcObject = stream;
		})
		.catch(function (err) {
			console.log("No se ha podido cambiar la cámara.", err);
		})
};

function predict() {
	if (model != null) {
		//el método tidy() libera la memoria después de ejecutar una serie de operaciones
		tf.tidy(() => {
			var imageData = ctx.getImageData(0, 0, camWidth, camHeight);
			var imageTensor = tf.browser.fromPixels(imageData);
			const sorted = inputShape.slice().sort((a, b) => b - a);
			const highestValue1 = sorted[0];
			const highestValue2 = sorted[1];
			var tensor;

			// redimensiona la imagen a las dimensiones requeridas por el tensor
			imageTensor = tf.image.resizeBilinear(imageTensor, [highestValue1, highestValue2]);

			// convertir la imagen a escala de grises si el modelo utiliza sólo 1 canal de color
			if (!inputShape.includes(2) && !inputShape.includes(3) && !inputShape.includes(4)) {
				imageTensor = imageTensor.mean(2, true);
			}

			// normaliza los valores de los píxeles
			imageTensor = imageTensor.div(255);

			try { // intenta con las dimensiones anteriores conseguidas (highestValue1 x highestValue2)
				tensor = imageTensor.reshape(inputShape);
			}
			catch (error) {
				// si no son correctas las dimenesiones es que están al revés, intenta con (highestValue2 x highestValue1)
				imageTensor = tf.image.resizeBilinear(imageTensor, [highestValue2, highestValue1]);

				if (!inputShape.includes(2) && !inputShape.includes(3) && !inputShape.includes(4)) {
					imageTensor = imageTensor.mean(2, true);
				}
				imageTensor = imageTensor.div(255);
				tensor = imageTensor.reshape(inputShape);
			}

			prediction = model.predict(tensor).dataSync();
			output.innerHTML = prediction;
		});
	}

	const index = tf.argMax(prediction).dataSync()[0]; 
	if (categories.length > index) {
		result.innerHTML = "Resultado: " + categories[index];
	} else {
		result.innerHTML = "Resultado: " + index;
	}

	setTimeout(predict.bind(this), 200);
}