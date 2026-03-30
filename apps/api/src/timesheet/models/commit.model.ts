import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType({ description: 'Representa um commit feito no Azure DevOps' })
export class AzureCommit {
  @Field(() => ID)
  commitId!: string;

  @Field({ description: 'A mensagem descritiva do commit' })
  comment!: string;

  @Field({ description: 'Data e hora em que o commit foi submetido (ISO String)' })
  date!: string;

  @Field({ description: 'Nome do repositório onde o código foi alterado' })
  repositoryName! : string;

  @Field({ description: 'Nome da branch onde o push foi feito' })
  branch!: string;

  @Field({ nullable: true, description: 'ID da tarefa associada (se mencionada na mensagem)' })
  relatedWorkItemId?: string;
}