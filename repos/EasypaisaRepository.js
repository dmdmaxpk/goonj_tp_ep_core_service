const axios = require('axios');
const config = require('../config');

const crypto = require("crypto");
const NodeRSA = require('node-rsa');

class EasypaisaRepository {

    constructor(){
        this.emailAddress = 'muhammad.azam@dmdmax.com';
        this.username = 'Goonj';
        this.password = '8c2f6b83579b69bc04903d1c3310c2db';
        this.storeId = '42221';
        this.signature = null;
        this.publicKey = null;
        this.privateKey = 'MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC3K4dyfMn54MXEFNlFfUhEr2Foj/GilACCG7A/wA+KLHgBFOXcShMGgitwcPxLwn9sabd2STRLy4JvsmJeJ/H5x+Z438Jv5tTPEXx0eQ338KKIad+Ps3uGYq7m+7uRQHzyGIw8B+HyVtO3JMt7vAHV3VQyOdcRhRk6L+xhUT5AhbJzef2fkIvDTCwg5FtAT0k19UeMxTEDXZLDXVYerIHs+Bn5aM6cGMzDd3GQl2qVvdWG/c/aNpOwH0fNLClztfbI3ldSicr61LA/Aa7sGGXOPkU6MwV91rjfBz96YyFWStUC3Qt9P6xcH52CAY3GRPm03xsSeI2RyXfI+hml6Y5ZAgMBAAECggEBAIQ13yY7/G1oWFcX1Vva+fbZwC2A+KCow1UmNylMr+rD/jqJowBGV0UzX7dhVjo4wVC3Xbz7ScwLsLJ+x5G+s2Hfb/N/TxEGRETSEkrftb1o62gbQ0qt+lMdl7ERsmk9avIz1cTey6/oDBj9bgJ5yblccBFwvlPfBj6BqNT1l0FqBmAzXn9QOGNAPBFCH49+9j1Mo3nTvmHe3bF2UqyRbdA7/WDZ5TSxOS5spTJWU+NDTSz/CthMFR2X7dpC5YutEKq5ThkBSEuTKqSP0d7pSszTvgzq5wbedsIeeX8FyQXTCUbiTbsHtomucq7KhudBfngjzPM38yGin0kU58/eXKECgYEA4omc+xMnsbf4r3CtnFygsy7ehIDWnKYvmNcJXn56B0Uxu1g6Cy0JGoxnwQ4fEb9KGmJjI+IU3iYGHT86ayoo8BTp4A25f25j0bTkK8jiTWmBEG8rFNZGOa2/v8CGl6RqHaS1+BUQjmUaA2YXNjsCYv8CZx81dppQFr1qZjbOtOcCgYEAzv4Hcg94AaPORhYCRLQnFjMPe/cno/aABYY3zbN7+u2DMInDqdq+Oj+D9XCdHRUwqmLs44UEf9hkAO/JIlk1l1nOJVfd1tgDpabvoO5U6WLMeTzu+ype2dkPab75XykAiuTdlIaBBYoQ6+g8qDwzy1j7t63KkSKQczVymirh+r8CgYBGueod5TwWWza0J3y8fZradn6YZdUbMTNZB4HwU5JrpKnDMOdmR9g4xq858du3Yb6UADWtpU8YkEyGYxAtFwuS8SSXhBFu/JsDhPNbzCsDOjZGWD7eEYv5RArCpiwfOgC7YopBeuohWuVFPGFw1/mFyNIKOg8qCUGJ5/dJFEFy7wKBgD3/DeHWyj3LfyO0wdcsEizu/CtH+oJ8eRmuepZMtMySSOHH0WfVUXaGwZJIuXYVe6781DDNDWzxNfql1xtHluqPBlRe/d20c1sxJcKQv7PrWIzTeEyYAzLCdYBZp70dvcDcDZXHt2seUDUoKMrGxUiZjUMVdX+E17j6ACo2v9pnAoGAaLpAn9gPGakZPm8lf3hXprNbGW6AreBWRI8AltzDMPRPbSsNvbcw8kFvtN8l+WsSBSAt2yl7wrroFoneF97uxdMsAFBitV/1dYc2j0j2viic/txId/NLPaQ9VrRp+mBCJZOZ8NcWweh/+6Lh/atxOpkt12uHBQWweLLbXxwzT6M=';
        this.generateotpUrl = config.ep_api_baseurl + 'generateotp';
        this.initiatelinktransactionUrl = config.ep_api_baseurl + 'initiatelinktransaction';
        this.initiatepinlesstransactionUrl = config.ep_api_baseurl + 'initiatepinlesstransaction';
        this.base64_cred = Buffer.from(this.username+":"+this.password).toString('base64');
    }

        /*
    * Telenor OTP - Merchant app call to get user OTP
    * Private key is used to generate signature
    * Params: mobileAccountNo
    * Return Type: Object
    * */
    async generateOPT(msisdn){
        let self = this;
        let data = {
            'request': {
                'storeId': self.storeId,
                'mobileAccountNo': msisdn
            }
        };
        try {
            self.generateSignature(data);
            data.signature = self.signature;
            console.log('Ep otp data', data);

            let resp = await axios({
                    method: 'post',
                    url: self.generateotpUrl,
                    data: data,
                    headers: {'Credentials': self.base64_cred, 'Authorization': 'Bearer '+config.telenor_dcb_api_token, 'Content-Type': 'application/json'}
                }).then(response => {
                    // console.log('Ep otp response', resp.data);
                    return response;
                }).catch(err => {
                    // console.log("Ep otp error 1", err.response.data);
                    return err
                });
            console.log("warning ",resp)
            if (resp.status === 200)
                return 'success';
            else
                return 'failed';
        }catch (e) {
            // console.log('Ep otp error 2', e);
            return 'failed';
        }
    }

    /*
   * Used to initiate transaction using User OTP
   * Params: mobileAccountNo, transactionAmount, OTP
   * Return Type: Object
   * */
    async initiateLinkTransaction(msisdn, amount, transaction_id, otp,){
        
        try {
            let self = this;
            await self.getKey();
            self.getOrderId();
            let data = {
                'request': {
                    'orderId': transaction_id,
                    'storeId': self.storeId,
                    'transactionAmount': '' + amount,
                    'transactionType': 'MA',
                    'mobileAccountNo': msisdn,
                    'emailAddress': self.emailAddress,
                    'otp': otp
                }
            };
            
            self.generateSignature(data);
            data.signature = self.signature;

            console.log('Ep link transaction data', data);
            let resp = await axios({
                method: 'post',
                url: self.initiatelinktransactionUrl,
                data: data,
                headers: {'Credentials': self.base64_cred, 'Authorization': 'Bearer '+config.telenor_dcb_api_token, 'Content-Type': 'application/json' }
            }).then(response => {
                return response;
            }).catch(err => {
                console.log('Ep link transaction error 1', err.response.data);
            });
            
            if (resp.status === 200 && resp.data.response.responseDesc === "SUCCESS"){
                console.log('Ep link transaction success', resp.data);
                return resp.data;
            }else{
                console.log('Ep link transaction failed', resp.data);
                return resp.data;
            }
        } catch(err){
            console.log('Ep link transaction error 2', err);
            throw err;
        }
    }

    /*
    * Used to perform pinless Mobile Account transaction using easypaisa MA token - mainly used in renewal subscription
    * Params: mobileAccountNo, packageObj(user package info), transaction_id(user transaction ID), subscription(Subscription data)
    * Return Type: Object
    * */
    async initiatePinlessTransaction(msisdn, price_point, transaction_id, ep_token){
        try {
            let self = this, returnObj = {};
            await self.getKey();
            self.getOrderId();

            let data = {
                'request': {
                    'orderId': transaction_id,
                    'storeId': self.storeId,
                    'transactionAmount': '' + price_point,
                    'transactionType': 'MA',
                    'mobileAccountNo': msisdn,
                    'emailAddress': self.emailAddress,
                    'tokenNumber': ep_token,
                }
            };

            self.generateSignature(data);
            data.signature = self.signature;

            console.log('EP Pinless Data: ', data);
            let resp = await axios({
                method: 'post',
                url: self.initiatepinlesstransactionUrl,
                data: data,
                headers: {'Credentials': self.base64_cred, 'Authorization': 'Bearer '+config.telenor_dcb_api_token, 'Content-Type': 'application/json' }
            }).then(response => {
                return response;
            }).catch(err => {
                console.log("Ep error occurred 1", err.response.data);
            });

            if (resp.status === 200 && resp.data.response.responseDesc === "SUCCESS"){
                console.log('Ep pinless transaction success', resp.data);
                return resp.data;
            }else {
                console.log('Ep pinless transaction failed', resp.data);
                return resp.data;
            }
        } catch(err){
            console.log('Ep error occurred 2', err);
            throw err;
        }
    }

    /*
    * RSA Encryption
    * Used to generate random Public and Private keys that will be used to generate signature for each Easypaisa & Telenor endpoint call.
    * Params: null
    * Return Type: Object
    * */
    generateKeys() {
        const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
            modulusLength: 2048,
        });

        this.publicKey = publicKey;
        this.privateKey = privateKey;
        return {'code': config.codes.code_success, 'message': 'Public and private keys are generated successfully', 'method': 'generateKeys'};
    }

    /*
    * Hash Algorithm using sha256
    * Private key is used to generate signature. Its length should be 2048 bits.
    * Params: null
    * Return Type: Object
    * */
    generateSignature(object){
        let trimmedData = JSON.stringify(object.request).replace(/(\\)?"\s*|\s+"/g, ($0, $1) => $1 ? $0 : '"');
        let key = new NodeRSA(null, {signingScheme: 'sha256'});
        key.importKey(this.privateKey, 'pkcs8');
        this.signature = key.sign(trimmedData, 'base64');
    }

    /*
    * RSA Encryption - verify the signature
    * Public key is used to verify the signature. Its length should be 2048 bits.
    * Params: null
    * Return Type: Object
    * */
    verfiySignature(){
        try {

            return {'code': config.codes.code_success, 'message': 'Signature is verifies successfully', 'method': 'verfiySignature'};
        } catch(err){
            return {'code': config.codes.code_error, 'message': err.message, 'method': 'verfiySignature'};
        }
    }
}

module.exports = EasypaisaRepository;