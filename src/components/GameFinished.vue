<template>
  <div class="game-menu-info">
    <div class="game-menu-feedback">
      
      <Teleport to="#main-container">
        <div class="main-scoreboard">
          <div 
            class="loader" 
            v-if="scores.length === 0">
          </div>
          <div v-else>
            <p> {{ playgroundFullName }} - {{  difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}} mode</p>
            <hr>
            <table>
              <thead>
                <tr>
                  <td>Name</td>
                  <td>Score</td>
                  <td>Duration</td>
                </tr>
              </thead>
              <tbody>
                <tr v-for="score in scores" :key="score.id">
                  <td>{{ score.player_name }}</td>
                  <td>{{ score.nb_success }}/{{ score.total_attemps }}</td>
                  <td>{{ typeof score.total_time_spent == "string" ? "---" : score.total_time_spent /1000 + "s" }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Teleport>

      <div class="game-menu-finished">
        <span>
          Congratulation, your score is {{ nbSuccess }}/{{ totalAttemps }}<span v-if="isTimer"> in {{ totalTimeSpent/1000}}s</span>!
        </span>
        <span v-if="!isTimer"><span class="red-text">Play ranked</span> to save your score in the scoreboard.</span>
        <button
          @click="pushScore"
          v-if="!isScorePushed && isTimer"
          class="button button-red"
        >
          Push your score!
        </button>


        <button 
          @click="$emit('replay')"
          class="button button-yellow"
        >
          Replay this mode!
        </button>
        <button
          @click="$emit('restart')"
          class="button button-yellow"
        >
          Select another game mode
        </button>
      </div>

    </div>
  </div>
</template>

<script>
import { onMounted, ref, defineComponent, computed } from 'vue';
import { supabase } from '../lib/supabaseClient'
import { useStore } from 'vuex';

export default defineComponent({
  name: 'GameFinished',
  props: {
    nbSuccess: Number,
    totalAttemps: Number,
    totalTimeSpent: Number,
    isTimer: Boolean
  },
  
  setup(props) {
    const store = useStore();

    const scores = ref([])
    const isScorePushed = ref(false)
    
    const playgroundFileName = computed(() => store.state.playgroundFileName);
    const playgroundFullName = computed(() => store.state.playgroundFullName);
    const difficulty = computed(() => store.state.difficulty);
    const isTimer = computed(() => store.state.isTimer);

    async function getScores() {
      let {data, error} = await supabase
      .from('scores')
      .select('*')
      .eq('playground', playgroundFileName.value)
      .eq('hard_mode', difficulty.value == "hard")
      .order('nb_success', { ascending: false }) // Order by nb_success descending
      .order('total_time_spent', { ascending: true }) // Then order by total_time_spent ascending
      .limit(10); // Limit to 15 results

      if (error) {
        // handle error
        console.log(error);
      } else {
        scores.value = data;

        // Calculate how many placeholder items are needed
        const placeholdersNeeded = 10 - scores.value.length;

        // Generate and append placeholder items
        for (let i = 0; i < placeholdersNeeded; i++) {
          scores.value.push({
            "id": i-100,
            "player_name": "---",
            "nb_success": "--",
            "total_attemps": "--",
            "total_time_spent": "---"
          });
        }
      }
    }

    async function pushScore() {
      let playerName;
      do {
        playerName = prompt(playerName || playerName == "" ? "Invalid player name.  What's your name? The name must be between 1 and 15 characters." : "What's your name? The name must be between 1 and 15 characters.");
        if (playerName === null) {break;}
      } 
      while (playerName.length === 0 || playerName.length > 15);
      
      const { data, error } = await supabase
        .from('scores')
        .insert({
          player_name: playerName,
          playground: playgroundFileName.value,
          hard_mode: difficulty.value == "hard",
          nb_success: props.nbSuccess,
          total_attemps: props.totalAttemps,
          total_time_spent: props.totalTimeSpent,
        })
      if (error) {
        console.log(error)
      } else {
        scores.value = [];
        isScorePushed.value = true;
        getScores();
      }  
    }

    onMounted(() => {
      getScores()
    })
    return {
      scores,
      pushScore,
      playgroundFullName,
      difficulty,
      isScorePushed,
      isTimer
    }
  }
});
</script>

<style>
</style>