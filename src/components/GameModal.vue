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
      <div class="game-menu-best-score" v-if="bestScore != null"> 
        Best Score: {{ bestScore }}/{{totalAttemps}}
      </div>
    </div>
  </Teleport>
</template>

<script>
import { defineComponent } from 'vue';


export default defineComponent({
  props: {
    nbSuccess: Number,
    nbFail: Number,
    bestScore: Number,
    totalAttemps: Number,
  }
});
</script>

<style scoped>
</style>