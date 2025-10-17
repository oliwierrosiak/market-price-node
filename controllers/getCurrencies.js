import axios from "axios"

const currencySymbols = [
  "USD","EUR","JPY","GBP","AUD","CAD","CHF","CNY","HKD","NZD","SEK","KRW","SGD","NOK","MXN","INR","RUB","ZAR","TRY","BRL","PLN","THB","TWD","DKK","MYR","IDR","CZK","HUF","ILS","SAR","AED","PHP","CLP","COP","PEN","EGP","PKR","VND","NGN","KWD","QAR","ARS","UAH","RON","HRK","BGN","LKR","BDT","MAD","KES","GHS","DZD"
    ];

const getHistoricData = async(date,currency)=>{
    return new Promise(async(resolve,reject)=>{
        resolve(axios.get(`https://api.frankfurter.app/${date}?from=${currency}&to=${currencySymbols.join(',')}`))
    })
}

async function getCurrencies(req,res)
{
    const currency = req.query.currency.toUpperCase()
    const dates = []
    const dateNow = new Date()
    const responseObject = []

    for(let i = 1;i<8;i++)
    {   
        const date = new Date(dateNow.getTime()-i*86400000)
        dates.push(`${date.getFullYear()}-${date.getMonth()+1 < 10?0:''}${date.getMonth()+1}-${date.getDate() < 10?0:''}${date.getDate()}`)
    }
    const promises = []
    try
    {
        const response = await axios.get(`https://api.frankfurter.app/latest?from=${currency}&to=${currencySymbols.join(',')}`)
        if(response?.data?.rates)
        {
            for(const key in response.data.rates)
            {
                responseObject.push({id:key.toLowerCase(),name:key,currentPrice:1/response.data.rates[key],sparkline:[]})
            }
            dates.forEach(date=>{
                promises.push(getHistoricData(date,currency))
            })
            const a = await Promise.all(promises)
            a.forEach(x=>{
                const array = x.data.rates
                for(const key in array)
                {
                    const idx = responseObject.findIndex(x=>x.name === key)
                    responseObject[idx].sparkline.push(1/array[key])
                }
            })
            responseObject.forEach(x=>{
                x.sparkline = x.sparkline.reverse()
                x.priceChange = x.currentPrice - x.sparkline.at(-2)
                x.percentPriceChange = (x.currentPrice - x.sparkline.at(-2))/x.sparkline.at(-2)*100

            })
            res.status(200).json(responseObject)
        }
        else
        {
            throw new Error()
        }
       
    }
    catch(ex)
    {
        console.log(ex)
        res.sendStatus(500)
    }
    
}

export default getCurrencies