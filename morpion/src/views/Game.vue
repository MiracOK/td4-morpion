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
    flatBoard() {
      if (!this.game) return Array(9).fill('')
      const g = this.game
      const raw = [
        g.r1c1, g.r1c2, g.r1c3,
        g.r2c1, g.r2c2, g.r2c3,
        g.r3c1, g.r3c2, g.r3c3
      ]
      return raw.map(v => v === 1 ? 'X' : v === 2 ? 'O' : '')
    },
    isGameOver() {
      return this.game && this.game.state === 2
    },
    isMyTurn() {
      if (!this.game || !this.user) return false
      return String(this.game.next_player_id) === String(this.user.id)
    },
    // Nom du joueur dont c'est le tour (l'API fournit next_player directement)
    nextPlayerName() {
      if (!this.game) return ''
      if (this.game.next_player) return this.game.next_player.name
      return this.isMyTurn ? this.user.name : (this.game.opponent ? this.game.opponent.name : '...')
    },
    // Adversaire vu par l'utilisateur courant
    opponent() {
      if (!this.game || !this.user) return null
      if (String(this.game.owner_id) === String(this.user.id)) {
        return this.game.opponent
      }
      return this.game.owner
    }
  },
  async beforeRouteEnter(to, from, next) {
    try {
      const gameId = to.params.id
      const [gameResponse, userResponse] = await Promise.all([
        api.get(`/api/games/${gameId}`),
        api.get('/api/profile')
      ])
      next(vm => {
        vm.game = gameResponse.data
        vm.user = userResponse.data
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
        this.ws.send(JSON.stringify({
          action: 'connect',
          game_id: this.game.id,
          player_id: this.user.id
        }))
      }

      this.ws.onmessage = async (event) => {
        const data = JSON.parse(event.data)
        if (data.action === 'opponent-join' || data.action === 'opponent-play') {
          await this.reloadGame()
        } else if (data.action === 'opponent-quit') {
          this.errors.push("Votre adversaire s'est déconnecté temporairement...")
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
        if (err.response?.data?.message) {
          this.errors.push(err.response.data.message)
        } else {
          this.errors.push("Erreur inconnue lors du coup")
        }
      }
    }
  },
  beforeUnmount() {
    if (this.ws) this.ws.close()
  }
}
</script>

<template>
  <div class="page">
    <ErrorAlert :errors="errors" />

    <div v-if="game && user" class="container">

      <!-- En-tête : joueurs -->
      <div class="players">
        <div class="player" :class="{ active: isMyTurn && !isGameOver }">
          <div class="player-label">{{ String(game.owner_id) === String(user.id) ? 'JOUEUR 1' : 'JOUEUR 2' }}</div>
          <div class="player-name">{{ user.name }}</div>
          <div class="player-symbol">{{ String(game.owner_id) === String(user.id) ? 'X' : 'O' }}</div>
        </div>

        <div class="vs">VS</div>

        <div class="player" :class="{ active: !isMyTurn && !isGameOver && opponent }">
          <div class="player-label">{{ String(game.owner_id) === String(user.id) ? 'JOUEUR 2' : 'JOUEUR 1' }}</div>
          <div class="player-name">{{ opponent ? opponent.name : '...' }}</div>
          <div class="player-symbol">{{ String(game.owner_id) === String(user.id) ? 'O' : 'X' }}</div>
        </div>
      </div>

      <!-- Code de la partie -->
      <div class="code-block">
        Code de la partie : <span class="code">{{ game.code }}</span>
      </div>

      <!-- Attente adversaire -->
      <div v-if="!opponent" class="waiting">
        En attente d'un adversaire...
      </div>

      <!-- Partie en cours ou terminée -->
      <div v-else>

        <!-- Fin de partie -->
        <div v-if="isGameOver" class="result">
          <div v-if="game.winner_id">
            <div v-if="String(game.winner_id) === String(user.id)" class="win">VOUS AVEZ GAGNÉ !</div>
            <div v-else class="lose">{{ game.winner ? game.winner.name : 'Adversaire' }} A GAGNÉ</div>
          </div>
          <div v-else class="draw">MATCH NUL</div>
          <button class="btn btn-home" @click="$router.push('/home')">Retour à l'accueil</button>
        </div>

        <!-- Partie en cours -->
        <div v-else>
          <div class="turn-indicator" :class="{ 'my-turn': isMyTurn }">
            {{ isMyTurn ? 'C\'est votre tour !' : `Tour de ${nextPlayerName}` }}
          </div>

          <div class="board">
            <button
              v-for="(cell, index) in flatBoard"
              :key="index"
              class="cell"
              :class="{
                'cell-x': cell === 'X',
                'cell-o': cell === 'O',
                'cell-playable': !cell && isMyTurn
              }"
              :disabled="!!cell || !isMyTurn"
              @click="play(index)"
            >
              {{ cell }}
            </button>
          </div>
        </div>

      </div>

      <button class="btn btn-quit" @click="$router.push('/home')">Quitter la partie</button>

    </div>

    <div v-else class="loading">Chargement de la partie...</div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f0f2f5;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 40px 16px;
  font-family: sans-serif;
}

.container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  padding: 32px;
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

/* Joueurs */
.players {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  justify-content: center;
}

.player {
  flex: 1;
  text-align: center;
  padding: 12px;
  border-radius: 12px;
  border: 2px solid #e0e0e0;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.player.active {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
}

.player-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: #9ca3af;
  letter-spacing: 1px;
}

.player-name {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  margin: 4px 0;
}

.player-symbol {
  font-size: 22px;
  font-weight: 800;
  color: #4f46e5;
}

.vs {
  font-weight: 800;
  color: #d1d5db;
  font-size: 18px;
}

/* Code */
.code-block {
  font-size: 14px;
  color: #6b7280;
}

.code {
  font-weight: 700;
  font-size: 18px;
  color: #111827;
  letter-spacing: 3px;
  background: #f3f4f6;
  padding: 4px 10px;
  border-radius: 6px;
}

/* Attente */
.waiting {
  font-size: 15px;
  color: #d97706;
  background: #fef3c7;
  padding: 12px 20px;
  border-radius: 10px;
  font-weight: 500;
}

/* Indicateur de tour */
.turn-indicator {
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  background: #f3f4f6;
  padding: 10px 20px;
  border-radius: 10px;
}

.turn-indicator.my-turn {
  color: #4f46e5;
  background: #eef2ff;
}

/* Grille */
.board {
  display: grid;
  grid-template-columns: repeat(3, 90px);
  grid-template-rows: repeat(3, 90px);
  gap: 8px;
}

.cell {
  width: 90px;
  height: 90px;
  font-size: 36px;
  font-weight: 800;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: #f9fafb;
  cursor: default;
  transition: background 0.15s, transform 0.1s;
  color: #111827;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cell-playable {
  cursor: pointer;
  background: white;
}

.cell-playable:hover {
  background: #eef2ff;
  border-color: #4f46e5;
  transform: scale(1.05);
}

.cell-x {
  color: #4f46e5;
}

.cell-o {
  color: #ef4444;
}

/* Résultat */
.result {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.win  { font-size: 26px; font-weight: 800; color: #16a34a; }
.lose { font-size: 22px; font-weight: 700; color: #dc2626; }
.draw { font-size: 22px; font-weight: 700; color: #6b7280; }

/* Boutons */
.btn {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn:hover { opacity: 0.85; }

.btn-home {
  background: #4f46e5;
  color: white;
}

.btn-quit {
  background: #f3f4f6;
  color: #374151;
  width: 100%;
}

/* Loading */
.loading {
  color: #6b7280;
  font-size: 16px;
}
</style>



