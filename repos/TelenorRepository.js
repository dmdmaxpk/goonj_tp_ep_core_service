const axios = require('axios');
const config = require('../config');
const {fetchClient} = require('../axiosInstance');

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
                console.log(err);
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
            }, {timeout: 60000}).then(function(response){
                console.log("Sms Response", response.data);
                resolve(response.data);
            }).catch(function(err){
                console.log(err);
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
        
        console.log(`Form Data: `, form);
        return new Promise(function(resolve, reject) {
            // axios({
            //     httpsAgent: new https.Agent({keepAlive: true, keepAliveMsecs: 30000}),
            //     method: 'post',
            //     url: config.telenor_dcb_api_baseurl + 'payment/v1/charge',
            //     headers: {'Authorization': 'Bearer '+apiToken, 'Content-Type': 'application/json' },
            //     data: form
            // }, {timeout: 60000}).then(function(response){
            //     console.log(`Response: `, response.data)
            //     console.log('-----------------------------------------------');
            //     resolve(response.data);
            // }).catch(function(err){
            //     if(err && err.response && err.response.data){
            //         console.error(`Error on charge: `, err.response.data)
            //         resolve(err.response.data);
            //     }else{
            //         console.error(err);
            //         reject({error_message: err.message});
            //     }
            // });

            fetchClient().post('/payment/v1/charge', form, {headers: {'Authorization': 'Bearer '+apiToken, 'Content-Type': 'application/json' }})
            .then(function(response){
                console.log(`Response: `, response.data)
                console.log('-----------------------------------------------');
                resolve(response.data);
            }).catch(function(err){
                if(err && err.response && err.response.data){
                    console.error(`Error on charge: `, err.response.data)
                    resolve(err.response.data);
                }else{
                    console.error(err);
                    reject({error_message: err.message});
                }
            });
        })
    }

    async subscribe(msisdn, serviceId, apiToken)  {

        let form = {
            "msisdn": msisdn,
            "serviceId": serviceId,
            "channel":"API"
        }
        
        console.log(`Form Data - Charge V2: `, JSON.stringify(form));
        return new Promise(function(resolve, reject) {
            fetchClient().post('/dpdp/v1/subscriber', form, {headers: {'Authorization': 'Bearer '+apiToken, 'Content-Type': 'application/json' }})
            .then(function(response){
                // response.data => {"status":"ACTIVE","activationTime":1675403635,"expireTime":1675450800,"activationChannel":"API","serviceVariant":{"id":99144,"externalId":99144,"name":"GOONJ DAILY"},"purchasePrice":5.97,"product":{"id":67,"name":"THIRD_PARTY_GOONJ","type":"EXTERNAL"},"service":{"id":77,"name":"GOONJ","renewalWindows":[{"from":"05:00","to":"12:00"},{"from":"13:00","to":"16:00"},{"from":"17:00","to":"23:00"}]}}
                console.log(`Subscribe - Response - V2: `, response.data)
                resolve(response.data);
            }).catch(function(err){
                if(err && err.response && err.response.data){
                    console.error(`Subscribe - Error on charge - V2: `, err.response.data)
                    resolve(err.response.data);
                }else{
                    console.error(err);
                    reject({error_message: err.message});
                }
            });
        });
    }

    async unsubscribe(msisdn, serviceId, apiToken)  {

        let form = {
            "msisdn": msisdn,
            "serviceId": serviceId,
            "channel":"API"
        }
        
        console.log(`Form Data - Unsub V2: `, JSON.stringify(form), ' T ', apiToken);
        return new Promise(function(resolve, reject) {
            fetchClient().delete('/dpdp/v1/subscriber', form, {headers: {'Authorization': 'Bearer '+apiToken, 'Content-Type': 'application/json' }})
            .then(function(response){
                console.log(`Response - Unsub - V2: `, response.data)
                resolve(JSON.stringify(response.data));
            }).catch(function(err){
                if(err && err.response && err.response.data){
                    console.error(`Error on unsub - V2: `, err.response.data)
                    resolve(err.response.data);
                }else{
                    console.error(err);
                    reject({error_message: err.message});
                }
            });
        });
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
                console.log(err);
                reject(err.response.data);
            });
        });
        
    }
}

module.exports = TelenorRepository;