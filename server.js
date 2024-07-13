import { GoogleGenerativeAI } from "@google/generative-ai";
import Fastify from "fastify";
import FastifyVite from "@fastify/vite";
import FastifyEnv from "@fastify/env";

const server = Fastify({
  logger: {
    transport: {
      target: "@fastify/one-line-logger",
    },
  },
});

await server.register(FastifyEnv, {
  dotenv: true,
  schema: {
    type: "object",
    required: ["API_KEY"],
    properties: {
      API_KEY: {
        type: "string",
        default: undefined,
      },
    },
  },
});

await server.register(FastifyVite, {
  root: import.meta.url,
  renderer: "@fastify/react",
});

await server.vite.ready();

server.decorate("genAI", new GoogleGenerativeAI(process.env.API_KEY));

server.post("/api/generate/code", async (req, reply) => {
  const model = server.genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    tools: [
      {
        codeExecution: {},
      },
    ],
  });

  const result = await model.generateContent(req.body.prompt);

  reply.send(result);
});

server.post("/api/explain/code", async (req, reply) => {
  const model = server.genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    tools: [
      {
        codeExecution: {},
      },
    ],
  });

  const result = await model.generateContent([
    { text: "Given the following problem:" },
    { text: req.body.problem },
    {
      text: "Assess if the following code satisfies the problem. If it does, just send congratulations and explain what the code is doing, do not include any followup. If it doesn't, point out where there are deficiencies in the code without providing a solution yourself.",
    },
    { executableCode: { code: req.body.code, language: "python" } },
  ]);

  reply.send(result.response.text());
});

await server.listen({ port: 3000 });
