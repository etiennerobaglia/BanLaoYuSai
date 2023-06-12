<template>
  <div
    class="overlay"
    :class="{
      'hide': mapLoaded
    }"
  >
    <div class="header">
      <div class="title-container">
        <div class="loader"></div>
        <div class="title-text">
          ບ້ານ ລາວ ຢູ່ໃສ<br>Ban Lao Yu Sai
          <a class="credit" href="https://etienne.robaglia.fr">
            etienne.robaglia.fr
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';


export default defineComponent({
  props: {
    mapLoaded: Boolean,
  }
});
</script>

<style scoped>
</style>