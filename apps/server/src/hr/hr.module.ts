import { Module } from "@nestjs/common";

import { UserModule } from "../user/user.module";
import { HRController } from "./hr.controller";

@Module({
  imports: [UserModule],
  controllers: [HRController],
})
export class HRModule {}
