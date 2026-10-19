import { configureStore, createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, hydrated: false },
  reducers: {
    setUser: (state, action) => { state.user = action.payload; state.hydrated = true; },
    clearUser: state => { state.user = null; state.hydrated = true; }
  }
});

const analysisSlice = createSlice({
  name: "analysis",
  initialState: { analysisResult: null, dashboardData: null, query: "", generatedAt: null, error: null, loading: false },
  reducers: {
    setAnalysisLoading: (state, action) => { state.loading = action.payload; state.error = null; },
    setAnalysisResult: (state, action) => {
      state.analysisResult = action.payload.analysis;
      state.dashboardData = action.payload.analysis;
      state.query = action.payload.query || "";
      state.generatedAt = new Date().toISOString();
      state.error = null;
      state.loading = false;
    },
    setAnalysisError: (state, action) => { state.error = action.payload; state.loading = false; },
    clearAnalysis: state => { state.analysisResult = null; state.dashboardData = null; state.query = ""; state.generatedAt = null; state.error = null; state.loading = false; }
  }
});

export const { setUser, clearUser } = authSlice.actions;
export const { setAnalysisLoading, setAnalysisResult, setAnalysisError, clearAnalysis } = analysisSlice.actions;

export const store = configureStore({
  reducer: { auth: authSlice.reducer, analysis: analysisSlice.reducer }
});
