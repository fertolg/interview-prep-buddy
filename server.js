import { buildApp } from "./app.js";

const port = process.env.PORT || 3000;
const host = "RENDER" in process.env ? `0.0.0.0` : `localhost`;

const server = await buildApp();

await server.listen({ host: host, port: port });
