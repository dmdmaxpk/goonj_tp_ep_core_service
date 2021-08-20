const axios = require('axios');
const config = require("../config");

class ManualChargeService {
    constructor() {}

    async manualRecharge(req, res){
        let {msisdns, amount} = req.body;
        let { port } = config;
        try{
            let msisdnArr = msisdns.split(/\s*,\s*/);
            console.log('msisdnArr: ', msisdnArr);

            if (msisdnArr.length > 0 && amount > 0){
                let reqBody = {}, responseArr = [];

                for (let msisdn of msisdnArr) {
                    if(!msisdn.startsWith('0')) msisdn = '0' + msisdn;

                    reqBody.msisdn = msisdn;
                    reqBody.amount = amount;
                    reqBody.transaction_id = msisdn + '_' + Math.random().toString(10).substr(2, 6);
                    reqBody.partner_id = 'TP-GoonjDailySub';
                    reqBody.payment_source = 'telenor';

                    console.log('Req Body: ', reqBody);
                    await axios.post(`http://localhost:${port}/core/charge`, reqBody)
                    .then(function (response){
                        let resObj = {};
                        resObj.msisdn = msisdn;
                        resObj.message = response.data.message;
                        resObj.api_response = response.data.full_api_response;
                        console.log('Res Body: ', resObj);
                        console.log('---------------------------------------------------------------------------------')
                        responseArr.push(resObj);
                    }).
                    catch( function (error){
                        console.log("Error updating telenor api:",  err);
                    });
                }
                res.send(responseArr);
            }
            else{
                res.send({status: false, message: 'Please provide msisdn and charge amount.'});
            }
        }catch(err){
            res.send({code: config.codes.code_error, message: err.message, error: err});
        }
    }
}


module.exports = ManualChargeService;