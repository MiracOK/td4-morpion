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
  computed: {
    // Aplatit le board qu'il soit 1D [9] ou 2D [[3],[3],[3]]
    flatBoard() {
      if (!this.game || !this.game.board) return []
      if (Array.isArray(this.game.board[0])) {
        return this.game.board.flat()
      }
      return this.game.board
    },
    isMyTurn() {
      if (!this.game || !this.user) return false
      // Comparaison en string pour éviter les problèmes number/string
      return String(this.game.next_player_id) === String(this.user.id)
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
    async reloadGame() {
      try {
        const response = await api.get(`/api/games/${this.game.id}`)
        this.game = response.data
      } catch (e) {
        console.error('Erreur rechargement partie:', e)
      }
    },
    waitForOpponentMove() {
      const wsURL = 'wss://morpion-api.edu.netlor.fr/websockets'
      this.ws = new WebSocket(wsURL)
      
      this.ws.onopen = () => {
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
          // Recharger la partie complète pour obtenir l'adversaire et le board initialisé
          await this.reloadGame()
        } else if (data.action === 'opponent-play') {
          // Recharger la partie pour avoir le coup, le statut et next_player_id à jour
          await this.reloadGame()
        } else if (data.action === 'opponent-quit') {
          // Ne pas supprimer l'adversaire — il peut se reconnecter (ex: refresh)
          // Juste afficher un avertissement temporaire
          this.errors.push("Votre adversaire s'est déconnecté temporairement...")
          // Effacer l'avertissement après 5 secondes
          setTimeout(() => {
            this.errors = this.errors.filter(e => e !== "Votre adversaire s'est déconnecté temporairement...")
          }, 5000)
        }
      }
      
      this.ws.onerror = () => {
        this.errors.push("Erreur de connexion WebSocket")
      }
      
      this.ws.onclose = () => {
        console.log('WebSocket fermé')
      }
    },
    async play(index) {
      this.errors = []
      const row = Math.floor(index / 3) + 1
      const col = (index % 3) + 1

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
      <strong>Code de la partie :</strong> {{ game.code }}
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
            <span v-if="isMyTurn" style="color: blue; font-weight: bold;">
              Vous ({{ user.name }})
            </span>
            <span v-else>
              {{ game.opponent.name }}
            </span>
          </div>
          
          <div style="margin-top: 20px">
            <h2>Grille</h2>
            <div v-if="flatBoard.length" style="display: grid; grid-template-columns: repeat(3, 60px); gap: 5px;">
              <button
                v-for="(cell, index) in flatBoard"
                :key="index"
                style="width: 60px; height: 60px; font-size: 24px; font-weight: bold; cursor: pointer;"
                @click="play(index)"
                :disabled="!!cell || !isMyTurn || game.status == 2"
              >
                {{ cell }}
              </button>
            </div>
            <div v-else>Chargement de la grille...</div>
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