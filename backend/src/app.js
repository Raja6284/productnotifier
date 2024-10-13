import express from "express"
import cors from "cors"

const app = express()   //once the app has been designed you can use middlewares

app.use(
    cors({
        origin:process.env.CORS_ORIGIN,
        credentials:true
    })
)

//some common middlewares
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))



export {app}

