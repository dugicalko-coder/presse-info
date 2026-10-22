import { z } from "zod";

import { CATEGORIES, REGIONS } from "./site";

export const slugify = (s: string) => s.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90);
const nul = z.string().trim().max(2000).nullable().optional().transform((v) => (v ? v : null));

export const ArticleInput = z.object({
  id: z.number().int().optional(),
  title: z.string().trim().min(8).max(220),
  teaser: z.string().trim().min(20).max(600),
  body: z.string().trim().min(200).max(60000),
  category: z.enum(CATEGORIES.map((c) => c.slug) as [string, ...string[]]),
  topic: nul,
  region: z.enum(REGIONS.map((r) => r.slug) as [string, ...string[]]).nullable().optional(),
  kind: z.enum(["news", "ratgeber", "presse"]).default("news"),
  sender: nul,
  sender_url: nul,
  image: z.string().trim().max(500).regex(/^(https:\/\/|\/assets\/)/, "Bild muss mit https:// beginnen").nullable().optional().or(z.literal("")).transform((v) => (v ? v : null)),
  image_alt: nul,
  source_name: nul,
  source_url: nul,
  meta_title: nul,
  meta_description: nul,
  focus_keyword: nul,
  keywords: z.array(z.string().trim().max(80)).max(15).optional(),
  faq: z.array(z.object({ q: z.string().trim().min(3).max(300), a: z.string().trim().min(3).max(1200) })).max(6).optional(),
  service: z.boolean().optional(),
});
export type ArticleInputT = z.infer<typeof ArticleInput>;

