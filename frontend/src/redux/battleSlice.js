import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  roomId: null,
  problem: null,
  timeLimit: 900,
  timeLeft: 0,
  status: 'waiting',
  myCode: '',
  opponentCode: '',
  opponent: null,
  winnerId: null,
  myLanguage: 'javascript',
  opponentLanguage: 'javascript',
  results: null,
  submitterId: null,
  isWinner: null,
  isOpponentTyping: false,
};

const battleSlice = createSlice({
  name: 'battle',
  initialState,
  reducers: {
    battleStart: (state, action) => {
      const { roomId, problem, timeLimit, opponent } = action.payload;
      state.roomId = roomId;
      state.problem = problem;
      state.timeLimit = timeLimit;
      state.timeLeft = timeLimit || 900;
      state.status = 'running';
      state.opponent = opponent || null;
      state.myLanguage = 'javascript'; // reset
    },
    decrementTimeLeft: (state) => {
      state.timeLeft = Math.max(0, state.timeLeft - 1);
    },
    updateTimeLeft: (state, action) => {
      state.timeLeft = typeof action.payload === 'number' ? action.payload : 0;
    },
    updateMyCode: (state, action) => {
      state.myCode = action.payload;
    },
    updateMyLanguage: (state, action) => {
      state.myLanguage = action.payload;
    },
    updateOpponentCode: (state, action) => {
      state.opponentCode = action.payload.code;
      state.opponentLanguage = action.payload.language || state.opponentLanguage;
    },
    setOpponent: (state, action) => {
      state.opponent = action.payload;
    },
    battleWinner: (state, action) => {
      state.status = 'finished';
      state.winnerId = action.payload.winnerId;
    },
    battleDraw: (state) => {
      state.status = 'draw';
    },
    battleFailed: (state) => {
      state.status = 'failed';
    },
    battleResult: (state, action) => {
      const { results, submitterId, isWinner } = action.payload;
      state.results = results;
      state.submitterId = submitterId;
      state.isWinner = isWinner;
      state.status = 'submitted';
    },
    setTyping: (state, action) => {
      state.isOpponentTyping = action.payload;
    },
    resetBattle: (state) => initialState,
  },
});

export const {
  battleStart,
  decrementTimeLeft,
  updateTimeLeft,
  updateMyCode,
  updateMyLanguage,
  updateOpponentCode,
  setOpponent,
  battleWinner,
  battleDraw,
  battleFailed,
  battleResult,
  setTyping,
  resetBattle,
} = battleSlice.actions;

export default battleSlice.reducer;
