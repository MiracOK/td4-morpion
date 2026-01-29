<script>
import api from '@/api'

export default {
  data() {
    return {
      game: null,
      user: null,
      errors: [],
      ws: null
    }
  },
  async beforeRouteEnter(to, from, next) {
    try {
      // Récupérer l'id de la partie depuis les paramètres de la route
      console.log(to)
      const gameId = to.params.id
      
      // Appel API pour récupérer les infos de la partie
      const gameResponse = await api.get(`/api/games/${gameId}`)
      const game = gameResponse.data
      
      // Récupérer les infos de l'utilisateur
      const userResponse = await api.get('/api/profile')
      const user = userResponse.data
      
      next(vm => {
        vm.game = game
        vm.user = user
        // Démarrer la connexion WebSocket
        vm.waitForOpponentMove()
      })
    } catch (err) {
      next(vm => {
        vm.errors = ["Impossible de charger la partie"]
      })
    }
  },
  methods: {
    waitForOpponentMove() {
      const wsURL = 'wss://morpion-api.edu.netlor.fr/websockets'
      this.ws = new WebSocket(wsURL)
      
      this.ws.onopen = () => {
        // Envoyer le message de connexion
        const message = {
          action: 'connect',
          game_id: this.game.id,
          player_id: this.user.id
        }
        this.ws.send(JSON.stringify(message))
      }
      
      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        
        if (data.action === 'opponent-join') {
          // L'adversaire a rejoint la partie
          this.game.opponent = data.opponent
        } else if (data.action === 'opponent-play') {
          // L'adversaire a joué une cellule
          this.game.board = data.board
          this.game.next_player_id = data.next_player_id
        } else if (data.action === 'opponent-quit') {
          // L'adversaire a quitté la partie
          this.errors.push("Votre adversaire a quitté la partie")
          this.game.opponent = null
        }
      }
      
      this.ws.onerror = (error) => {
        this.errors.push("Erreur de connexion WebSocket")
      }
      
      this.ws.onclose = () => {
        console.log('WebSocket fermé')
      }
    }
  },
  beforeUnmount() {
    if (this.ws) {
      this.ws.close()
    }
  }
}
</script>

<template>
  <div v-if="errors.length">
    <ul>
      <li v-for="err in errors" :key="err" style="color:red">{{ err }}</li>
    </ul>
  </div>
  
  <div v-if="game && user">
    <h1>Partie de Morpion</h1>
    
    <!-- Afficher les infos de l'utilisateur -->
    <div>
      <strong>Vous :</strong> {{ user.name }} ({{ user.email }})
    </div>
    
    <!-- Afficher le code de la partie -->
    <div>
      <strong>Code de la partie :</strong> {{ game.id }}
    </div>
    
    <!-- Message d'attente si pas d'adversaire -->
    <div v-if="!game.opponent" style="color:orange">
      En attente d'un adversaire... Communiquez le code de la partie à votre adversaire
    </div>
    
    <!-- Afficher les infos de l'adversaire et la grille si adversaire connecté -->
    <div v-if="game.opponent">
      <div>
        <strong>Adversaire :</strong> {{ game.opponent.name }} ({{ game.opponent.email }})
      </div>
      
      <!-- Afficher qui doit jouer -->
      <div>
        <strong>Au tour de :</strong>
        <span v-if="game.next_player_id === user.id">
          Vous ({{ user.name }})
        </span>
        <span v-else>
          {{ game.opponent.name }}
        </span>
      </div>
      
      <!-- Grille de jeu -->
      <div style="margin-top: 20px">
        <h2>Grille</h2>
        <div style="display: grid; grid-template-columns: repeat(3, 50px); gap: 5px;">
          <button
            v-for="(cell, index) in game.board"
            :key="index"
            style="width: 50px; height: 50px; font-size: 20px; font-weight: bold"
          >
            {{ cell }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Bouton de retour -->
    <div style="margin-top: 20px">
      <button @click="$router.push('/home')">Retour à l'accueil</button>
    </div>
  </div>
  
  <div v-else>
    Chargement de la partie...
  </div>
</template>