import axios from "axios"
import dotenv from 'dotenv'
dotenv.config()

const currencySymbols = [
  "USD","EUR","JPY","GBP","AUD","CAD","CHF","CNY","HKD","NZD","SEK","KRW","SGD","NOK","MXN","INR","RUB","ZAR","TRY","BRL","PLN","THB","TWD","DKK","MYR","IDR","CZK","HUF","ILS","SAR","AED","PHP","CLP","COP","PEN","EGP","PKR","VND","NGN","KWD","QAR","ARS","UAH","RON","HRK","BGN","LKR","BDT","MAD","KES","GHS","DZD"
    ];

const getHistoricData = async(date,currency)=>{
    return new Promise(async(resolve,reject)=>{
        resolve(axios.get(`${process.env.CurrencyApi}/${date}?from=${currency}&to=${currencySymbols.join(',')}`))
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
        const response = await axios.get(`${process.env.CurrencyApi}/latest?from=${currency}&to=${currencySymbols.join(',')}`)
        if(response?.data?.rates)
        {
            for(const key in response.data.rates)
            {
                responseObject.push({id:key.toLowerCase(),name:`1 ${key}`,currentPrice:1/response.data.rates[key],sparkline:[]})
            }
            dates.forEach(date=>{
                promises.push(getHistoricData(date,currency))
            })
            const a = await Promise.all(promises)
            a.forEach(x=>{
                const array = x.data.rates
                for(const key in array)
                {
                    const idx = responseObject.findIndex(x=>x.id === key.toLowerCase())
                    responseObject[idx].sparkline.push(1/array[key])
                }
            })
            for(let i =0;i<responseObject.length;i++)
            {
                
                responseObject[i].sparkline = responseObject[i].sparkline.reverse()
                responseObject[i].priceChange = Number((responseObject[i].currentPrice - responseObject[i].sparkline.at(-2).toFixed(3)).toFixed(3))
                responseObject[i].percentPriceChange = Number((responseObject[i].currentPrice - responseObject[i].sparkline.at(-2).toFixed(3)).toFixed(3))/(Number(responseObject[i].sparkline.at(-2).toFixed(3))||1)*100
                try
                {
                    if(responseObject[i].id.toUpperCase() === "EUR")
                    {
                        responseObject[i].image = process.env.EUImg
                    }
                    else
                    {
                        const countries = await axios.get(`${process.env.CountriesInfo}/currency/${responseObject[i].id.toUpperCase()}`)
                        const country = countries.data.sort((a,b)=>b.population - a.population)[0]
                        responseObject[i].image = country.flags.svg
                    }
                }
                catch(ex)
                {
                }
            }
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

//Dodac zwracnie linku do flag krajów poszczególnych walut