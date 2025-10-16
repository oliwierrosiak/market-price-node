import express from 'express'
import test from '../controllers/test.js'
import getCrypto from '../controllers/getCrypto.js'
import getETF from '../controllers/getEtf.js'

const Router = new express.Router()

Router.get('/',test)

Router.get('/getCrypto',getCrypto)

Router.get('/getEtf',getETF)

export default Router