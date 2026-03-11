<script>
import { ref } from 'vue'
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
  <h1>Profile</h1>
  <button @click="$router.push('/home')">Retour</button>
  
  <ErrorAlert :errors="errors" />

  <div v-if="user">
    <label>
      Nom :
      <input v-model.trim="user.name" type="text" />
    </label>
    <br>
    <label>
      Email :
      <input v-model.trim="user.email" type="email" />
    </label>
    <br>
    <button @click="save">Enregistrer</button>
  </div>
  <div v-else>
    Chargement du profil...
  </div>
</template>