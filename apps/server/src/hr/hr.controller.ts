import { Controller, Get, Query } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";

@Controller("hr")
export class HRController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("search")
  async search(@Query("person") person?: string, @Query("skill") _skill?: string) {
    // If no person query provided, return empty array to avoid returning all users
    if (!person) return [];

    const q = person.trim();

    // Search users where name, lastName or email contains the query (case-insensitive)
    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { username: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 50,
    });

    return users.map((u) => ({
      id: u.id,
      name: [u.name, u.username].filter(Boolean).join(" "),
      email: u.email,
    }));
  }
}
