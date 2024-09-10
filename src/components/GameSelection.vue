<template>
  <div 
    class="game-menu-selection-portal"
    v-if="!playing"
  >
    <div class="game-menu-select">
      <label class="game-menu-selection-playground">Playground</label>
      <select 
        v-model="playgroundName"
        name="game-menu-playground"
      >
        <option disabled value="">- Select Playground -</option>
          <optgroup label="Lao">
            <option 
            v-for="layer in layersInfo.filter(layer => layer.fileName.includes('lao'))"
              :value="layer.fileName"
            >
              {{ layer.fullName }}
            </option>
          </optgroup>
          <optgroup label="Vientiane">
            <option 
              v-for="layer in layersInfo.filter(layer => layer.fileName.includes('vte'))" 
              :value="layer.fileName"
            >
              {{ layer.fullName }}
            </option>
          </optgroup>
          <optgroup label="Europe">
            <option 
            v-for="layer in layersInfo.filter(layer => layer.fileName.includes('europe'))"
              :value="layer.fileName"
            >
              {{ layer.fullName }}
            </option>
          </optgroup>
      </select>
    </div>
    
    <div class="game-menu-select game-menu-select-input">
      <label class="game-menu-selection">Ranked</label>
      <input 
        class="game-menu-checkbox"
        type="checkbox"
        name="game-menu-timer"
        v-model="isTimer" />
    </div>

    <div class="game-menu-select game-menu-select-input game-menu-difficulty">
      <label class="game-menu-selection">Hard Mode</label>
      <input 
        class="game-menu-checkbox"
        type="checkbox"
        name="game-menu-timer"
        value="hard"
        @click="difficulty=='easy'?difficulty='hard':difficulty='easy'"
        />
    </div>

    <button
      class="button button-yellow"
      :disabled="!playgroundName || !difficulty || isTimer=='default'"
      @click="initGame()"
    >
      Play!
    </button>
  </div>
  <GameInfo
    v-if="playing && difficulty && playgroundName && isTimer!='default'"
    :difficulty="difficulty"
    :isTimer="isTimer"
    :mapPromise="mapPromise"
    :playgroundLayer="playgroundLayer"
    :playgroundInfo="playgroundInfo"
    @restart="restart()"
  />
</template>

<script>
import { defineComponent, ref } from 'vue';
import GameInfo from './GameInfo.vue';

export default defineComponent({
  props: {mapPromise: Object},
  emits: ['restart'],
  components: {GameInfo},
  setup(props) {
    const laoBounds = [[99.909668, 13.7954062], [107.9296875, 22.6951202]];
    const vientianeBounds = [[102.52367049329712,17.88439633410357], [102.721931487635, 18.03925442276218]];
    const playgroundName = ref("");
    const playgroundInfo = ref({})
    const difficulty = ref("easy");
    const isTimer = ref(false);
    const playgroundLayer = ref({})
    const playing = ref(false)
    const layersInfo = ref([
      {
        "fileName": "europe-countries",
        "fullName":"European Countries",
        "bounds": [[-28.83, 70.07], [51.68, 32.33]],
      }, 
      {
        "fileName": "europe-france-metro-pnr-pnx",
        "fullName":"France - Parcs Naturels Metropolitains",
        "bounds": [[-7.08,51.59], [ 10.77, 41.05]],
      }, 
      {
        "fileName": "europe-france-dpt",
        "fullName":"France - Départements Metropolitains",
        "bounds": [[-7.08,51.59], [ 10.77, 41.05]],
      }, 
      {
        "fileName": "vte-villages-t2",
        "fullName":"Vientiane - City Center (39 villages)",
        "bounds": [[102.57813377330893, 17.927212142550417], [102.64211925985438, 17.98422754876998]],
      }, 
      {
        "fileName": "vte-villages-t4",
        "fullName":"Vientiane - T4 (112 villages)",
        "bounds": vientianeBounds
      },
      {
        "fileName": "vte-villages-450",
        "fullName":"Vientiane - Road 450 (250 villages)",
        "bounds": [ [102.40350167471024, 17.784056559755257], [102.87552283140121, 18.12166650874893]]
      },
      {
        "fileName": "vte-poi",
        "fullName":"Vientiane - Point of Interest",
        "bounds": vientianeBounds
      },
      {
        "fileName": "vte-pro_and_cap-districts",
        "fullName":"Extended Vientiane - Districts",
        "bounds": [[101.17486890018642, 17.74580310199005], [103.35160930021289, 19.45418532763813]]
      },
      {
        "fileName": "lao-provinces",
        "fullName":"Lao - Provinces",
        "bounds": laoBounds
      },
      {
        "fileName": "lao-districts",
        "fullName":"Lao - Districts",
        "bounds": laoBounds
      },
      {
        "fileName": "lao-conservation-areas",
        "fullName":"Lao - Conservation Areas",
        "bounds": laoBounds
      }
    ])

    function initGame() {
      import(`../assets/layers/${playgroundName.value}.json`).then((importLayer) => {
        playgroundLayer.value = importLayer;
        
        playgroundInfo.value = layersInfo.value.find(
          layer => layer.fileName == playgroundName.value
        ),
        
        props.mapPromise.then((map) => {
          map.addSource(playgroundLayer.value.name, {
            type: "geojson",
            data: playgroundLayer.value,
          });
          if (playgroundLayer.value.features[0].geometry.type == "Polygon") {
            map.addLayer({
              id: playgroundLayer.value.name,
              type: "fill",
              source: playgroundLayer.value.name,
              layout: {},
              paint: {
                'fill-color': [
                  'case',
                    ['boolean', ['feature-state', 'fail'], false],
                    import.meta.env.VITE_red,
                    ['boolean', ['feature-state', 'success'], false],
                    import.meta.env.VITE_green,
                    ['boolean', ['feature-state', 'done'], false],
                    import.meta.env.VITE_blue,
                    ['boolean', ['feature-state', 'guessing'], false],
                    import.meta.env.VITE_yellow,
                    ['boolean', ['feature-state', 'hover'], false],
                    import.meta.env.VITE_yellow,
                    'black'
                ],
                'fill-opacity': [
                  'case',
                  ['boolean', ['feature-state', 'guessing'], false],
                  1,
                  ['boolean', ['feature-state', 'hover'], false],
                  1,
                  ['boolean', ['feature-state', 'fail'], false],
                  1,
                  ['boolean', ['feature-state', 'success'], false],
                  1,
                  ['boolean', ['feature-state', 'done'], false],
                  1,
                  0
                ]
              },
            });
            map.addLayer({
              id: playgroundLayer.value.name+"Line",
              type: "line",
              source: playgroundLayer.value.name,
              layout: {},
              paint: {
                'line-color': import.meta.env.VITE_blue,
                'line-width': 1.5
              },
            });
          }
          if (playgroundLayer.value.features[0].geometry.type == "Point") {
            map.addLayer({
              id: playgroundLayer.value.name,
              type: "circle",
              source: playgroundLayer.value.name,
              layout: {},
              paint: {
                'circle-color': [
                  'case',
                    ['boolean', ['feature-state', 'fail'], false],
                    import.meta.env.VITE_red,
                    ['boolean', ['feature-state', 'success'], false],
                    import.meta.env.VITE_green,
                    ['boolean', ['feature-state', 'done'], false],
                    import.meta.env.VITE_blue,
                    ['boolean', ['feature-state', 'guessing'], false],
                    import.meta.env.VITE_yellow,
                    ['boolean', ['feature-state', 'hover'], false],
                    import.meta.env.VITE_yellow,
                    'rgba(255,255,255,0)'
                  ],
                'circle-radius': 7,
                'circle-stroke-color': [
                  'case',
                    ['boolean', ['feature-state', 'fail'], false],
                    import.meta.env.VITE_red,
                    ['boolean', ['feature-state', 'success'], false],
                    import.meta.env.VITE_green,
                    ['boolean', ['feature-state', 'done'], false],
                    import.meta.env.VITE_blue,
                    ['boolean', ['feature-state', 'guessing'], false],
                    import.meta.env.VITE_blue,
                    ['boolean', ['feature-state', 'hover'], false],
                    'brown',
                    import.meta.env.VITE_blue
                ],
                'circle-stroke-width': 2, 
              },
            });
          }

          map.fitBounds(
            playgroundInfo.value.bounds,
            {padding: 0}
          )
        })
        playing.value = true;
        this.$store.commit('isPlaying', "started")
        this.$store.commit('isTimer', isTimer)
        this.$store.commit('difficulty', difficulty)
        this.$store.commit('playgroundFullName', playgroundInfo.value.fullName)
        this.$store.commit('playgroundFileName', playgroundInfo.value.fileName)
      });
    }
    function restart() {
      playing.value = false;
      props.mapPromise.then((map) => {
        if (map.getLayer(playgroundLayer.value.name)) map.removeLayer(playgroundLayer.value.name)
        if (map.getLayer(playgroundLayer.value.name+"Line")) map.removeLayer(playgroundLayer.value.name+"Line")
        if (map.getSource(playgroundLayer.value.name)) map.removeSource(playgroundLayer.value.name)
      })
    }
    return {
      layersInfo,
      initGame,
      restart,
      playgroundName,
      playgroundInfo,
      playgroundLayer,
      difficulty,
      isTimer,
      playing,
    };
  },
});
</script>

<style>
</style>