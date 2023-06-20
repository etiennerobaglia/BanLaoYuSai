<template>
  <div class="game-menu-info">
    <div class="game-menu-feedback">
      <div class="game-menu-finished">
        <span>Congratulation, your score is {{ nbSuccess }}/{{ totalAttemps }}<span v-if="isTimer"> in {{ totalTimeSpent/1000}} seconds</span>!</span>
        
        <button 
          @click="$emit('replay')"
          class="button button-yellow"
        >
          Replay this mode!
        </button>
        <button
          @click="restart()"
          class="button button-yellow"
        >
          Choose new game mode!
        </button>
      </div>

    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'GameFinished',
  props: {
    nbSuccess: Number,
    totalAttemps: Number,
    totalTimeSpent: Number,
    isTimer: Boolean,
  },
  setup(props) {
    function restart() {
      location.reload();
    }
    return {
      restart
    };
  }
});
</script>

<style scoped>
</style>