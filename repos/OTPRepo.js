const mongoose = require('mongoose');
const OTP = mongoose.model('Otp');

createOtp = async(postData) => {
    let otp = new OTP(postData);
    let result = await otp.save();
    return result;
}

getOtp = async(msisdn) => {
    let result = await OTP.findOne({msisdn: msisdn});
	return result;
}

updateOtp = async(msisdn, postData) => {
    const query = { msisdn: msisdn };
    postData.last_modified = new Date();
    
    const result = await OTP.updateOne(query, postData);
    if (result.nModified === 0) {
        return undefined;
    }else{
        let otp = await getOtp(msisdn);
        return otp;
    }
}

deleteUser = async(msisdn) => {
    const result = await OTP.deleteOne({msisdn: msisdn});
    return result;
}

getUserByMsisdn = async(msisdn) => {
	return await Axios.get(`${config.user_service_url}/get_user_by_msisdn?msisdn=${msisdn}`)
	.then(res =>{
		let result = res.data;
		return result
	})
	.catch(err =>{
		return err
	})
}
createUser = async(userObj) => {
	return await Axios.post(`${config.user_service_url}/create_user`, userObj)
	.then(res =>{ 
		let result = res.data;
		return result
	})
	.catch(err =>{
		return err
	})
}
subscriberQuery = async(msisdn) => {
	return await Axios.get(`${config.subscriber_query}/sub?msisdn=${msisdn}`)
	.then(res =>{ 
		let result = res.data;
		return result
	})
	.catch(err =>{
		return err
	})
}
bootOptScript = async(msisdn) => {
	return await Axios.get(`${config.goonj_paywall_microservice}/easypaisa?msisdn=${msisdn}`)
	.then(res =>{ 
		let result = res.data;
		return result
	})
	.catch(err =>{
		return err
	})
}
createBlockUserHistory = async(msisdn, nulls, nulls2, api_response, source) => {
	return await Axios.post(`${config.billing_service}/block`, {msisdn, nulls, nulls2, api_response, source})
	.then(res =>{ 
		let result = res.data;
		return result
	})
	.catch(err =>{
		return err
	})
}

getSubscriberByUserId = async(id) => {
	return await Axios.get(`${config.subscriber_query}/easypaisa?id=${id}`)
	.then(res =>{ 
		let result = res.data;
		return result
	})
	.catch(err =>{
		return err
	})
}
getSubscriptionByPackageId = async(subscriber_id, package_id) => {
	return await Axios.get(`${config.subscriber_query}/getSubscriptionByPackageId?subscriber_id=${subscriber_id}&package_id=${package_id}`)
	.then(res =>{ 
		let result = res.data;
		return result
	})
	.catch(err =>{
		return err
	})
}

getPackagesOfSubscriber = async(id) => {
	return await Axios.get(`${config.subscriber_query}/getPackagesOfSubscriber?id=${id}`)
	.then(res =>{ 
		let result = res.data;
		return result
	})
	.catch(err =>{
		return err
	})
}

sendMessage = async(message, msisdn) => {
	return await Axios.post(`${config.message_service}/messages/sms`, {message, msisdn})
	.then(res =>{ 
		let result = res.data;
		return result
	})
	.catch(err =>{
		return err
	})
}

module.exports = {
    createOtp: createOtp,
    getOtp: getOtp,
    updateOtp: updateOtp,
    deleteUser: deleteUser,
    getUserByMsisdn: getUserByMsisdn,
    subscriberQuery: subscriberQuery,
    createUser: createUser,
    bootOptScript: bootOptScript,
    createBlockUserHistory: createBlockUserHistory,
    getSubscriberByUserId: getSubscriberByUserId,
    getSubscriptionByPackageId: getSubscriptionByPackageId,
    getPackagesOfSubscriber: getPackagesOfSubscriber,
	sendMessage: sendMessage
}