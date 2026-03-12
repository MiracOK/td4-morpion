<script>
import api from '@/api'
export default {
  data() {
    return {
      errors: [],
      loading: false
    }
  },
  methods: {
    async createGame() {
      this.loading = true
      this.errors = []
      try {
        const response = await api.post('/api/games')
        this.$router.push({ name: 'game', params: { id: response.data.id } })
      } catch (err) {
        this.errors = ['Erreur lors de la création de la partie']
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<template>
  <div class="page">
    <div class="card">
      <div class="logo">✕ ○</div>
      <h1 class="title">Morpion</h1>
      <p class="subtitle">Jouez en ligne contre un ami</p>

      <div v-if="errors.length" class="error-banner">
        {{ errors[0] }}
      </div>

      <div class="menu">
        <button class="btn btn-primary" :disabled="loading" @click="createGame">
          {{ loading ? 'Création...' : '+ Nouvelle partie' }}
        </button>
        <RouterLink to="/join" class="btn btn-secondary">Rejoindre une partie</RouterLink>
        <RouterLink to="/profile" class="btn btn-ghost">Mon profil</RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px 16px;
}

.card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  padding: 48px 40px;
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.logo {
  font-size: 40px;
  font-weight: 900;
  color: #4f46e5;
  letter-spacing: 6px;
  margin-bottom: 4px;
}

.title {
  font-size: 28px;
  font-weight: 800;
  color: #111827;
}

.subtitle {
  font-size: 14px;
  color: #9ca3af;
  margin-bottom: 8px;
}

.error-banner {
  background: #fee2e2;
  color: #b91c1c;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 13px;
  width: 100%;
  text-align: center;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  margin-top: 8px;
}

.btn {
  display: block;
  width: 100%;
  padding: 14px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  text-align: center;
  cursor: pointer;
  border: none;
  transition: opacity 0.2s, transform 0.1s;
}

.btn:hover { opacity: 0.88; transform: translateY(-1px); }
.btn:active { transform: translateY(0); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

.btn-primary  { background: #4f46e5; color: white; }
.btn-secondary { background: #eef2ff; color: #4f46e5; }
.btn-ghost     { background: #f3f4f6; color: #374151; }
</style>