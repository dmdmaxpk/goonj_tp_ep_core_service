const axios = require('axios')
const https = require('https')
const config = require('./config')
const domain = config.telenor_dcb_api_baseurl;
let instance

module.exports = async function (context)
{
    if (!instance)
    {
        //create axios instance
        instance = axios.create({
            baseURL: domain,
            timeout: 60000, //optional
            httpsAgent: new https.Agent({ keepAlive: true })
        })
    }

    return instance;
}