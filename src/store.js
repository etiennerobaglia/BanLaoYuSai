import { createStore } from 'vuex';

const store = createStore({
  state() {
    return {
      isPlaying: "notStarted",
      isTimer: null,
      difficulty: null,
      playgroundFileName: null,
      playgroundFullName: null
    };
  },
  mutations: {
    isPlaying(state, value) {
      state.isPlaying = value;
    },
    isTimer(state, value) {
      state.isTimer = value;
    },
    difficulty(state, value) {
      state.difficulty = value;
    },
    playgroundFileName(state, value) {
      state.playgroundFileName = value;
    },
    playgroundFullName(state, value) {
      state.playgroundFullName = value;
    }
  }
});

export default store;