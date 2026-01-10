// ==========================================
// CONFIGURACIÓN ADAFRUIT IO
// ==========================================
const AIO_USERNAME = "Fran25";
const AIO_KEY = "aio_rXMK98tltTFyTFISHsSwhRj3eiGE";
const API_BASE = `https://io.adafruit.com/api/v2/${AIO_USERNAME}/feeds`;

let chartTemp, chartHum, chartLum;
let updateInterval = 3000; // Actualizar cada 3 segundos

// ==========================================
// RELOJ EN TIEMPO REAL
// ==========================================
function actualizarReloj() {
    const ahora = new Date();
    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    const segundos = String(ahora.getSeconds()).padStart(2, '0');
    document.getElementById('reloj').textContent = `${horas}:${minutos}:${segundos}`;

    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const fechaFormateada = ahora.toLocaleDateString('es-PE', opciones);
    document.getElementById('fecha').textContent = fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);
}

setInterval(actualizarReloj, 1000);
actualizarReloj();

// ==========================================
// CONFIGURACIÓN DE GRÁFICAS
// ==========================================
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.color = '#94a3b8';

const chartConfig = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            padding: 12,
            titleFont: { size: 13, weight: '600' },
            bodyFont: { size: 12 },
            borderColor: 'rgba(59, 130, 246, 0.3)',
            borderWidth: 1
        }
    },
    scales: {
        y: {
            grid: { color: 'rgba(59, 130, 246, 0.1)' },
            ticks: { font: { weight: '500' } }
        },
        x: {
            grid: { display: false },
            ticks: { font: { weight: '500' } }
        }
    }
};

// ==========================================
// GRÁFICA DE TEMPERATURA
// ==========================================
const ctxTemp = document.getElementById('tempChart').getContext('2d');
chartTemp = new Chart(ctxTemp, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Temperatura (°C)',
            data: [],
            borderColor: '#ff6b6b',
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#ff6b6b',
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2
        }]
    },
    options: chartConfig
});

// ==========================================
// GRÁFICA DE HUMEDAD
// ==========================================
const ctxHum = document.getElementById('humChart').getContext('2d');
chartHum = new Chart(ctxHum, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Humedad (%)',
            data: [],
            borderColor: '#4ecdc4',
            backgroundColor: 'rgba(78, 205, 196, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#4ecdc4',
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2
        }]
    },
    options: chartConfig
});

// ==========================================
// GRÁFICA DE LUMINOSIDAD
// ==========================================
const ctxLum = document.getElementById('lumChart').getContext('2d');
chartLum = new Chart(ctxLum, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Luminosidad (lux)',
            data: [],
            borderColor: '#fbbf24',
            backgroundColor: 'rgba(251, 191, 36, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#fbbf24',
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2
        }]
    },
    options: chartConfig
});

// ==========================================
// CONFIGURACIÓN PARA GRÁFICAS DE MEDIDOR
// ==========================================
const gaugeConfig = {
    responsive: true,
    maintainAspectRatio: false,
    circumference: 180,
    rotation: -90,
    cutout: '75%',
    plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
    }
};

// Gráfica de medidor - Temperatura (0-100°C)
const tempPieChart = new Chart(document.getElementById('tempPieChart'), {
    type: 'doughnut',
    data: {
        labels: ['Temperatura', 'Restante'],
        datasets: [{
            data: [0, 100],
            backgroundColor: ['#ff6b6b', 'rgba(59, 130, 246, 0.1)'],
            borderWidth: 0,
            borderRadius: 10
        }]
    },
    options: gaugeConfig
});

// Gráfica de medidor - Humedad (0-100%)
const humPieChart = new Chart(document.getElementById('humPieChart'), {
    type: 'doughnut',
    data: {
        labels: ['Humedad', 'Restante'],
        datasets: [{
            data: [0, 100],
            backgroundColor: ['#4ecdc4', 'rgba(59, 130, 246, 0.1)'],
            borderWidth: 0,
            borderRadius: 10
        }]
    },
    options: gaugeConfig
});

// Gráfica de medidor - Luminosidad (0-1000)
const lumPieChart = new Chart(document.getElementById('lumPieChart'), {
    type: 'doughnut',
    data: {
        labels: ['Luminosidad', 'Restante'],
        datasets: [{
            data: [0, 1000],
            backgroundColor: ['#fbbf24', 'rgba(59, 130, 246, 0.1)'],
            borderWidth: 0,
            borderRadius: 10
        }]
    },
    options: gaugeConfig
});

// ==========================================
// FUNCIÓN PARA ACTUALIZAR MEDIDORES
// ==========================================
function updateGauge(chart, value, max) {
    const clampedValue = Math.max(0, Math.min(value, max));
    const remaining = max - clampedValue;
    chart.data.datasets[0].data = [clampedValue, remaining];
    chart.update('none');
}

// ==========================================
// OBTENER DATOS VIA HTTP API
// ==========================================
async function fetchFeedData(feedName) {
    try {
        const response = await fetch(`${API_BASE}/${feedName}/data/last`, {
            headers: {
                'X-AIO-Key': AIO_KEY
            }
        });
        
        if (!response.ok) {
            if (response.status === 404) {
                console.warn(`⚠️ Feed "${feedName}" no encontrado en Adafruit IO`);
            } else if (response.status === 401) {
                console.warn(`⚠️ No autorizado para acceder a "${feedName}". Verifica que exista.`);
            } else {
                console.error(`❌ HTTP ${response.status}: ${response.statusText}`);
            }
            return null;
        }
        
        const data = await response.json();
        return parseFloat(data.value);
    } catch (error) {
        console.error(`❌ Error obteniendo ${feedName}:`, error.message);
        return null;
    }
}

async function updateAllSensors() {
    try {
        // Obtener temperatura
        const temp = await fetchFeedData('temperatura');
        if (temp !== null) {
            document.getElementById("temp-value").innerText = temp.toFixed(1);
            document.getElementById("temp-mini").innerText = temp.toFixed(1);
            updateChart(chartTemp, temp);
            updateGauge(tempPieChart, temp, 100);
            console.log("🌡️ Temperatura:", temp + "°C");
        }

        // Obtener humedad
        const hum = await fetchFeedData('humedad');
        if (hum !== null) {
            document.getElementById("hum-value").innerText = hum.toFixed(1);
            document.getElementById("hum-mini").innerText = hum.toFixed(1);
            updateChart(chartHum, hum);
            updateGauge(humPieChart, hum, 100);
            console.log("💧 Humedad:", hum + "%");
        }

        // Obtener luminosidad
        const lum = await fetchFeedData('luminosidad');
        if (lum !== null) {
            document.getElementById("lum-value").innerText = lum.toFixed(2);
            document.getElementById("lum-mini").innerText = lum.toFixed(2);
            updateChart(chartLum, lum);
            updateGauge(lumPieChart, lum, 1000);
            console.log("💡 Luminosidad:", lum + " lux");
        }

        // Actualizar badge
        updateStatusBadge("CONECTADO", true);

    } catch (error) {
        console.error("❌ Error general:", error);
        updateStatusBadge("ERROR", false);
    }
}

function updateChart(chartInstance, value) {
    const now = new Date();
    const timeLabel = now.getHours() + ":" + 
                     now.getMinutes().toString().padStart(2, '0') + ":" + 
                     now.getSeconds().toString().padStart(2, '0');

    chartInstance.data.labels.push(timeLabel);
    chartInstance.data.datasets[0].data.push(value);

    if (chartInstance.data.labels.length > 20) {
        chartInstance.data.labels.shift();
        chartInstance.data.datasets[0].data.shift();
    }

    chartInstance.update('none');
}

function updateStatusBadge(text, isConnected) {
    const badge = document.getElementById('status-badge');
    if (isConnected) {
        badge.innerHTML = '<span class="status-dot"></span>' + text;
        badge.style.background = 'rgba(34, 197, 94, 0.1)';
        badge.style.borderColor = 'rgba(34, 197, 94, 0.3)';
        badge.style.color = '#22c55e';
    } else {
        badge.innerHTML = '<span class="status-dot offline"></span>' + text;
        badge.style.background = 'rgba(239, 68, 68, 0.1)';
        badge.style.borderColor = 'rgba(239, 68, 68, 0.3)';
        badge.style.color = '#ef4444';
    }
}

// ==========================================
// INICIAR ACTUALIZACIÓN AUTOMÁTICA
// ==========================================
window.addEventListener('load', function() {
    console.log("🚀 MONITOR FLASHTEMP INICIANDO");
    console.log("📡 Usando HTTP API en lugar de MQTT");
    console.log("🔄 Actualizando cada", updateInterval/1000, "segundos");
    
    // Primera actualización inmediata
    updateAllSensors();
    
    // Actualizar periódicamente
    setInterval(updateAllSensors, updateInterval);
});
