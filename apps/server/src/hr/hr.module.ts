import { Module } from "@nestjs/common";

import { ResumeModule } from "../resume/resume.module";
import { UserModule } from "../user/user.module";
import { HRController } from "./hr.controller";

@Module({
  imports: [UserModule, ResumeModule],
  controllers: [HRController],
})
export class HRModule {}
