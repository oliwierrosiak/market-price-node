import express from 'express'
import cors from 'cors'
import Router from '../routes/routes.js'

export const app = express()

app.use(new cors([
    "127.0.0.1"
]))

app.use(Router)