import { Resolver, Query, Args } from '@nestjs/graphql';
import { TimesheetService } from './timesheet.service';
import { AzureCommit } from './models/commit.model';
import { AzureWorkItem } from './models/work-item.model';

@Resolver()
export class TimesheetResolver {  
  constructor(private readonly timesheetService: TimesheetService) {}

  @Query(() => [AzureCommit], { name: 'myCommits' })
  async getMyCommits(
    @Args('startDate') startDate: string,
    @Args('endDate') endDate: string,
  ): Promise<AzureCommit[]> {
    // Chamamos o serviço real!
    return this.timesheetService.getMyCommits(startDate, endDate);
  }

  @Query(() => [AzureWorkItem], { name: 'myWorkItems' })
  async getMyWorkItems(
    @Args('startDate') startDate: string,
    @Args('endDate') endDate: string,
  ): Promise<AzureWorkItem[]> {
    return this.timesheetService.getMyWorkItems(startDate, endDate);
  }
}