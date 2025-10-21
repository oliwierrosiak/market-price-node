import axios from "axios"
import dotenv from 'dotenv'
dotenv.config()

const getStockInfo=(symbol)=>{
    return new Promise((resolve,reject)=>
    {
            resolve(axios.get(`${process.env.ETFApi}/${symbol}?range=7d&interval=1d`).catch(ex=>null))
    })
}

const convertCurrencies = (base,target,amount)=>{
    return new Promise((resolve,reject)=>{
        resolve(axios.get(`${process.env.CurrencyApi}/latest?from=${base}&to=${target}&amount=${amount}`).catch(ex=>null))
    })
}

const getImg = (symbol)=>{
    return new Promise((resolve,reject)=>{
        resolve(axios.get(`https://api.api-ninjas.com/v1/logo?ticker=${symbol}`,{headers:{"X-Api-Key":'58y2ThdKKKeLujhPkZz+fA==1GiEmcwJcROkipk8'}}).catch(ex=>null))
    })
}

async function getStocks(req,res)
{
    const currency = req.query.currency.toUpperCase()

    const responseObject = []

    const promises = []
    const stockSymbols = ["AAPL", "MSFT", "GOOG", "AMZN", "META", "NVDA", "TSLA", "NFLX", "ADBE","INTC", "AMD", "CSCO", "CRM", "ORCL", "PYPL", "AVGO", "QCOM", "IBM", "TXN","PEP", "KO", "MCD", "NKE", "PG", "WMT", "DIS", "HD", "V", "MA","BA", "CAT", "UPS", "FDX", "GE", "MMM", "HON", "DE", "GM", "F","XOM", "CVX", "COP", "JPM", "BAC", "C", "GS", "MS", "WFC", "AXP","UNH", "JNJ", "PFE", "ABBV", "MRK", "LLY", "T", "VZ", "KO", "PEP","SHEL", "BP", "ULVR", "AZN", "GSK", "HSBA", "RIO", "BHP", "NESN", "NOVN","SAP", "SIEGY", "BMWYY", "DDAIF", "ADS", "BAYRY", "OR.PA", "AIR.PA", "SAN.PA", "BN.PA","TM", "SONY","NSANY", "NMR", "NTDOY", "6758.T", "7203.T", "9984.T", "TCEHY", "BABA","JD", "PDD", "NIO", "LI", "BYDDY", "TSM", "UMC", "SSNLF", "HMC", "SMFG"];
    // const stockSymbols = ["AAPL"];

    for(const key of stockSymbols)
    {
        promises.push(getStockInfo(key))
    }
    const stocks = await Promise.all(promises)
    const stockFiltered = stocks.filter(x=>x!==null)

    const mappedStock = stockFiltered.map(async(x)=>{
        const price = await convertCurrencies(x.data.chart.result[0].meta.currency,currency,x.data.chart.result[0].meta.regularMarketPrice)
        const lastPrice = await convertCurrencies(x.data.chart.result[0].meta.currency,currency,x.data.chart.result[0].indicators.quote[0].close.at(-2))
        const lastPriceFormatted = lastPrice?lastPrice.data.rates[currency]:Number(x.data.chart.result[0].indicators.quote[0].close.at(-2).toFixed(3))
        const priceChange = await convertCurrencies(x.data.chart.result[0].meta.currency,currency,x.data.chart.result[0].meta.regularMarketPrice-x.data.chart.result[0].indicators.quote[0].close.at(-2))
        const img = await getImg(x.data.chart.result[0].meta.symbol)
        return{
            id:x.data.chart.result[0].meta.symbol.toLowerCase(),
            name:x.data.chart.result[0].meta.shortName,
            currentPrice:price?price.data.rates[currency]:x.data.chart.result[0].meta.regularMarketPrice,
            sparkline:x.data.chart.result[0].indicators.quote[0].close,
            priceChange:priceChange?priceChange.data.rates[currency]:x.data.chart.result[0].meta.regularMarketPrice-Number(x.data.chart.result[0].indicators.quote[0].close.at(-2).toFixed(3)),
            percentPriceChange:((price?price.data.rates[currency]:x.data.chart.result[0].meta.regularMarketPrice)-lastPriceFormatted)/lastPriceFormatted*100,
            image:img.data[0]?img.data[0].image:''
        }
    })
    const currenciesConverted = await Promise.all(mappedStock)
    if(currenciesConverted.length)
    {
        res.status(200).json(currenciesConverted)

    }
    else
    {
        res.sendStatus(500)
    }
}   

export default getStocks