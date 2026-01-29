<script>
import api from '@/api' 
export default {
  data() {
    return {
      errors: []
    }
  },
 
  methods: {
    async createGame(){
      try {
        const response = await api.post('/api/games')
        console.log(response.data.id)
        const gameId = response.data.id
        this.$router.push({ name: 'game', params: { id: gameId } })
      } catch (err) {
        this.errors = ["Erreur lors de la création de la partie"]
      }
    }
  }
}

</script>
<template>
  <h1>Morpion</h1>
 
  <nav>
    <RouterLink @click="createGame()" to="/game">Jouer</RouterLink><br>
    <RouterLink to="/join">Rejoindre</RouterLink><br>
    <RouterLink to="/profile">Profile</RouterLink>
  </nav>
  </template>