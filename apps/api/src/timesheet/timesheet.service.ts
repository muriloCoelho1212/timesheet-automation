import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AzureCommit } from './models/commit.model';
import { AzureWorkItem } from './models/work-item.model';

@Injectable()
export class TimesheetService {
  private readonly logger = new Logger(TimesheetService.name);
  private readonly orgUrl: string;
  private readonly project: string;
  private readonly pat: string;
  private readonly userEmail: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const orgUrl = this.configService.get<string>('AZURE_DEVOPS_ORG_URL');
    const project = this.configService.get<string>('AZURE_DEVOPS_PROJECT');
    const pat = this.configService.get<string>('AZURE_DEVOPS_PAT');
    const userEmail = this.configService.get<string>('AZURE_DEVOPS_USER_EMAIL');

    if (!orgUrl || !project || !pat || !userEmail) {
      throw new Error(
        'Faltam variáveis de ambiente do Azure DevOps! Verifique o seu arquivo .env.',
      );
    }

    this.orgUrl = orgUrl;
    this.project = project;
    this.pat = pat;
    this.userEmail = userEmail;
  }
  
  async getMyCommits(startDate: string, endDate: string): Promise<AzureCommit[]> {
    try {
      const reposUrl = `${this.orgUrl}/${this.project}/_apis/git/repositories?api-version=7.0`;
      const reposResponse = await firstValueFrom(this.httpService.get(reposUrl, this.axiosConfig));
      const repositories = reposResponse.data.value;

      const allCommits: AzureCommit[] = [];

      await Promise.all(
        repositories.map(async (repo: any) => {
          const pushesUrl = `${this.orgUrl}/${this.project}/_apis/git/repositories/${repo.id}/pushes`;
          
          const params = {
            'searchCriteria.fromDate': startDate,
            'searchCriteria.toDate': endDate,
            '$top': 1000,
            'api-version': '7.0',
          };

          try {
            const pushesResponse = await firstValueFrom(
              this.httpService.get(pushesUrl, { ...this.axiosConfig, params })
            );

            const pushes = pushesResponse.data.value;

            const myPushes = pushes.filter(
              (push: any) => push.pushedBy.uniqueName.toLowerCase() === this.userEmail.toLowerCase()
            );

            await Promise.all(
              myPushes.map(async (push: any) => {
                const pushDetailUrl = `${this.orgUrl}/${this.project}/_apis/git/repositories/${repo.id}/pushes/${push.pushId}`;
                
                try {
                  const detailResponse = await firstValueFrom(
                    this.httpService.get(pushDetailUrl, { ...this.axiosConfig, params: { 'api-version': '7.0', includeRefUpdates: true } })
                  );
                  
                  const pushDetails = detailResponse.data;

                  let branchName = 'desconhecida';
                  if (pushDetails.refUpdates && pushDetails.refUpdates.length > 0) {
                    branchName = pushDetails.refUpdates[0].name.replace('refs/heads/', '');
                  }

                  if (pushDetails.commits) {
                    pushDetails.commits.forEach((c: any) => {
                      allCommits.push({
                        commitId: c.commitId.substring(0, 8),
                        comment: c.comment,
                        date: push.date,
                        repositoryName: repo.name,
                        branch: branchName,
                        relatedWorkItemId: this.extractWorkItemId(c.comment),
                      });
                    });
                  }
                } catch (detailError) {
                  this.logger.warn(`Falha ao buscar detalhes do push ${push.pushId} no repo ${repo.name}`);
                }
              })
            );

          } catch (error) {
            this.logger.warn(`Sem pushes ou erro no repo: ${repo.name}`);
          }
        })
      );

      return allCommits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    } catch (error: any) {
      this.logger.error('Erro geral ao buscar Pushes:', error.response?.data || error.message);
      throw new Error('Falha ao comunicar com o Azure DevOps.');
    }
  }

  async getMyWorkItems(startDate: string, endDate: string): Promise<AzureWorkItem[]> {
    try {
      const cleanStartDate = startDate.split('T')[0];
      const cleanEndDate = endDate.split('T')[0];
      const wiqlQuery = {
        query: `
          SELECT [System.Id]
          FROM WorkItems 
          WHERE [System.AssignedTo] CONTAINS '${this.userEmail}' 
            AND [System.ChangedDate] >= '${cleanStartDate}' 
            AND [System.ChangedDate] <= '${cleanEndDate}'
        `,
      };

      const wiqlUrl = `${this.orgUrl}/${this.project}/_apis/wit/wiql?api-version=7.0`;

      const wiqlResponse = await firstValueFrom(
        this.httpService.post(wiqlUrl, wiqlQuery, this.axiosConfig)
      );

      const workItemRefs = wiqlResponse.data.workItems;

      if (!workItemRefs || workItemRefs.length === 0) {
        return [];
      }

      const ids = workItemRefs
        .slice(0, 200)
        .map((ref: any) => ref.id)
        .join(',');

      const detailsUrl = `${this.orgUrl}/${this.project}/_apis/wit/workitems?ids=${ids}&api-version=7.0`;
      
      const detailsResponse = await firstValueFrom(
        this.httpService.get(detailsUrl, this.axiosConfig)
      );

      const workItemsDetails = detailsResponse.data.value;

      return workItemsDetails.map((wi: any) => ({
        id: String(wi.id),
        title: wi.fields['System.Title'],
        state: wi.fields['System.State'],
        type: wi.fields['System.WorkItemType'],
        url: `${this.orgUrl}/${this.project}/_workitems/edit/${wi.id}`,
      }));

    } catch (error: any) {
      this.logger.error('Erro geral ao buscar Work Items:', error.response?.data || error.message);
      throw new Error('Falha ao comunicar com o Azure DevOps (Work Items).');
    }
  }

  private extractWorkItemId(comment: string): string | undefined {
    const match = comment.match(/#(\d+)/);
    return match ? match[1] : undefined;
  }

  private get axiosConfig() {
    return {
      auth: {
        username: '',
        password: this.pat,
      },
    };
  }
}