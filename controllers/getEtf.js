import axios from "axios"

async function getETF(req,res)
{

    const responseObject = []
    const symbols = ['SPY','IVV','VOO','VTI','QQQ','EFA','EEM','VEA','VWO','XLK','XLF','XLE','XLV','XLY','GLD','IAU','SLV','USO','TLT','IEF','ARKK','SOXX','SMH','BOTZ','SPXS.L','VUAA.L','EQQQ.L','ISF.L']
    for(let i = 0;i<symbols.length;i++)
    {
        try
        {
            const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${symbols[i]}?range=7d&interval=1d`)
            const last7d=response.data.chart.result[0].indicators.quote[0].close
            const clearResponse = response.data.chart.result[0].meta
            responseObject.push({id:clearResponse.symbol,name:clearResponse.longName,currentPrice:clearResponse.regularMarketPrice,priceChange:clearResponse.regularMarketPrice-last7d.at(-2),percentChange:`${(clearResponse.regularMarketPrice - last7d.at(-2))/last7d.at(-2)*100}%`,sparkline:last7d})
        }
        catch(ex)
        {
        }
    }
    if(responseObject.length)
    {
        res.status(200).json(responseObject)

    }
    else
    {
        res.sendStatus(500)
    }
}   

export default getETF

//Dodac konwersje walut