import axios from "axios"
import dotenv from 'dotenv'
dotenv.config()

async function getCrypto(req,res)
{
    try
    {
        const currency = req.query.currency.toLowerCase()
        const response = await axios.get(`${process.env.CryptoApi}/coins/markets?vs_currency=${currency}&sparkline=true`)
        const responseObject = []
        response.data.forEach(x=>{
            responseObject.push({id:x.id,name:x.name,image:x.image,currentPrice:x.current_price,rank:x.market_cap_rank,priceChange:x.price_change_24h,percentPriceChange:x.price_change_percentage_24h,sparkline:x.sparkline_in_7d.price.filter((x,idx)=>{return idx%6 === 0})})
        })
        const sortedObject = responseObject.sort((a,b)=>{return a.rank-b.rank})
        res.status(200).json(sortedObject)
    }
    catch(ex)
    {
        res.sendStatus(500)
    }
}

export default getCrypto