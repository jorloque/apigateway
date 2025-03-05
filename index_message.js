const { ApiGatewayManagementApiClient, PostToConnectionCommand } = require("@aws-sdk/client-apigatewaymanagementapi");

const apiGateway = new ApiGatewayManagementApiClient({
    endpoint: "https://yrv9eg57pb.execute-api.us-east-1.amazonaws.com/production" // Asegúrate de que este sea el endpoint correcto
});

module.exports.handler = async (event) => {
    try {
        // Validar que el evento tenga la estructura esperada
        if (!event || !event.requestContext || !event.requestContext.connectionId) {
            throw new Error("Evento inválido: falta connectionId en requestContext.");
        }

        // Obtener el connectionId y el cuerpo del mensaje
        const connectionId = event.requestContext.connectionId;
        const body = JSON.parse(event.body || "{}"); // Parsear el cuerpo como JSON

        console.log("Enviando mensaje a:", connectionId);

        // Crear el comando para enviar el mensaje
        const command = new PostToConnectionCommand({
            ConnectionId: connectionId,
            Data: JSON.stringify({ message: body.message || "Mensaje predeterminado" }) // Enviar el mensaje en formato JSON
        });

        // Enviar el mensaje
        await apiGateway.send(command);

        console.log("Mensaje enviado correctamente.");
        return { statusCode: 200, body: "Mensaje enviado." };
    } catch (error) {
        console.error("Error enviando mensaje:", error);

        // Manejar errores específicos
        if (error.name === "GoneException") {
            console.error("La conexión ya está cerrada.");
            return { statusCode: 410, body: "La conexión ya está cerrada." };
        }

        if (error.name === "ForbiddenException") {
            console.error("Permisos insuficientes para enviar el mensaje.");
            return { statusCode: 403, body: "Permisos insuficientes." };
        }

        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};