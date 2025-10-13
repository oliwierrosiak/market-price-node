import express from 'express'
import cors from 'cors'
import Router from '../routes/routes.js'

export const app = express()

app.use(new cors([
    "http://127.0.0.1/",
    "http://localhost:3000"
]))
app.use(express.json())

app.use(Router)