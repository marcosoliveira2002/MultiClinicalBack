<template>
  <div class="min-h-screen grid place-items-center bg-gray-50">
    <div class="w-full max-w-md">
      <div class="flex items-center justify-center gap-2 mb-6">
        <div class="size-10 grid place-items-center rounded-xl bg-brand text-white">❤</div>
        <div class="text-xl font-semibold">MultiClinical</div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-[var(--shadow-card)]">
        <h1 class="text-center text-xl font-semibold">Esqueci minha senha</h1>
        <p class="text-center text-sm text-gray-500 mt-1">
          Informe seu email e nós enviaremos um link para recuperar sua senha
        </p>

        <div class="mt-6">
          <label class="block text-sm mb-1">Email</label>
          <input v-model.trim="email" type="email" class="w-full border rounded px-3 py-2" />
        </div>

        <button class="mt-5 w-full py-2 rounded-xl bg-brand text-white hover:bg-brand-600">
          Recuperar senha
        </button>

        <RouterLink to="/login" class="mt-6 inline-flex items-center gap-2 text-brand hover:underline">
          ← Voltar para o login
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
const email = ref("");
</script>
