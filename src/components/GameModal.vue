<template>
  <Teleport to="#game-modal">
    <div class="game-modal-inner">
      <div class="game-menu-scores">
        <div class="game-menu-score">
          <span>
            <span class="green">■</span> 
            Success
          </span>
          <span>{{ nbSuccess }}</span>
        </div>
        <div class="game-menu-score">
          <span>
            <span class="red">■</span> 
            Failed
          </span>
          <span>{{ nbFail }}</span>
        </div>
      </div>
      <!-- <div class="game-menu-best-score"
        v-if="bestScore.nbSuccess != 0"
      > 
        Best Score: {{ bestScore.nbSuccess }}/{{totalAttemps}}
        <span v-if="bestScore.totalTimeSpent"> in {{ bestScore.totalTimeSpent/1000 }}s</span>
      </div> -->
    </div>
  </Teleport>
</template>

<script>
import { defineComponent } from 'vue';


export default defineComponent({
  props: {
    nbSuccess: Number,
    nbFail: Number,
    totalAttemps: Number,
    bestScore: Object,
    isTimer: Boolean,
  }
});
</script>

<style scoped>
</style>