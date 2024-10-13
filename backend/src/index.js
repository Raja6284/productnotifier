import dotenv from "dotenv"

dotenv.config({
    path:"./.env"
})

const PORT = process.env.PORT || 8001
console.log(PORT)