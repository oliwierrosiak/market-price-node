import express from 'express'
import test from '../controllers/test.js'
import getCrypto from '../controllers/getCrypto.js'

const Router = new express.Router()

Router.get('/',test)

Router.get('/getCrypto',getCrypto)

export default Router