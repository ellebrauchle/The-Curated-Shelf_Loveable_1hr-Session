import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const CATS = ["books", "movies", "shows", "music", "restaurants", "recipes"] as const;

export const classifyRec = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ name: z.string().min(1).max(300), why: z.string().max(2000) }).parse(d))
  .handler(async ({ data }) => {
    const key = process.env['LOVABLE_API_KEY'];
    if (!key) throw new Error("LOVABLE_API_KEY missing");
    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { "Lovable-API-Key": key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", "X-Lovable-AIG-SDK": "fetch" },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        stream: true,
        store: false,
        reasoning: { effort: "low" },
        instructions:
          "Classify a recommendation into one category: books, movies, shows (TV series), music, restaurants, recipes. Also give the creator (author/director/artist/chef) or the city for a restaurant, or an empty string if unknown.",
        input: `Name: ${data.name}\nWhy: ${data.why}`,
        text: {
          format: {
            type: "json_schema",
            name: "classification",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: { category: { type: "string", enum: CATS }, creator: { type: "string" } },
              required: ["category", "creator"],
            },
          },
        },
      }),
    });
    if (!res.ok || !res.body) throw new Error(`AI request failed [${res.status}]: ${await res.text()}`);
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    let out = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const ev = JSON.parse(payload);
          if (ev.type === "response.output_text.delta") out += ev.delta;
        } catch {}
      }
    }
    let args: { category?: string; creator?: string } = {};
    try { args = JSON.parse(out); } catch {}
    const category = (CATS as readonly string[]).includes(args.category ?? "") ? (args.category as (typeof CATS)[number]) : "books";
    return { category, creator: typeof args.creator === "string" ? args.creator : "" };
  });
