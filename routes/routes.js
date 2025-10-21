import express from 'express'
import test from '../controllers/test.js'
import getCrypto from '../controllers/getCrypto.js'
import getETF from '../controllers/getEtf.js'
import getCurrencies from '../controllers/getCurrencies.js'
import getStocks from '../controllers/getStocks.js'

const Router = new express.Router()

Router.get('/',test)

Router.get('/getCrypto',getCrypto)

Router.get('/getEtf',getETF)

Router.get('/getCurrencies',getCurrencies)

Router.get('/getStocks',getStocks)

export default Router