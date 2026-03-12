<script>
import api from '@/api'
import ErrorAlert from '@/components/ErrorAlert.vue'

export default {
  components: { ErrorAlert },
  data() {
    return {
      user: null,
      errors: []
    }
  },
  async beforeRouteEnter(to, from, next) {
    try {
      const response = await api.get('/api/profile')
      next(vm => { vm.user = response.data })
    } catch (err) {
      next(vm => { vm.errors = ["Impossible de charger le profil"] })
    }
  },
  methods: {
    async save() {
      this.errors = []
      try {
        const response = await api.put('/api/profile', this.user)
        this.user = response.data
        console.log(response.data)
      } catch (err) {
        if (err.response && err.response.data && err.response.data.errors) {
          this.errors = err.response.data.errors
        } else if (err.response && err.response.data && err.response.data.message) {
          this.errors = [err.response.data.message]
        } else {
          this.errors = ["Erreur inconnue"]
        }
      }
    }
  }
}
</script>

<template>
  <div class="page">
    <div class="card">
      <button class="back-btn" @click="$router.push('/home')">Retour</button>
      <h1 class="title">Mon profil</h1>

      <ErrorAlert :errors="errors" />

      <div v-if="user" class="form">
        <div class="field">
          <label class="field-label">Surnom</label>
          <input class="field-input" v-model.trim="user.name" type="text" placeholder="Votre surnom" />
        </div>
        <div class="field">
          <label class="field-label">Email</label>
          <input class="field-input" v-model.trim="user.email" type="email" placeholder="votre@email.com" />
        </div>
        <button class="btn btn-primary" @click="save">Enregistrer</button>
      </div>

      <div v-else class="loading">Chargement du profil...</div>
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
  padding: 40px;
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.back-btn {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  text-align: left;
  transition: color 0.2s;
}
.back-btn:hover { color: #4f46e5; }

.title {
  font-size: 24px;
  font-weight: 800;
  color: #111827;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.field-input {
  padding: 12px 14px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: 15px;
  color: #111827;
  transition: border-color 0.2s;
  outline: none;
}
.field-input:focus { border-color: #4f46e5; }

.btn {
  padding: 14px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: opacity 0.2s;
  margin-top: 4px;
}
.btn:hover { opacity: 0.88; }
.btn-primary { background: #4f46e5; color: white; }

.loading {
  color: #9ca3af;
  font-size: 14px;
  text-align: center;
}
</style>