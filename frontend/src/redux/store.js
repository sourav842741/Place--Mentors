import { configureStore } from "@reduxjs/toolkit"
import userSlice from "./userSlice"
import resumeSlice from "./resumeSlice"
import jobSlice from "./jobSlice";
import companySlice from "./companySlice";
import potdSlice from "./potdSlice";
import { notesApi } from "./notesSlice";
import { compilerApi } from "./compilerSlice";
import codingPotdSlice from "./codingPotdSlice";

const store = configureStore({
  middleware: (getDefaultMiddleware) =>
getDefaultMiddleware().concat(notesApi.middleware, compilerApi.middleware),
    reducer: {     
        user: userSlice,      
        resume: resumeSlice,       
        jobs: jobSlice,
        company: companySlice,
        potd: potdSlice,
        codingPotd: codingPotdSlice,
        [notesApi.reducerPath]: notesApi.reducer,
        [compilerApi.reducerPath]: compilerApi.reducer,
     }
})

export default store
