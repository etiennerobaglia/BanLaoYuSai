<template>
  <Overlay
    :mapLoaded="mapLoaded"
  />


  <main class="game">
    
    <div class="map-container">
      <div id="map"></div>
    </div>

    <div class="header">
      <div class="title-container">
        <div class="title-logo"></div>
        <div class="title-text">
          ບ້ານ ລາວ ຢູ່ໃສ<br>Ban Lao Yu Sai
        </div>
      </div>
    </div>
    
    <div id="game-modal"></div>

    <div class="game-menu-container">
      <div class="game-menu">
        <GameSelection :mapPromise="mapPromise" />
      </div>
    </div>

  </main>
  <a class="credit" href="https://etienne.robaglia.fr">
    etienne.robaglia.fr
  </a>
</template>

<script>
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { onMounted, ref } from "vue";
import Overlay from './components/Overlay.vue';
import GameSelection from './components/GameSelection.vue';

export default {
  name: 'App',
  components: {
    Overlay,
    GameSelection
  },
  setup() {
    const mapPromise = ref();
    const mapLoaded = ref(false);
    
    onMounted(() => {
      mapboxgl.accessToken = import.meta.env.VITE_VUE_APP_MAPBOX_TOKEN;
      
      const map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/etroba/clh1k3m1400l901qufshrdakc",
        bounds:[
          [97.92952232149673, 12.372529503144591], 
          [109.21012831452117, 23.604023167268167]
        ]
      });

      mapPromise.value = new Promise((resolve) => {
        map.on('load', () => {
          resolve(map)
          mapLoaded.value = true;
        }
          );
      });

    });
    return {
      mapPromise,
      mapLoaded
    };
  },
};
</script>

<style>
</style>