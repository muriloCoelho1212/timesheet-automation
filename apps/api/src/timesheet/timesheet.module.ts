import { Module } from '@nestjs/common';
import { TimesheetService } from './timesheet.service';
import { TimesheetResolver } from './timesheet.resolver';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [TimesheetService, TimesheetResolver]
})
export class TimesheetModule {}
