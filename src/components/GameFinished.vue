<template>
  <div class="game-menu-info">
    <div class="game-menu-feedback">
      <div class="game-menu-finished">
        Congratulation, your score is {{ nbSuccess }}/{{ totalAttemps }}!
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