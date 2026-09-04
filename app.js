import { GoogleGenAI } from "@google/genai";
import Fastify from "fastify";
import FastifyVite from "@fastify/vite";
import FastifyEnv from "@fastify/env";

export async function buildApp({ vite = true } = {}) {
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
        },
      },
    },
  });

  if (vite) {
    await server.register(FastifyVite, {
      root: import.meta.url,
      renderer: "@fastify/react",
    });

    await server.vite.ready();
  }

  server.decorate("genAI", new GoogleGenAI({ apiKey: server.config.API_KEY }));

  server.post("/api/explain/code", async (req, reply) => {
    const response = await server.genAI.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        { text: "Given the following problem:" },
        { text: req.body.problem },
        {
          text: "Assess if the following code satisfies the problem. If it does, just send congratulations and explain what the code is doing, do not include any followup. If it doesn't, point out where there are deficiencies in the code without providing a solution yourself.",
        },
        { executableCode: { code: req.body.code, language: "python" } },
      ],
      config: {
        tools: [
          {
            codeExecution: {},
          },
        ],
      },
    });

    reply.send(response.text);
  });

  return server;
}
