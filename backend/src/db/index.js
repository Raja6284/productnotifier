import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"

const connectDB = async()=>{
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        // console.log(`\n MongoDB connected ! DB host : ${connectionInstance.connection.host}`)
        if(!connectionInstance){
            console.log("Error occured while connection to MongoDB")
        }else{
        console.log("MongoDB connected !")
        console.log(`Connected to database: ${connectionInstance.connection.name}`);
        console.log(`Database host: ${connectionInstance.connection.host}`);
        console.log(`Database port: ${connectionInstance.connection.port}`);
        console.log(`Current connection state: ${connectionInstance.connection.readyState}`);
        }
        
    }
    catch(error){
        console.log("MongoDB connection error",error)
        process.exit(1)
    }
}

export default connectDB