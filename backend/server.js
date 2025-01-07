const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { subscribeToOpcuaValue } = require("./opcua-client");

const app = express();
const port = 3000;

// Servir el frontend
app.use(express.static("frontend"));

// Crear servidor HTTP y WebSocket
const server = http.createServer(app);
const io = new Server(server);

// Enviar datos OPC UA al cliente
io.on("connection", (socket) => {
    console.log("Cliente conectado");

    // Simulación de un reloj de 10 Hz
    setInterval(() => {
        const timestamp = new Date().toISOString();
        socket.emit("clock-update", { timestamp });
    }, 100); // Cada 100 ms

    // Suscribirse a un nodo OPC UA
    subscribeToOpcuaValue((newValue) => {
        socket.emit("opcua-update", { value: newValue });
    });

    socket.on("disconnect", () => {
        console.log("Cliente desconectado");
    });
});

// Iniciar el servidor
server.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});

