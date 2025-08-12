<template>
  <div class="min-h-screen bg-gray-50 text-gray-900">
    <!-- Topbar -->
    <header class="h-14 border-b bg-white flex items-center justify-between px-4">
      <div class="flex items-center gap-2">
        <div class="size-8 grid place-items-center rounded-lg bg-brand text-white">❤</div>
        <span class="font-semibold">MultiClinical</span>
      </div>
      <div class="size-8 rounded-full bg-gray-200 grid place-items-center text-xs font-medium">LS</div>
    </header>

    <!-- Body -->
    <div class="flex">
      <!-- Sidebar -->
      <aside class="hidden md:block w-64 border-r bg-white p-3">
        <nav class="space-y-1 text-sm">
          <RouterLink to="/" class="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100"
            :class="{ 'bg-gray-100 font-medium' : $route.name==='dashboard' }">
            <span>🏠</span><span>Dashboard</span>
          </RouterLink>

          <div class="mt-4 text-xs uppercase text-gray-500 px-3">Administração</div>
          <RouterLink to="/users" class="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100"
            :class="{ 'bg-gray-100 font-medium' : $route.name==='users' }">
            <span>👤</span><span>Usuários</span>
          </RouterLink>
        </nav>
      </aside>

      <!-- Content -->
      <main class="flex-1 p-4">
        <RouterView />
      </main>
    </div>
  </div>
</template>
