function connectMQTT() {
    console.log("🔄 Conectando a Adafruit IO...");
    console.log("Username:", AIO_USERNAME);
    console.log("Key (primeros 10 chars):", AIO_KEY.substring(0, 10) + "...");
    
    let clientID = "clientID-" + parseInt(Math.random() * 100000);
    client = new Paho.MQTT.Client("io.adafruit.com", 443, clientID);
    
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;
    
    let options = {
        useSSL: true,
        userName: AIO_USERNAME,
        password: AIO_KEY,
        onSuccess: onConnect,
        onFailure: doFail,
        timeout: 10,
        keepAliveInterval: 30
    };
    
    client.connect(options);
}

function doFail(e) {
    console.error("❌ Error de conexión detallado:");
    console.error("- Error Code:", e.errorCode);
    console.error("- Error Message:", e.errorMessage);
    console.error("- Error Object:", e);
    
    reconnectAttempts++;
    updateStatusBadge("DESCONECTADO", false);
    
    let delay = Math.min(reconnectTimeout * Math.pow(1.5, reconnectAttempts), 30000);
    console.log(`⏳ Reintentando en ${delay/1000} segundos... (intento ${reconnectAttempts})`);
    setTimeout(connectMQTT, delay);
}
