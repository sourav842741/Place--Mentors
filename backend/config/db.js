import mongoose from "mongoose"

const connectDb=async ()=>{
try {
    await mongoose.connect(process.env.MONGOURL)
    console.log("db connected")
} catch (error) {
    console.log(error)
}
}

export default connectDb