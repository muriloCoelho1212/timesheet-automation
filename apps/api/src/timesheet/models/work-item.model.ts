import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType({ description: 'Representa um card/tarefa do Azure DevOps' })
export class AzureWorkItem {
  @Field(() => ID)
  id!: string;

  @Field({ description: 'O título da tarefa' })
  title!: string;

  @Field({ description: 'O estado atual (Ex: Active, Resolved, Closed)' })
  state!: string;

  @Field({ description: 'O tipo da tarefa (Ex: Bug, User Story, Task)' })
  type!: string;

  @Field({ description: 'Link direto para abrir a tarefa no navegador' })
  url!: string;
}