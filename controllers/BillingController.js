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
        res.send({code: config.codes.code_success, message: 'Successfully updated', token: token.access_token});
    }else{
        let previousToken = await apiTokenRepo.getToken();
        res.send({code: config.codes.code_error, message: 'Failed to update token', old_token: previousToken});
    }
}

exports.charge = async (req, res) => {
    let apiToken = await apiTokenRepo.getToken();
    let {msisdn, amount, transaction_id, partner_id, payment_source, ep_token} = req.body;
    if(msisdn && amount && transaction_id && partner_id && payment_source && apiToken){
        try{
            if(payment_source === 'easypaisa'){
                if(ep_token){
                    res.send({code: config.codes.code_error, message: 'Easypaisa token missing'});
                }else{
                    let response = await epRepo.initiatePinlessTransaction(msisdn, amount, transaction_id, ep_token);
                    if(response.message === "success"){
                        res.send({code: config.codes.code_success, message: 'success', full_api_response: response});
                    }else{
                        res.send({code: config.codes.code_billing_failed, message: 'failed', full_api_response: response});
                    }
                }
            }else {
                let response = await tpRepo.charge(msisdn, amount, transaction_id, partner_id, apiToken);
                if(response.Message === "Success"){
                    res.send({code: config.codes.code_success, message: 'success', full_api_response: response});
                }else{
                    res.send({code: config.codes.code_billing_failed, message: 'failed', full_api_response: response});
                }
            }
        }catch(e){
            res.send({code: config.codes.code_error, message: e});
        }
    }else{
        res.send({code: config.codes.code_error, message: 'Critical parameters are missing.'});
    }
}

exports.sendMessage = async (req, res) => {
    let apiToken = await apiTokenRepo.getToken();
    let {msisdn, message} = req.body;
    if(msisdn && message && apiToken){
        tpRepo.sendMessage(msisdn, message, apiToken)
        res.send({code: config.codes.code_success, message: 'Message sent'});
    }else{
        res.send({code: config.codes.code_error, message: 'Critical parameters are missing.'});
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

exports.subscriberQuery = async (req, res) => {
    let apiToken = await apiTokenRepo.getToken();
    let {msisdn} = req.query;
    if(msisdn && apiToken){
        try{
            let response = await tpRepo.subscriberQuery(msisdn, apiToken);
            console.log(response);
            if (response.Message === "Success" && response.AssetStatus === "Active") {
                res.send({code: config.codes.code_success, operator: 'tp', full_api_response: response});
            }else{
                res.send({code: config.codes.code_success, operator: 'ntp', full_api_response: response});
            }
        }catch(e){
            res.send({code: config.codes.code_success, operator: 'ntp', full_api_response: e});
        }
    }else{
        res.send({code: config.codes.code_error, message: 'Critical parameters are missing.'});
    }
}