const axios = require('axios')
const https = require('https')
const config = require('./config')
// const domain = config.telenor_dcb_api_baseurl;
// const domain = 'http://localhost:3001';
// let instance

const fetchClient = () => {
    const defaultOptions = {
        baseURL: config.telenor_dcb_api_baseurl,
        headers: {
        'Content-Type': 'application/json',
        },
        timeout: 90000, //optional
        httpsAgent: new https.Agent({ keepAlive: true })
    };
    
    // Create instance
    let instance = axios.create(defaultOptions);
    return instance;
}

module.exports = {fetchClient};