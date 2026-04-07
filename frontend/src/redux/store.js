import { configureStore } from "@reduxjs/toolkit"
import userSlice from "./userSlice"
import resumeSlice from "./resumeSlice"
import jobSlice from "./jobSlice";
import companySlice from "./companySlice";
import { notesApi } from "./notesSlice";

const store = configureStore({
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(notesApi.middleware),
    reducer: {     
        user: userSlice,      
        resume: resumeSlice,       
        jobs: jobSlice,
        company: companySlice,
        [notesApi.reducerPath]: notesApi.reducer,
     }
})

export default store
