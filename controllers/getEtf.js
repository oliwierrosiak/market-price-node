import axios from "axios"
import dotenv from 'dotenv'
dotenv.config()

const exchangeRat = async(target) =>
{
    try
    {
        const resp = await axios.get(`${process.env.CurrencyApi}/latest?from=USD&to=${target}`)
        return resp.data.rates[target]
    }
    catch(ex)
    {
        console.log(ex)
        return null
    }
}

async function getETF(req,res)
{
    
    const symbols = ['SPY','IVV','VOO','VTI','QQQ','EFA','EEM','VEA','VWO','XLK','XLF','XLE','XLV','XLY','GLD','IAU','SLV','USO','TLT','IEF','ARKK','SOXX','SMH','BOTZ','SPXS.L','VUAA.L','EQQQ.L','ISF.L','ITOT','IWM','VB','VTV','VUG','SCHD','BND','DIA','IXUS','VXUS','VEU','XLP','XLI','QQQM']
    const promises = symbols.map(x=>
    {
        return axios.get(`${process.env.ETFApi}/${x}?range=7d&interval=1d`)
        .then(response=>{
            const last7d=response.data.chart.result[0].indicators.quote[0].close
            const clearResponse = response.data.chart.result[0].meta
            return{
                id:clearResponse.symbol,
                name:clearResponse.longName,
                currentPrice:clearResponse.regularMarketPrice,
                priceChange:clearResponse.regularMarketPrice-last7d.at(-2),
                percentPriceChange:(clearResponse.regularMarketPrice - last7d.at(-2))/last7d.at(-2)*100,
                sparkline:last7d}
            }).catch(()=>null)

    }
    )
    const object = await Promise.all(promises)
    const responseObject = object.filter(x=> x !== null)
    if(!responseObject.length)
    {
        res.sendStatus(500)
    }
    const currency = req.query.currency.toUpperCase()
    if(currency === "USD")
    {
        res.status(200).json(responseObject)
    }
    else
    {
        const price = await exchangeRat(currency)
        const responseObjectWithCurrency = responseObject.map(x=>{
            return{
                id:x.id,
                name:x.name,
                currentPrice:x.currentPrice * price,
                priceChange:x.priceChange * price,
                percentPriceChange:x.percentPriceChange,
                sparkline:x.sparkline.map(x=>x*price)
            }
        })
        res.status(200).json(responseObjectWithCurrency)

    }
}   

export default getETF