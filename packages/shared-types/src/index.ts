export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

/** Representa um commit feito no Azure DevOps */
export type AzureCommit = {
  __typename?: 'AzureCommit';
  /** Nome da branch onde o push foi feito */
  branch: Scalars['String']['output'];
  /** A mensagem descritiva do commit */
  comment: Scalars['String']['output'];
  commitId: Scalars['ID']['output'];
  /** Data e hora em que o commit foi submetido (ISO String) */
  date: Scalars['String']['output'];
  /** ID da tarefa associada (se mencionada na mensagem) */
  relatedWorkItemId: Maybe<Scalars['String']['output']>;
  /** Nome do repositório onde o código foi alterado */
  repositoryName: Scalars['String']['output'];
};

/** Representa um card/tarefa do Azure DevOps */
export type AzureWorkItem = {
  __typename?: 'AzureWorkItem';
  id: Scalars['ID']['output'];
  /** O estado atual (Ex: Active, Resolved, Closed) */
  state: Scalars['String']['output'];
  /** O título da tarefa */
  title: Scalars['String']['output'];
  /** O tipo da tarefa (Ex: Bug, User Story, Task) */
  type: Scalars['String']['output'];
  /** Link direto para abrir a tarefa no navegador */
  url: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  hello: Scalars['String']['output'];
  myCommits: Array<AzureCommit>;
  myWorkItems: Array<AzureWorkItem>;
};


export type QueryMyCommitsArgs = {
  endDate: Scalars['String']['input'];
  startDate: Scalars['String']['input'];
};


export type QueryMyWorkItemsArgs = {
  endDate: Scalars['String']['input'];
  startDate: Scalars['String']['input'];
};
