import { Controller, Get, Query } from "@nestjs/common";

@Controller("hr")
export class HRController {
  @Get("search")
  search(@Query("q") q?: string, @Query("skill") skill?: string) {
    // Placeholder response. Replace with real logic later.
    return [
      {
        id: "sample-1",
        name: q ? `Result for ${q}` : "Sample Result",
        email: skill ? `${skill}@example.com` : undefined,
      },
    ];
  }
}
