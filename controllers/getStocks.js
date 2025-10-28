import axios from "axios"
import dotenv from 'dotenv'
dotenv.config()

const getStockInfo=(symbol)=>{
    return new Promise((resolve,reject)=>
    {
        resolve(axios.get(`${process.env.ETFApi}/${symbol}?range=7d&interval=1d`).catch(ex=>null))
    })
}

const getImg = (symbol)=>{
    return new Promise((resolve,reject)=>{
        resolve(axios.get(`${process.env.StockIcons}/logo?ticker=${symbol}`,{headers:{"X-Api-Key":'58y2ThdKKKeLujhPkZz+fA==1GiEmcwJcROkipk8'}}).catch(ex=>null))
    })
}

const setExchangeRatio = (base,target) =>
{
    return new Promise((resolve,reject)=>{
        resolve(axios.get(`${process.env.CurrencyApi}/latest?from=${base}&to=${target}`).catch(ex=>null))
    })
}

async function getStocks(req,res)
{
    const currency = req.query.currency.toUpperCase()

    const promises = []
    const stockSymbols = ["AAPL", "MSFT", "GOOG", "AMZN", "META", "NVDA", "TSLA", "NFLX", "ADBE","INTC", "AMD", "CSCO", "CRM", "ORCL", "PYPL", "AVGO", "QCOM", "IBM", "TXN","PEP", "KO", "MCD", "NKE", "PG", "WMT", "DIS", "HD", "V", "MA","BA", "CAT", "UPS", "FDX", "GE", "MMM", "HON", "DE", "GM", "F","XOM", "CVX", "COP", "JPM", "BAC", "C", "GS", "MS", "WFC", "AXP","UNH", "JNJ", "PFE", "ABBV", "MRK", "LLY", "T", "VZ", "KO", "PEP","SHEL", "BP", "ULVR", "AZN", "GSK", "HSBA", "RIO", "BHP", "NESN", "NOVN","SAP", "SIEGY", "BMWYY", "DDAIF", "ADS", "BAYRY", "OR.PA", "AIR.PA", "SAN.PA", "BN.PA","TM", "SONY","NSANY", "NMR", "NTDOY", "6758.T", "7203.T", "9984.T", "TCEHY", "BABA","JD", "PDD", "NIO", "LI", "BYDDY", "TSM", "UMC", "SSNLF", "HMC", "SMFG"];

    for(const key of stockSymbols)
    {
        promises.push(getStockInfo(key))
    }
    const stocks = await Promise.all(promises)
    const stockFiltered = stocks.filter(x=>x!==null)


    const currencies = []

    const responsePromises = []


    for(let i = 0;i<stockFiltered.length;i++)
    {
        let exchangeRatio = currencies.findIndex(y=>y.currency === stockFiltered[i].data.chart.result[0].meta.currency)
        if(exchangeRatio === -1)
        {
            if(stockFiltered[i].data.chart.result[0].meta.currency !== currency)
            {
                const data = await setExchangeRatio(stockFiltered[i].data.chart.result[0].meta.currency,currency)
                if(data)
                {
                    currencies.push({currency:stockFiltered[i].data.chart.result[0].meta.currency,value:data.data.rates[currency]})
                }
            }
            else
            {
                currencies.push({currency:stockFiltered[i].data.chart.result[0].meta.currency,value:1})
            }
        }
        exchangeRatio = currencies.findIndex(y=>y.currency === stockFiltered[i].data.chart.result[0].meta.currency)
        if(exchangeRatio === -1)
        {
            continue;
        }

        const promise = (async()=>{
            const img = await getImg(stockFiltered[0].data.chart.result[0].meta.symbol)
            return{
            id:stockFiltered[i].data.chart.result[0].meta.symbol.toLowerCase(),
            name:stockFiltered[i].data.chart.result[0].meta.shortName,
            currentPrice:stockFiltered[i].data.chart.result[0].meta.regularMarketPrice * currencies[exchangeRatio].value,
            sparkline:stockFiltered[i].data.chart.result[0].indicators.quote[0].close,
            priceChange:(stockFiltered[i].data.chart.result[0].meta.regularMarketPrice * currencies[exchangeRatio].value) - (stockFiltered[i].data.chart.result[0].indicators.quote[0].close.at(-2) * currencies[exchangeRatio].value),
            percentPriceChange:((stockFiltered[i].data.chart.result[0].meta.regularMarketPrice * currencies[exchangeRatio].value) - (stockFiltered[i].data.chart.result[0].indicators.quote[0].close.at(-2) * currencies[exchangeRatio].value))/(stockFiltered[i].data.chart.result[0].indicators.quote[0].close.at(-2) * currencies[exchangeRatio].value) * 100,
            image:img
        }
        })

        responsePromises.push(promise())
    }

    const obj = await Promise.all(responsePromises)

    if(obj.length)
    {
        obj.forEach(x => {
            x.image = x.image?x.image.data[0]:''
        });
        res.status(200).json(obj)
    }
    else
    {
        res.sendStatus(500)
    }

   
}   

export default getStocks