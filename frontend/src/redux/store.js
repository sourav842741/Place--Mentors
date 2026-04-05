import { configureStore } from "@reduxjs/toolkit"
import userSlice from "./userSlice"
import resumeSlice from "./resumeSlice"
import jobSlice from "./jobSlice";

const store = configureStore({
    reducer: {     
        user: userSlice,      
        resume: resumeSlice,       
        jobs: jobSlice ,
     }
})

export default store
