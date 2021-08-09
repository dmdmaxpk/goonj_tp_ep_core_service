const axios = require('axios');
const config = require('../config');

class TelenorRepository {

    async generateToken () {
        return new Promise(function(resolve, reject) {
            axios({
                method: 'post',
                url: config.telenor_dcb_api_baseurl + 'oauthtoken/v1/generate?grant_type=client_credentials',
                headers: {'Authorization': 'Basic Y1J2dW5mTml3d0pJbzlpRzhUT1Zxdk1aMThXSXpXRlQ6TnlEVkdLanZhMFBvNkk1Qw==',
                'Content-Type': 'application/x-www-form-urlencoded' }
            }).then(function(response){
                resolve(response.data);
            }).catch(function(err){
                reject(err);
            });
        });
    }
    
    // To send messages
    async sendMessage(msisdn, message, apiToken)  {
        var form = { messageBody: message, recipientMsisdn: msisdn, source: 'Goonj' };
        console.log("Sms Data", form);

        return new Promise(function(resolve, reject) {
            axios({
                method: 'post',
                url: config.telenor_dcb_api_baseurl + 'sms/v1/send',
                headers: {'Authorization': 'Bearer '+apiToken, 'Content-Type': 'application/json' },
                data: form
            }).then(function(response){
                console.log("Sms Response", response.data);
                resolve(response.data);
            }).catch(function(err){
                reject(err);
            });
        })
    };

    async charge (msisdn, price_point, transaction_id, partner_id, apiToken)  {

        let form = {
            "correlationID": transaction_id,
            "msisdn": msisdn,
            "chargableAmount": price_point,
            "PartnerID": partner_id,
            "ProductID": "GoonjDCB-Charge"
        }
        
        console.log(`Form Data: ${form}`)
        return new Promise(function(resolve, reject) {
            axios({
                method: 'post',
                url: config.telenor_dcb_api_baseurl + 'payment/v1/charge',
                headers: {'Authorization': 'Bearer '+apiToken, 'Content-Type': 'application/json' },
                data: form
            }).then(function(response){
                console.log(`Response: ${response.data}`)
                resolve(response.data);
            }).catch(function(err){
                if(err && err.response && err.response.data){
                    console.error(`Error on charge: ${err.response.data}`)
                    reject(err.response.data);
                }else{
                    console.error(err);
                    reject({error_message: err.message});
                }
            });
        })
    }
    
    
    // To Check if user is customer of telenor
    async subscriberQuery (msisdn, apiToken)  {      
        return new Promise(function(resolve, reject) {
            axios({
                method: 'get',
                url: config.telenor_dcb_api_baseurl + `subscriberQuery/v3/checkinfo/${msisdn}`,
                headers: {'Authorization': 'Bearer '+apiToken, 'Content-Type': 'application/json' }
            }).then(function(response){
                resolve(response.data);
            }).catch(function(err){
                reject(err.response.data);
            });
        });
        
    }
}

module.exports = TelenorRepository;