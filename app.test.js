import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const generateContentMock = vi.fn();

vi.mock("@google/genai", () => ({
  GoogleGenAI: vi.fn().mockImplementation(function GoogleGenAI() {
    this.models = { generateContent: generateContentMock };
  }),
}));

describe("POST /api/explain/code", () => {
  let app;

  beforeEach(async () => {
    process.env.API_KEY = "test-api-key";
    generateContentMock.mockReset();

    const { buildApp } = await import("./app.js");
    app = await buildApp({ vite: false });
  });

  afterEach(async () => {
    await app.close();
  });

  it("sends the problem and code to Gemini and returns the response text", async () => {
    generateContentMock.mockResolvedValue({ text: "Looks good!" });

    const response = await app.inject({
      method: "POST",
      url: "/api/explain/code",
      payload: {
        problem: "# reverse a string",
        code: "def reverse(s): return s[::-1]",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe("Looks good!");

    expect(generateContentMock).toHaveBeenCalledTimes(1);
    expect(generateContentMock).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gemini-3.6-flash",
        contents: expect.arrayContaining([
          { text: "# reverse a string" },
          {
            executableCode: {
              code: "def reverse(s): return s[::-1]",
              language: "python",
            },
          },
        ]),
      }),
    );
  });

  it("propagates a rejection from the Gemini call as a 500", async () => {
    generateContentMock.mockRejectedValue(new Error("upstream failure"));

    const response = await app.inject({
      method: "POST",
      url: "/api/explain/code",
      payload: { problem: "# some problem", code: "pass" },
    });

    expect(response.statusCode).toBe(500);
  });
});
