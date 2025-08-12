<template>
    <div>
        <div class="flex items-center justify-between mb-2">
            <h1 class="text-2xl font-semibold">Usuários</h1>
            <button class="px-3 py-2 rounded-lg bg-brand text-white hover:bg-brand-600">+ Novo Usuário</button>
        </div>
        <p class="text-sm text-gray-500 mb-4">Gerencie todos os usuários</p>

        <div class="flex items-center gap-2 mb-3">
            <div class="flex-1 relative">
                <input v-model="q" placeholder="Buscar usuários..." class="w-full border rounded-lg px-4 py-2 pl-10" />
                <span class="absolute left-3 top-1/2 -translate-y-1/2">🔎</span>
            </div>
            <button class="px-3 py-2 border rounded-lg">Filtros</button>
        </div>

        <div class="bg-white rounded-xl shadow-[var(--shadow-card)] overflow-hidden">
            <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-gray-500">
                    <tr>
                        <th class="text-left px-4 py-2">ID</th>
                        <th class="text-left px-4 py-2">Nome</th>
                        <th class="text-left px-4 py-2">Status</th>
                        <th class="text-left px-4 py-2">Último acesso</th>
                        <th class="px-4 py-2 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="u in users" :key="u.id" class="border-t">
                        <td class="px-4 py-3">{{ u.id }}</td>
                        <td class="px-4 py-3">{{ u.name }}</td>
                        <td class="px-4 py-3"><span class="text-green-700">Ativo</span></td>
                        <td class="px-4 py-3">{{ u.lastAccess }}</td>
                        <td class="px-4 py-3 text-right">…</td>
                    </tr>
                    <tr v-if="users.length === 0">
                        <td colspan="5" class="px-4 py-6 text-center text-gray-500">Nenhum usuário encontrado</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
const q = ref("");
const users = ref([]);

onMounted(() => {
    users.value = [{ id: "01", name: "leonardo.admin", lastAccess: "22/05/2025" }];
});
watch(q, () => {/* futura busca server-side */ });
</script>
