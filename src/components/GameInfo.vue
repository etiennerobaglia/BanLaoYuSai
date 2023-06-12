<template>
  <Teleport 
    to="#game-modal" 
    v-if="playState != 
    'notPlaying'"
  >
    <GameModal 
      :nbSuccess="nbSuccess"
      :nbFail="nbFail"
      :bestScore="bestScore"
      :totalAttemps="totalAttemps"
    />
  </Teleport>
    
  <GameFinished
    v-if="playState == 'finished'"
    @replay="replay()"
    :nbSuccess="nbSuccess"
    :totalAttemps="totalAttemps"    
  />

  <div 
    v-else-if="playState == 'playing' || playState == 'next'"
    class="game-menu-info"
  >
    <div class="game-menu-instructions">
      
      <div 
        v-if="difficulty == 'hard'"
        class="game-menu-difficulty game-difficulty-hard" 
      >

        <div class="game-menu-instruction-text">
          Find 
          <span class="guessing-feature">this area</span>
          on the map:
        </div>

        <button
          :disabled="playState != 'playing'"
          title="Find me on the map!"
          class="button button-selection button-not-hoverable"
          :class="{
            'button-yellow-blue': 
              !guessedFeature.id ||
              (guessingFeature.id != guessedFeature.id)
            ,
            'button-green':
              guessingFeature.id == guessedFeature.id
            ,
            'button-red':
              guessingFeature.id == guessedFeature.id
            ,
            'button-border-green':
              guessedFeature.id
              && guessingFeature.id != guessedFeature.id
          }"
          v-html="featureFullName(guessingFeature)"
        >
        </button>
        
        <button
          v-if="
            playState == 'next'
            && guessingFeature.id != guessedFeature.id
          "
          disabled=true
          class="button button-selection button-not-hoverable button-red"
          v-html="featureFullName(guessedFeature)"
        >
        </button>

      </div>

      <div 
        v-if="difficulty == 'easy'"
        class="game-menu-difficulty game-difficulty-easy"
      >
        <div class="game-menu-instruction-text">
          Find the name of the
          <span class="guessing-feature">yellow shape</span>:
        </div>
        
        <div class="game-menu-buttons">
          <button
            v-for="option in guessingOptions"
            :disabled="
              playState != 'playing'
            "
            class="button button-selection"
            :class="{
              'button-yellow-blue': 
                !guessedFeature.id 
                || option.id != guessedFeature.id
              ,
              'button-green':
                option.id == guessingFeature.id
                && option.id == guessedFeature.id
              ,
              'button-red':
                option.id != guessingFeature.id
                && option.id == guessedFeature.id
              ,
              'button-border-green':
                guessedFeature.id
                && option.id == guessingFeature.id
                && option.id != guessedFeature.id
              ,
            }"
            @click="guess(option)"
            v-html="featureFullName(option)"
          >
          </button>
        </div>
      </div>
    </div>

    <div class="game-menu-feedback">
      <button
        v-if="nbSuccess + nbFail != totalAttemps"
        @click="next()"
        :disabled="playState != 'next'"
        class="button button-yellow button-next"
      >
      [{{ nbSuccess+nbFail }}/{{totalAttemps}}] Next Round!
      </button>
      <button
        v-else
        @click="score()"
        class="button button-yellow button-next"
      >
        [{{ nbSuccess+nbFail }}/{{totalAttemps}}] See score!
      </button>
    </div>

  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import GameModal from './GameModal.vue';
import GameFinished from './GameFinished.vue';


export default defineComponent({
  name: 'GameInfo',
  components: { 
    GameModal,
    GameFinished
  },
  props: {
    mapPromise: Object,
    playgroundLayer: Object,
    playgroundInfo: Object,
    difficulty: String,
  },
  setup(props) {
    let guessingOptions = ref([]);
    let guessingFeature = ref({});
    let guessedFeature = ref({});
    let hoveredFeatureId = null;
    let nbFail = ref(0);
    let nbSuccess = ref(0);
    let playState = ref("playing");
    let success = ref(null);
    let bestScore = ref(null);
    let totalAttemps = ref(10);
    let gameDoneFeaturesIDs = ref([]);
    onMounted(() => { play(); });
    function play() {
      setRandomFeatures();
      playState.value = "playing";
    }
    function score() {
      // end of game
      playState.value = "finished";
      // set bestscore
      if (playState.value == "finished" && (nbSuccess.value > bestScore.value || bestScore.value == null))
          bestScore.value = nbSuccess.value;
      next();
    }
    function next() {
      props.mapPromise.then((map) => {
        map.setFeatureState({ source: props.playgroundLayer.name, id: guessedFeature.value.id }, { fail: false, guessing: false, success: false, hover: false });
        map.setFeatureState({ source: props.playgroundLayer.name, id: guessingFeature.value.id }, { fail: false, guessing: false, success: false, hover: false });
        if (guessingFeature.value.id == guessedFeature.value.id) {
          map.setFeatureState({ source: props.playgroundLayer.name, id: guessingFeature.value.id }, { done: true });
        }
        map.fitBounds(props.playgroundInfo.bounds, { padding: 0 });
        // game must go on
        if (playState.value != "finished")
          play();
      });
    }
    function replay() {
      nbSuccess.value = 0;
      nbFail.value = 0;
      props.mapPromise.then((map) => {
        map.removeFeatureState({ source: props.playgroundLayer.name });
        play();
      });
    }
    function guess(guessAttempt) {
      if (
      // playing
      playState.value == "playing"
        // not a done feature (hard)
        && (!gameDoneFeaturesIDs.value.includes(guessAttempt.id) || props.difficulty == "easy")) {
        guessedFeature.value = guessAttempt;
        playState.value = "next";
        props.mapPromise.then((map) => {
          // success
          if (guessedFeature.value.id == guessingFeature.value.id) {
            nbSuccess.value++;
            success.value = true;
            map.setFeatureState({ source: props.playgroundLayer.name, id: guessingFeature.value.id }, { guessing: false, success: true });
            gameDoneFeaturesIDs.value.push(guessedFeature.value.id);
          }
          // fail
          else {
            nbFail.value++;
            success.value = false;
            map.setFeatureState({ source: props.playgroundLayer.name, id: guessedFeature.value.id }, { fail: true });
            map.setFeatureState({ source: props.playgroundLayer.name, id: guessingFeature.value.id }, { guessing: true });
          }
        });
      }
    }
    function featureFullName(feature) {
      let featureFullName;
      if (feature.properties?.vname)
        featureFullName =
          feature.properties?.vname + " <br /> " + feature.properties?.l_vname;
      else if (feature.properties?.dname)
        featureFullName =
          feature.properties?.dname + " <br /> " + feature.properties?.l_dname;
      else if (feature.properties?.pname)
        featureFullName =
          feature.properties?.pname + " <br /> " + feature.properties?.l_pname;
      return featureFullName;
    }
    function setRandomFeatures() {
      let newFeature;
      let newFeatures;
      props.mapPromise.then((map) => {
        // newFeature set
        newFeatures = props.playgroundLayer.features.sort(() => 0.5 - Math.random()).slice(0, 4);
        newFeature = newFeatures[Math.floor(Math.random() * newFeatures.length)];
        if (
          // if  previous guessing feature
          newFeature.id == guessingFeature.value.id
          // previous attempt
          || newFeature.id == guessedFeature.value.id
          // if  already done feature
          || gameDoneFeaturesIDs.value.includes(newFeature.id)
        )
          setRandomFeatures();
        else {
            guessingFeature.value = newFeature;
            guessedFeature.value = {};
            guessingOptions.value = newFeatures;
            if (props.difficulty == "easy") {
                map.setFeatureState({ source: props.playgroundLayer.name, id: guessingFeature.value.id }, { guessing: true });
            }
        }
      });
    }
    // hard mode map listeners
    if (props.difficulty == "hard") {
      props.mapPromise.then((map) => {
        // hover feature color
        map.on("mousemove", props.playgroundLayer.name + "Fill", (e) => {
        if (e.features.length > 0 && hoveredFeatureId !== null && playState.value == "playing") {
          map.setFeatureState({ source: props.playgroundLayer.name, id: hoveredFeatureId }, { hover: false });
        }
        if (e.features.length > 0 && playState.value == "playing") {
          map.getCanvas().style.cursor = "pointer";
          hoveredFeatureId = e.features[0].id;
          map.setFeatureState({ source: props.playgroundLayer.name, id: hoveredFeatureId }, { hover: true });
        }
        if (
          (e.features.length > 0 && playState.value != "playing")
          || map.getFeatureState({ source: props.playgroundLayer.name, id: e.features[0].id }).done
        )
          map.getCanvas().style.cursor = "not-allowed";
        });
        map.on("mouseleave", props.playgroundLayer.name + "Fill", () => {
          map.getCanvas().style.cursor = "";
          if (hoveredFeatureId !== null && playState.value == "playing") {
            map.setFeatureState({ source: props.playgroundLayer.name, id: hoveredFeatureId }, { hover: false });
          }
          hoveredFeatureId = null;
        });
        // user guess attempt hard
        map.on("click", props.playgroundLayer.name + "Fill", (clickedFeature) => guess(clickedFeature.features[0]));
      });
    }
    return {
      success,
      guessingFeature,
      guessedFeature,
      guessingOptions,
      featureFullName,
      play,
      next,
      replay,
      guess,
      score,
      playState,
      totalAttemps,
      nbFail,
      nbSuccess,
      bestScore,
    };
  }
});
</script>

<style scoped></style>