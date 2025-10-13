import { app } from "./expressConfig.js";
import dotenv from 'dotenv'
dotenv.config()

app.listen(process.env.PORT,'0.0.0.0',()=>{
    console.log(`serwer słucha na porce ${process.env.PORT}...`)
})