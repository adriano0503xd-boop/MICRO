// ==========================================
// CONFIGURACIÓN (¡PON TUS DATOS AQUÍ!)
// ==========================================
const AIO_USERNAME = "Fran25"; 
const AIO_KEY = "aio_rXMK98tltTFyTFISHsSwhRj3eiGE";           

const FEED_TEMP = AIO_USERNAME + "/feeds/temperatura";
const FEED_HUM = AIO_USERNAME + "/feeds/humedad";
const FEED_LUM = AIO_USERNAME + "/feeds/luminosidad";

// Variable para el cliente MQTT
let client;

// Inicializar al cargar la página
window.onload = function() {
    connectMQTT();
};

// 1. Conexión MQTT (Simple, sin reconexión automática)
function connectMQTT() {
    console.log("Conectando a Adafruit IO...");
    let clientID = "clientID-" + parseInt(Math.random() * 100);
    client = new Paho.MQTT.Client("io.adafruit.com", 443, clientID);

    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;

    let options = {
        useSSL: true,
        userName: AIO_USERNAME,
        password: AIO_KEY,
        onSuccess: onConnect,
        onFailure: doFail
    };
    client.connect(options);
}

function onConnect() {
    console.log("¡Conectado a Adafruit IO!");
    client.subscribe(FEED_TEMP);
    client.subscribe(FEED_HUM);
    client.subscribe(FEED_LUM);
    console.log("Suscrito a todos los feeds");
}

function doFail(e) {
    console.log("Fallo conexión:", e);
}

function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        console.log("Conexión perdida:", responseObject.errorMessage);
    }
}

// 2. Recibir datos y actualizar valores en texto
function onMessageArrived(message) {
    let topic = message.destinationName;
    let payload = message.payloadString;
    console.log("Mensaje recibido:", topic, "=", payload);

    if (topic === FEED_TEMP) {
        document.getElementById("temp-value").innerText = parseFloat(payload).toFixed(1);
    } else if (topic === FEED_HUM) {
        document.getElementById("hum-value").innerText = parseFloat(payload).toFixed(1);
    } else if (topic === FEED_LUM) {
        document.getElementById("lum-value").innerText = parseFloat(payload).toFixed(2);
    }
}
