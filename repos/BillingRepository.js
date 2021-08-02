const axios = require('axios');
const config = require('../config');

const apiTokenRepo = require('../repos/ApiTokenRepo');

class BillingRepository {

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

        return new Promise(function(resolve, reject) {
            axios({
                method: 'post',
                url: config.telenor_dcb_api_baseurl + 'sms/v1/send',
                headers: {'Authorization': 'Bearer '+apiToken, 'Content-Type': 'application/json' },
                data: form
            }).then(function(response){
                console.log("RESPONSE SMS###", response);
                resolve(response.data);
            }).catch(function(err){
                reject(err);
            });
        })
    };

    async charge (msisdn, pricePoint, transaction_id, partner_id, apiToken)  {

        let form = {
            "correlationID": transaction_id,
            "msisdn": msisdn,
            "chargableAmount": pricePoint,
            "PartnerID": partner_id,
            "ProductID": "GoonjDCB-Charge"
        }
        
        let label = "label " + Date.now() + Math.random();
        console.time("charge api time start - " + label);
        return new Promise(function(resolve, reject) {
            axios({
                method: 'post',
                url: config.telenor_dcb_api_baseurl + 'payment/v1/charge',
                headers: {'Authorization': 'Bearer '+apiToken, 'Content-Type': 'application/json' },
                data: form
            }).then(function(response){
                console.timeEnd("charge api time end - " + label);
                console.log(response);
                resolve(response);
            }).catch(function(err){
                console.log(err);
                console.timeEnd("charge api time end with error - " + label);
                reject(err);
            });
        })
    }
    
    
    // To Check if user is customer of telenor
    async subscriberQuery (msisdn, apiToken)  {
        
        let object = {};
        let api_response;
        let op;

        return new Promise(function(resolve, reject) {
            axios({
                method: 'get',
                url: config.telenor_dcb_api_baseurl + `subscriberQuery/v3/checkinfo/${msisdn}`,
                headers: {'Authorization': 'Bearer '+apiToken, 'Content-Type': 'application/json' }
            }).then(function(response){
                api_response = response.data;
                object.api_response = api_response;
                if (api_response.Message === "Success" && api_response.AssetStatus === "Active") {
                    op = "telenor";
                }else{
                    op = "not_telenor";
                }
                object.operator = op;
                resolve(object);
            }).catch(function(err){
                object.operator = "not_telenor";
                object.api_response = err.response.data;
                reject(object);
            });
        });
        
    }
}

module.exports = BillingRepository;