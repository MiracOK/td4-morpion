<script>
import api from '@/api'
import ErrorAlert from '@/components/ErrorAlert.vue'

export default {
  components: { ErrorAlert },
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
      
      this.ws.onmessage = async (event) => {
        const data = JSON.parse(event.data)
        
        if (data.action === 'opponent-join') {
          // L'adversaire a rejoint la partie
          this.game.opponent = data.opponent
        } else if (data.action === 'opponent-play') {
          // L'adversaire a joué une cellule
          if (data.board) this.game.board = data.board
          if (data.next_player_id) this.game.next_player_id = data.next_player_id

          // Recharger la partie pour avoir le statut à jour
          try {
             const response = await api.get(`/api/games/${this.game.id}`)
             this.game = response.data
          } catch(e) { console.error(e) }

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
    },
    async play(index) {
      this.errors = []
      const row = Math.floor(index / 3)
      const col = index % 3

      try {
        const response = await api.patch(`/api/games/${this.game.id}/play/${row}/${col}`)
        this.game = response.data
      } catch (err) {
        if (err.response && err.response.data && err.response.data.message) {
           this.errors.push(err.response.data.message)
        } else {
           this.errors.push("Erreur inconnue lors du coup")
        }
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
  <ErrorAlert :errors="errors" />
  
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
      
      <!-- Fin de partie -->
      <div v-if="game.status == 2" style="background: #eee; padding: 20px; text-align: center; margin-top: 20px;">
        <h3>Partie terminée !</h3>
        <div v-if="game.winner_id">
             <span v-if="game.winner_id === user.id" style="color:green; font-weight:bold;">VOUS AVEZ GAGNÉ !</span>
             <span v-else style="color:red; font-weight:bold;">{{ game.opponent.name }} A GAGNÉ !</span>
        </div>
        <div v-else>
             <span style="font-weight:bold;">MATCH NUL !</span>
        </div>
      </div>

      <!-- Grille de jeu (si partie en cours) -->
      <div v-else>
          <!-- Afficher qui doit jouer -->
          <div style="margin: 10px 0;">
            <strong>Au tour de :</strong>
            <span v-if="game.next_player_id === user.id" style="color: blue; font-weight: bold;">
              Vous ({{ user.name }})
            </span>
            <span v-else>
              {{ game.opponent.name }}
            </span>
          </div>
          
          <div style="margin-top: 20px">
            <h2>Grille</h2>
            <div style="display: grid; grid-template-columns: repeat(3, 50px); gap: 5px;">
              <button
                v-for="(cell, index) in game.board"
                :key="index"
                style="width: 50px; height: 50px; font-size: 20px; font-weight: bold; cursor: pointer;"
                @click="play(index)"
                :disabled="!!cell || game.next_player_id !== user.id"
              >
                {{ cell }}
              </button>
            </div>
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