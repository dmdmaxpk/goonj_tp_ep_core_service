const axios = require('axios');
const config = require('../config');

const apiTokenRepo = require('../repos/ApiTokenRepo');

const BillingRepository = require('../repos/BillingRepository');
const repo = new BillingRepository();

exports.generateToken = async (req, res) => {
    let token = repo.generateToken();
    if(token){
        // save to database
        let currentToken = await apiTokenRepo.getToken();
        currentToken === undefined ? apiTokenRepo.createToken(token) : apiTokenRepo.updateToken(token);
        res.send({code: config.codes.code_success, token: token});
    }else{
        let previousToken = await apiTokenRepo.getToken();
        res.send({code: config.codes.code_error, old_token: previousToken});
    }
}

exports.charge = async (req, res) => {
    let apiToken = await apiTokenRepo.getToken();
    let {msisdn, amount, transaction_id, partner_id} = req.body;
    if(msisdn && amount && transaction_id && partner_id && apiToken){
        try{
            let response = await repo.charge(msisdn, amount, transaction_id, partner_id, apiToken);
            if(response.data.Message === "Success"){
                res.send({code: config.codes.code_success, message: message, full_api_response: response});
            }else{
                res.send({code: config.codes.code_billing_failed, data: response.data, full_api_response: response});
            }
        }catch(e){
            res.send({code: config.codes.code_error, message: e.message});
        }
    }else{
        res.send({code: config.codes.code_error, message: 'Critical parameters are missing.'});
    }
}

exports.sendMessage = async (req, res) => {
    let apiToken = await apiTokenRepo.getToken();
    let {msisdn, message} = req.body;
    if(msisdn && message && apiToken){
        repo.sendMessage(msisdn, message, apiToken)
        res.send({code: config.codes.code_success, message: 'Message sent'});
    }else{
        res.send({code: config.codes.code_error, message: 'Critical parameters are missing.'});
    }
}

exports.subscriberQuery = async (req, res) => {
    let apiToken = await apiTokenRepo.getToken();
    let {msisdn} = req.body;
    if(msisdn && apiToken){
        try{
            let response = await repo.subscriberQuery(msisdn, apiToken);
            res.send({code: config.codes.code_success, response: response});
        }catch(e){
            res.send({code: config.codes.code_error, message: e.message});
        }
    }else{
        res.send({code: config.codes.code_error, message: 'Critical parameters are missing.'});
    }
}