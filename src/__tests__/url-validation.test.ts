import { describe, it, expect } from "vitest";
import { LinkedInUrlSchema, InstagramUrlSchema } from "@/lib/types";

describe("URL Validation Suite", () => {
  it("validates official LinkedIn profile URLs", () => {
    const validUrls = [
      "https://www.linkedin.com/in/satyanadella",
      "https://linkedin.com/in/jenhsunhuang",
      "https://www.linkedin.com/in/mira-murati/",
      "https://linkedin.com/in/fei-fei-li-4541247",
    ];

    for (const url of validUrls) {
      const res = LinkedInUrlSchema.safeParse(url);
      expect(res.success).toBe(true);
    }
  });

  it("rejects non-LinkedIn URLs for LinkedIn field", () => {
    const invalidUrls = [
      "https://twitter.com/satyanadella",
      "https://facebook.com/satyanadella",
      "not-a-url",
      "ftp://linkedin.com",
    ];

    for (const url of invalidUrls) {
      const res = LinkedInUrlSchema.safeParse(url);
      expect(res.success).toBe(false);
    }
  });

  it("validates official Instagram profile URLs", () => {
    const validUrls = [
      "https://www.instagram.com/satyanadella",
      "https://instagram.com/mkbhd",
      "https://www.instagram.com/sama/",
    ];

    for (const url of validUrls) {
      const res = InstagramUrlSchema.safeParse(url);
      expect(res.success).toBe(true);
    }
  });

  it("rejects invalid Instagram profile URLs", () => {
    const invalidUrls = [
      "https://tiktok.com/@mkbhd",
      "https://youtube.com/c/mkbhd",
      "invalid-instagram-string",
    ];

    for (const url of invalidUrls) {
      const res = InstagramUrlSchema.safeParse(url);
      expect(res.success).toBe(false);
    }
  });
});
