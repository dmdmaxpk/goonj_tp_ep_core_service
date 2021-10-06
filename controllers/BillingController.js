const config = require('../config');
const apiTokenRepo = require('../repos/ApiTokenRepo');

const TelenorRepository = require('../repos/TelenorRepository');
const tpRepo = new TelenorRepository();

const EasypaisaRepository = require('../repos/EasypaisaRepository');
const epRepo = new EasypaisaRepository();

exports.getToken = async (req, res) => {
    let currentToken = await apiTokenRepo.getToken();
    res.send({code: currentToken === undefined ? config.codes.code_error : config.codes.code_success, token: currentToken});
}

exports.updateToken = async (req, res) => {
    let token = await tpRepo.generateToken();
    if(token){
        // save to database
        let currentToken = await apiTokenRepo.getToken();
        currentToken === undefined ? apiTokenRepo.createToken(token.access_token) : apiTokenRepo.updateToken(token.access_token);
        config.telenor_dcb_api_token = currentToken;
        res.send({code: config.codes.code_success, message: 'Successfully updated', token: token.access_token});
    }else{
        let previousToken = await apiTokenRepo.getToken();
        res.send({code: config.codes.code_error, message: 'Failed to update token', old_token: previousToken});
    }
}

exports.charge = async (req, res) => {
    let apiToken = await apiTokenRepo.getToken();
    let {msisdn, amount, transaction_id, partner_id, payment_source, ep_token, otp} = req.body;
    console.log('charge - msisdn: ', msisdn);
    if(apiToken){
        if(msisdn && amount && transaction_id && partner_id && payment_source){
            try{
                if(payment_source === 'easypaisa'){
                    if(ep_token){
                        let startTime = new Date();
                        let response = await epRepo.initiatePinlessTransaction(msisdn, amount, transaction_id, ep_token);
                        let endTime = new Date() - startTime;

                        if(response && response.response && response.response.responseDesc && response.response.responseDesc === 'SUCCESS'){
                            res.send({code: config.codes.code_success, response_time: timeTakeByChargeApi(endTime), message: 'success', full_api_response: response});
                        }else{
                            res.send({code: config.codes.code_billing_failed, response_time: timeTakeByChargeApi(endTime), message: 'failed', full_api_response: response});
                        }
                    }else{
                        if(otp){
                            let startTime = new Date();
                            let response = await epRepo.initiateLinkTransaction(msisdn, amount, transaction_id, otp);
                            let endTime = new Date() - startTime;
    
                            if(response && response.response && response.response.responseDesc){
                                if(response.response.responseDesc === 'SUCCESS'){
                                    res.send({code: config.codes.code_success, response_time: timeTakeByChargeApi(endTime), message: 'success', full_api_response: response});
                                }else{
                                    res.send({code: config.codes.code_billing_failed, response_time: timeTakeByChargeApi(endTime), message: 'failed', desc: response.response.responseDesc, full_api_response: response});
                                }
                            }else{
                                res.send({code: config.codes.code_billing_failed, response_time: timeTakeByChargeApi(endTime), message: 'failed', full_api_response: response});
                            }
                        }else{
                            res.send({code: config.codes.code_billing_failed, message: 'Please provide valid OTP'});
                        }
                    }
                }else {
                    let startTime = new Date();
                    let response = await tpRepo.charge(msisdn, amount, transaction_id, partner_id, apiToken);
                    let endTime = new Date() - startTime;

                    if(response.Message === "Success"){
                        res.send({code: config.codes.code_success, response_time: timeTakeByChargeApi(endTime),  message: 'success', full_api_response: response});
                    }else{
                        res.send({code: config.codes.code_billing_failed, response_time: timeTakeByChargeApi(endTime), message: 'failed', full_api_response: response});
                    }
                }
            }catch(e){
                res.send({code: config.codes.code_error, message: 'failed', error: e});
            }
        }else{
            res.send({code: config.codes.code_error, message: 'critical parameters are missing.'});
        }
    }else{
        res.send({code: config.codes.code_error, message: 'api token missing.'});
    }
}

timeTakeByChargeApi = (take_time) => {
    take_time = take_time.toString();
    let len = take_time.length;
    if (len > 2){
        take_time = take_time.substring(0, take_time.length - 2);
        take_time = take_time+'00';
    }

    return take_time;
}

exports.sendMessage = async (req, res) => {
    let apiToken = await apiTokenRepo.getToken();
    let {msisdn, message} = req.body;
    console.log('### sendMessage body', req.body);
    if(apiToken){
        if(msisdn && message){
            let response = await tpRepo.sendMessage(msisdn, message, apiToken)
            res.send({code: config.codes.code_success, message: 'Message sent', operator_response: response});
        }else{
            res.send({code: config.codes.code_error, message: 'Critical parameters are missing.'});
        }
    }else{
        res.send({code: config.codes.code_error, message: 'Auth token missing'});
    }
}

exports.sendEpOtp = async (req, res) => {
    let {msisdn} = req.body;
    if(msisdn){
        let response = await epRepo.generateOPT(msisdn)
        res.send({code: response === 'success' ? config.codes.code_success : config.codes.code_billing_failed, message: response === 'success' ? 'OTP sent' : 'Failed to send OTP'});
    }else{
        res.send({code: config.codes.code_error, message: 'Critical parameters are missing.'});
    }
}

exports.epLinkTransaction = async (req, res) => {
    let {msisdn, amount, transaction_id, otp} = req.body;
    if(msisdn && amount && transaction_id && otp){
        let response = await epRepo.initiateLinkTransaction(msisdn, amount, transaction_id, otp)
        if(response && response.response && response.response.responseDesc && response.response.responseDesc === 'SUCCESS'){
            res.send({code: config.codes.code_success, message: 'success', full_api_response: response});
        }else{
            res.send({code: config.codes.code_billing_failed, message: 'failed', full_api_response: response});
        }
    }else{
        res.send({code: config.codes.code_error, message: 'Critical parameters are missing.'});
    }
}

exports.subscriberQuery = async (req, res) => {
    let apiToken = await apiTokenRepo.getToken();
    let {msisdn} = req.query;
    if(msisdn && apiToken){
        try{
            let response = await tpRepo.subscriberQuery(msisdn, apiToken);
            console.log(response);
            if (response.Message === "Success" && response.AssetStatus === "Active") {
                res.send({code: config.codes.code_success, operator: 'telenor', full_api_response: response});
            }else{
                res.send({code: config.codes.code_success, operator: 'non_telenor', full_api_response: response});
            }
        }catch(e){
            res.send({code: config.codes.code_success, operator: 'non_telenor', full_api_response: e});
        }
    }else{
        res.send({code: config.codes.code_error, message: 'critical parameters are missing.'});
    }
}