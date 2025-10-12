import express from 'express'
import test from '../controllers/test.js'

const Router = new express.Router()

Router.get('/',test)

export default Router