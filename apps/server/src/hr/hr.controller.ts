import { Controller, Get, Query } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";

@Controller("hr")
export class HRController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("search")
  async search(@Query("person") person?: string, @Query("skill") skill?: string) {
    if (!person && !skill) return [];

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

      return users.map((u) => ({
        id: u.id,
        name: [u.name, u.username].filter(Boolean).join(" "),
        email: u.email,
      }));
    }

    if (skill) {
      const s = skill.trim();
      const escaped = s.replace(/%/g, String.raw`\%`).replace(/_/g, String.raw`\_`);
      const pattern = `%${escaped}%`;

      type QueryResult = { id: string; name: string | null; email: string | null }[];
      const client = this.prisma as unknown as {
        $queryRaw: (
          query: TemplateStringsArray | string,
          ...params: unknown[]
        ) => Promise<QueryResult>;
      };

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

      return results.map((r) => ({
        id: r.id,
        name: r.name?.trim() ?? "",
        email: r.email ?? null,
      }));
    }

    return [];
  }
}
