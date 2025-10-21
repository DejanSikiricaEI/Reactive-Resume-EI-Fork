import { Module } from "@nestjs/common";

import { HRController } from "./hr.controller";

@Module({
  controllers: [HRController],
})
export class HRModule {}
