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
        const response = await api.post(`/api/games/${this.gameCode}/join`)
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
  <h1>Rejoindre une partie</h1>
  
  <ErrorAlert :errors="errors" />

  <div>
    <label>
      Code de la partie :
      <input v-model.trim="gameCode" type="text" placeholder="Entrez le code ici" />
    </label>
    <button @click="joinGame">Rejoindre</button>
  </div>
  
  <br>
  <button @click="$router.push('/home')">Retour</button>
</template>
