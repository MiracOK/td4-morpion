<script>
import api from '@/api'
import ErrorAlert from '@/components/ErrorAlert.vue'

export default {
  components: { ErrorAlert },
  data() {
    return {
      gameCode: '',
      errors: []
    }
  },
  methods: {
    async joinGame() {
      this.errors = []
      if (!this.gameCode) {
        this.errors.push("Veuillez saisir un code de partie")
        return
      }

      try {
        //  appel Ajax sur la route /api/games/:code/join
        const response = await api.patch(`/api/games/${this.gameCode}/join`)
        const gameId = response.data.id
        // Redirigez l’utilisateur vers la partie (/games/:id)
        this.$router.push({ name: 'game', params: { id: gameId } })
      } catch (err) {
        if (err.response && err.response.data && err.response.data.message) {
           this.errors.push(err.response.data.message)
        } else {
           this.errors.push("Impossible de rejoindre la partie. Vérifiez le code.")
        }
      }
    }
  }
}
</script>

<template>
  <div class="page">
    <div class="card">
      <button class="back-btn" @click="$router.push('/home')">← Retour</button>
      <h1 class="title">Rejoindre une partie</h1>
      <p class="subtitle">Saisissez le code communiqué par votre ami</p>

      <ErrorAlert :errors="errors" />

      <div class="form">
        <div class="field">
          <label class="field-label">Code de la partie</label>
          <input
            class="field-input code-input"
            v-model.trim="gameCode"
            type="text"
            placeholder="Ex : QTAMF3"
            maxlength="10"
            @keyup.enter="joinGame"
          />
        </div>
        <button class="btn btn-primary" @click="joinGame">Rejoindre</button>
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

.subtitle {
  font-size: 14px;
  color: #9ca3af;
  margin-top: -8px;
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

.code-input {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 6px;
  text-transform: uppercase;
  text-align: center;
}

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
</style>
