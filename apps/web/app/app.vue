<template>
  <UContainer class="py-10 max-w-4xl">
    <h1 class="text-3xl font-bold mb-8">Meu Timesheet Automático</h1>

    <UCard class="mb-8">
      <div class="flex items-end gap-4">
        <UFormField label="Data Inicial" class="flex-1">
          <UInput type="date" v-model="startDate" icon="i-heroicons-calendar" />
        </UFormField>

        <UFormField label="Data Final" class="flex-1">
          <UInput type="date" v-model="endDate" icon="i-heroicons-calendar" />
        </UFormField>
      </div>
    </UCard>

    <div v-if="pending" class="flex items-center gap-2 text-gray-500">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin w-5 h-5" />
      <span>Buscando dados no Azure DevOps...</span>
    </div>

    <UAlert v-else-if="error" color="error" variant="soft" title="Erro ao buscar dados" :description="error.message" />

    <div v-else-if="data" class="space-y-10">

      <details class="group bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm" open>
        <summary class="flex cursor-pointer items-center justify-between p-4 font-semibold list-none [&::-webkit-details-marker]:hidden">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-clipboard-document-list" class="w-6 h-6 text-emerald-500" />
            <span class="text-lg">Tarefas do Período ({{ data.myWorkItems.length }})</span>
          </div>
          <UIcon name="i-heroicons-chevron-down" class="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180" />
        </summary>

        <div class="p-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
          <UCard v-for="task in data.myWorkItems" :key="task.id" class="hover:border-emerald-500/50 transition-colors">
            <div class="flex items-start justify-between">
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <UBadge :color="task.state === 'Closed' || task.state === 'Done' ? 'success' : 'info'" variant="subtle">
                    {{ task.state }}
                  </UBadge>
                  <UBadge color="neutral" variant="solid">{{ task.type }}</UBadge>
                  <span class="text-sm text-gray-500 font-mono">#{{ task.id }}</span>
                </div>
                <p class="text-gray-700 dark:text-gray-300 font-medium">{{ task.title }}</p>
              </div>
              <div class="ml-4">
                <UButton :to="task.url" target="_blank" icon="i-heroicons-arrow-top-right-on-square" color="neutral" variant="ghost" size="sm" />
              </div>
            </div>
          </UCard>
          <div v-if="data.myWorkItems.length === 0" class="text-gray-500 italic p-4 text-center border rounded-lg border-dashed">
            Nenhuma tarefa movimentada.
          </div>
        </div>
      </details>

      <div>
        <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
          <UIcon name="i-heroicons-code-bracket" class="w-6 h-6 text-primary" />
          Meus Apontamentos Diários
        </h2>

        <div class="space-y-4">
          <details
            v-for="dia in groupedCommits"
            :key="dia.dateStr"
            class="group bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm"
            open
          >
            <summary class="flex cursor-pointer items-center justify-between p-4 font-semibold list-none [&::-webkit-details-marker]:hidden bg-gray-50 dark:bg-gray-800/50 rounded-t-lg">
              <div class="flex items-center gap-3">
                <UIcon name="i-heroicons-calendar-days" class="w-5 h-5 text-primary" />
                <span class="text-lg">{{ dia.dateStr }}</span>
                <UBadge color="primary" variant="subtle">{{ dia.commits.length }} commits</UBadge>
              </div>
              <UIcon name="i-heroicons-chevron-down" class="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180" />
            </summary>

            <div class="p-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
              <UCard v-for="commit in dia.commits" :key="commit.commitId" class="hover:border-primary/50 transition-colors">
                <div class="flex items-start justify-between">
                  <div>
                    <div class="flex items-center gap-2 mb-2">
                      <UBadge color="primary" variant="subtle">{{ commit.repositoryName }}</UBadge>
                      <UBadge color="neutral" variant="solid">{{ commit.branch }}</UBadge>
                      <span class="text-sm text-gray-500 font-mono">#{{ commit.commitId }}</span>
                    </div>
                    <p class="text-gray-700 dark:text-gray-300 font-medium">{{ commit.comment }}</p>
                  </div>
                  <div class="text-sm text-gray-500 text-right whitespace-nowrap ml-4">
                    {{ new Date(commit.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }}
                  </div>
                </div>
              </UCard>
            </div>
          </details>

          <div v-if="groupedCommits.length === 0" class="text-gray-500 italic p-4 text-center border rounded-lg border-dashed">
            Nenhum commit encontrado neste período.
          </div>
        </div>
      </div>

    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { AzureCommit, AzureWorkItem } from '@timesheet/shared-types';

const today = new Date();
const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
const formatDateForInput = (date: Date) => date.toISOString().split('T')[0];

const startDate = ref(formatDateForInput(firstDayOfMonth));
const endDate = ref(formatDateForInput(today));

const queryVariables = computed(() => ({
  start: `${startDate.value}T00:00:00Z`,
  end: `${endDate.value}T23:59:59Z`
}));

const query = gql`
  query GetMyTimesheet($start: String!, $end: String!) {
    myCommits(startDate: $start, endDate: $end) {
      commitId
      branch
      comment
      repositoryName
      date
    }
    myWorkItems(startDate: $start, endDate: $end) {
      id
      title
      state
      type
      url
    }
  }
`;

const { data, pending, error } = await useAsyncQuery<{
  myCommits: AzureCommit[];
  myWorkItems: AzureWorkItem[];
}>(query, queryVariables);

// --- A MÁGICA DO AGRUPAMENTO POR DIA ---
const groupedCommits = computed(() => {
  if (!data.value?.myCommits) return [];

  // 1. Criamos um dicionário { '29/03/2026': [commits...], '28/03/2026': [commits...] }
  const groups = data.value.myCommits.reduce((acc, commit) => {
    const dateObj = new Date(commit.date);
    const dateStr = dateObj.toLocaleDateString('pt-BR'); // Extrai apenas a data no formato BR

    if (!acc[dateStr]) {
      acc[dateStr] = { dateStr, dateObj, commits: [] };
    }
    acc[dateStr].commits.push(commit);

    return acc;
  }, {} as Record<string, { dateStr: string, dateObj: Date, commits: AzureCommit[] }>);

  // 2. Transformamos em array e ordenamos do dia mais novo para o mais velho
  return Object.values(groups).sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
});
</script>
