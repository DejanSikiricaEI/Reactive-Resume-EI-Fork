import { Controller, Get, Param, Query } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";

import { ResumeService } from "@/server/resume/resume.service";

@Controller("hr")
export class HRController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly resumeService: ResumeService,
  ) {}

  @Get("search")
  async search(@Query("person") person?: string, @Query("skill") skill?: string) {
    type ReturnItem = { id: string; name: string; email: string | null };
    const returnArray: ReturnItem[] = [];
    const seenEmails = new Set<string>();

    if (!person && !skill) return returnArray;

    if (person) {
      const q = person.trim();

      const users = await this.prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { username: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 250,
      });

      for (const u of users) {
        const email = u.email;
        if (email && seenEmails.has(email)) continue;
        if (email) seenEmails.add(email);

        returnArray.push({
          id: u.id,
          name: [u.name, u.username].filter(Boolean).join(" "),
          email,
        });
      }
    }

    if (skill) {
      // Split, trim each token and filter out empty/whitespace-only entries
      const skills = skill
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      type QueryResult = { id: string; name: string | null; email: string | null }[];
      const client = this.prisma as unknown as {
        $queryRaw: (
          query: TemplateStringsArray | string,
          ...params: unknown[]
        ) => Promise<QueryResult>;
      };

      for (const s of skills) {
        const escaped = s.replace(/%/g, String.raw`\%`).replace(/_/g, String.raw`\_`);
        const pattern = `%${escaped}%`;

        const results = await client.$queryRaw`
        SELECT r.id,
          COALESCE(r.data->'basics'->>'name', '') as name,
          (r.data->'basics'->>'email') as email
        FROM "Resume" r
        WHERE EXISTS (
          SELECT 1 FROM jsonb_array_elements(COALESCE(r.data->'sections'->'skills'->'items', '[]'::jsonb)) as skill_item
          WHERE EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(COALESCE(skill_item->'keywords', '[]'::jsonb)) as kw
            WHERE kw ILIKE ${pattern}
          )
        )
        LIMIT 250
      `;

        for (const r of results) {
          const email = r.email ?? null;
          if (email && seenEmails.has(email)) continue;
          if (email) seenEmails.add(email);

          returnArray.push({
            id: r.id,
            name: r.name?.trim() ?? "",
            email,
          });
        }
      }
    }

    return returnArray;
  }

  @Get("resumes/:userId")
  async resumes(@Param("userId") userId: string) {
    return this.resumeService.findAll(userId);
  }
}
