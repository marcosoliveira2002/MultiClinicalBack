<template>
    <div class="min-h-screen grid place-items-center bg-gray-50">
        <div class="w-full max-w-md">
            <div class="flex items-center justify-center gap-2 mb-6">
                <div class="size-10 grid place-items-center rounded-xl bg-brand text-white">❤</div>
                <div class="text-xl font-semibold">MultiClinical</div>
            </div>

            <form @submit.prevent="onSubmit" class="bg-white rounded-xl p-6 shadow-[var(--shadow-card)]">
                <h1 class="text-center text-xl font-semibold">Entrar</h1>
                <p class="text-center text-sm text-gray-500 mt-1">Entre com suas credenciais para acessar sua conta</p>

                <div class="mt-6">
                    <label class="block text-sm mb-1">Email</label>
                    <input v-model.trim="email" type="email" class="w-full border rounded px-3 py-2" />
                </div>

                <div class="mt-4">
                    <div class="flex items-center justify-between">
                        <label class="block text-sm mb-1">Senha</label>
                        <RouterLink to="/forgot" class="text-sm text-brand hover:underline">Esqueci minha senha
                        </RouterLink>
                    </div>
                    <input v-model.trim="password" type="password" class="w-full border rounded px-3 py-2" />
                </div>

                <label class="mt-3 flex items-center gap-2 text-sm text-gray-600">
                    <input type="checkbox" class="size-4" v-model="remember" />
                    Lembrar de mim
                </label>

                <p v-if="error" class="text-sm text-red-600 mt-2">{{ error }}</p>

                <button :disabled="loading" class="mt-5 w-full py-2 rounded-xl bg-brand text-white hover:bg-brand-600">
                    {{ loading ? "Entrando..." : "Entrar" }}
                </button>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../../stores/auth";

const email = ref("");
const password = ref("");
const remember = ref(false);
const loading = ref(false);
const error = ref("");

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

async function onSubmit() {
    loading.value = true; error.value = "";
    try {
        await auth.login({ email: email.value, password: password.value });
        const to = String(route.query.redirect || "/");
        router.push(to);
    } catch (e) {
        error.value = e?.message || "Falha no login";
    } finally {
        loading.value = false;
    }
}
</script>
