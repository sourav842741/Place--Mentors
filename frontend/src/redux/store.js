import { configureStore } from "@reduxjs/toolkit"
import userSlice from "./userSlice"
import resumeSlice from "./resumeSlice"
import jobSlice from "./jobSlice";
import companySlice from "./companySlice";

const store = configureStore({
    reducer: {     
        user: userSlice,      
        resume: resumeSlice,       
        jobs: jobSlice,
        company: companySlice,
     }
})

export default store
