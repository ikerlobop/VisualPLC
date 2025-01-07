const opcua = require("node-opcua");

const client = opcua.OPCUAClient.create({
    endpoint_must_exist: false,
    connectionStrategy: {
        maxRetry: 5,
        initialDelay: 1000,
        maxDelay: 10000
    }
});

const endpointUrl = "opc.tcp://192.168.2.12:4840";
const nodeIdToSubscribe = "ns=4;i=13"; // Ajusta según el nodo a monitorear

async function subscribeToOpcuaValue(onValueChangedCallback) {
    try {
        console.log("Conectando al servidor OPC UA...");
        await client.connect(endpointUrl);
        console.log("Conexión exitosa al servidor OPC UA");

        const session = await client.createSession();
        console.log("Sesión creada");

        const subscription = opcua.ClientSubscription.create(session, {
            requestedPublishingInterval: 100,
            requestedLifetimeCount: 100,
            requestedMaxKeepAliveCount: 10,
            maxNotificationsPerPublish: 10,
            publishingEnabled: true,
            priority: 10
        });

        console.log("Suscripción creada");

        const monitoredItem = opcua.ClientMonitoredItem.create(
            subscription,
            { nodeId: nodeIdToSubscribe, attributeId: opcua.AttributeIds.Value },
            {
                samplingInterval: 100,
                discardOldest: true,
                queueSize: 10
            }
        );

        monitoredItem.on("changed", (dataValue) => {
            const value = dataValue.value.value;
            console.log("Valor actualizado:", value);

            if (onValueChangedCallback) {
                onValueChangedCallback(value);
            }
        });

    } catch (err) {
        console.error("Error en la suscripción OPC UA:", err);
        throw err;
    }
}

module.exports = { subscribeToOpcuaValue };

