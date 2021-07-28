const { default: Axios } = require('axios');
const config = require('../config');
const otpRepo = require('../repos/OTPRepo');



// Generate OTP and save to collection
exports.sendOtp = async (req, res) => {
	let gw_transaction_id = req.body.transaction_id;
	let package_id = req.body.package_id;
	let payment_source =  req.body.payment_source; 
	let msisdn = req.body.msisdn;
	let user = await otpRepo.getUserByMsisdn(msisdn);

	let response = {};
	if(payment_source && payment_source === "easypaisa"){
		response.operator = "easypaisa";
	}else{
		try{
			response = await otpRepo.subscriberQuery(msisdn);
			console.log("SUBSCRIBER QUERY RESPONSE - OTP", response);
		}catch(err){
			console.log("SUBSCRIBER QUERY ERROR - OTP", err);
			response = err;
		}
	}

	if(!user){
        // no user
		let userObj = {};
		userObj.msisdn = msisdn;
        userObj.subscribed_package_id = 'none';
		userObj.source = req.body.source ? req.body.source : 'na';
		if (response.operator === 'telenor' || response.operator === 'easypaisa'){
			try {
                userObj.operator = payment_source;
				user = await otpRepo.createUser(userObj);
				
				if(payment_source === "telenor"){
					try {
						console.log('Payment - OTP - TP - UserCreated - ', user.msisdn, ' - ', user.source, ' - ', (new Date()));
						generateOtp(res, msisdn, user, gw_transaction_id);
					} catch (err) {
						res.send({code: config.codes.code_error, message: err.message, gw_transaction_id: gw_transaction_id })
					}
				} else if(payment_source === "easypaisa"){
					try {
						let record = await otpRepo.bootOptScript(msisdn);
						console.log('sendOtp - ep', record);
						if (record.code === 0)
							res.send({code: config.codes.code_success, message: record.message, access_token: authService.generateAccessToken(msisdn), refresh_token: authService.generateRefreshToken(msisdn), gw_transaction_id: gw_transaction_id});
						else
							res.send({code: config.codes.code_error, message: "Failed to send OTP", gw_transaction_id: gw_transaction_id });
					}catch (e) {
						console.log('sendOtp - error', e);
						res.send({code: config.codes.code_error, message: "Failed to send OTP", gw_transaction_id: gw_transaction_id });
					}
				}
            }catch (e) {
                res.send({code: config.codes.code_error, message: 'Failed to register user', gw_transaction_id: gw_transaction_id })
            }
		}else{
            // invalid customer
            otpRepo.createBlockUserHistory(msisdn, null, null, response.api_response, req.body.source);
            res.send({code: config.codes.code_error, message: "Not a valid Telenor number", gw_transaction_id: gw_transaction_id });
		}
		
	}else{
		if(payment_source === 'telenor'){
			console.log('sent otp - telenor');
			generateOtp(res, msisdn, user, gw_transaction_id);
		}else if (payment_source === 'easypaisa') {

            //check EP token already exist, if yes then generate Telenor token
            console.log('Checking if EP token already exist');
            let epToken = await checkEPToken(package_id, user);
			if(epToken){
				console.log('sent otp - tp as ep-token already exist');
				await generateOtp(res, msisdn, user, gw_transaction_id);
			}else{
				console.log('sent otp - ep as no ep-token exist');
				let record = await otpRepo.bootOptScript(msisdn);
				if (record.code === 0)
					res.send({code: config.codes.code_success, message: record.message, access_token: authService.generateAccessToken(msisdn), refresh_token: authService.generateRefreshToken(msisdn), gw_transaction_id: gw_transaction_id});
				else
					res.send({code: config.codes.code_error, message: "Failed to send OTP", gw_transaction_id: gw_transaction_id });
			}
		}
        else{
            // invalid customer
            otpRepo.createBlockUserHistory(msisdn, null, null, response.api_response, req.body.source);
            res.send({code: config.codes.code_error, message: "Not a valid Telenor number", gw_transaction_id: gw_transaction_id });
        }
	}
}



async function checkEPToken(package_id, user){
    let subscriber = await otpRepo.getSubscriberByUserId(user._id);
    if (subscriber){
        let prevSub = await otpRepo.getSubscriptionByPackageId(subscriber._id, package_id);
		if (prevSub && prevSub.ep_token && (prevSub.ep_token !== undefined || prevSub.ep_token !== '')) {
            return true;
        }
	}
    return false;
}

generateOtp = async(res, msisdn, user, gw_transaction_id) => {
	if(user){

		// Generate OTP
		let otp =  Math.floor(1000 + (9999 - 1000) * Math.random());
		console.log('OTP Generated: ', otp)
	
		let postBody = {otp: otp};
		postBody.msisdn = msisdn;
		let otpUser = await otpRepo.getOtp(msisdn);
		if(otpUser){
            // Record already present in collection, lets check it further.
			if(otpUser.verified === true){
				/* Means, this user is already verified by otp, probably he/she just wanted to 
				signin to another device from the same login, so let's update the record and 
				send newly created otp to user to verify. */
				
				postBody.verified = false;
				let record = await otpRepo.updateOtp(msisdn, postBody);
                if(record){
					// OTP updated successfuly in collection, let's send this otp to user by adding this otp in messaging queue
					otpRepo.sendMessage(`Use code ${record.otp} for Goonj TV`, record.msisdn);
					res.send({'code': config.codes.code_success, data: 'OTP sent', gw_transaction_id: gw_transaction_id});
				}else{
					// Failed to update
					res.send({'code': config.codes.code_error, 'message': 'Failed to update OTP', gw_transaction_id: gw_transaction_id});
				}
			}else{
				// Record already present in collection without verification, send this already generated otp to user so he can verify
				otpRepo.sendMessage(`Use code ${otpUser.otp} for Goonj TV`, otpUser.msisdn);
				res.send({'code': config.codes.code_success, data: 'OTP sent', gw_transaction_id: gw_transaction_id});
			}
		}else{

            // Means no user present in collection, let's create one.
			postBody.msisdn = msisdn;
			let record = await otpRepo.createOtp(postBody);
            if(record){
				// OTP created successfuly in collection, let's send this otp to user and acknowldge him/her
				otpRepo.sendMessage(`Use code ${record.otp} for Goonj TV`, record.msisdn);
				res.send({'code': config.codes.code_success, data: 'OTP sent', gw_transaction_id: gw_transaction_id});
			}else{
				// Failed to create
				res.send({'code': config.codes.code_error, 'message': 'Failed to create OTP', gw_transaction_id: gw_transaction_id});
			}
		}
	}
}

// Validate OTP
exports.verifyOtp = async (req, res) => {
	let gw_transaction_id = req.body.transaction_id;

	let msisdn = req.body.msisdn;
	let otp = req.body.otp;
	let subscribed_package_id = req.body.package_id;
	let otpUser = await otpRepo.getOtp(msisdn);

	if(!subscribed_package_id){
		subscribed_package_id = config.default_package_id;
	}

	
	if(otpUser){
		// OTP hardcoded
		if(msisdn === '03485049911'){
			otpUser.verified = false;
			otpUser.otp = '1234';
		}

		// Record already present in collection, lets check it further.
		if(otpUser.verified === true){
			// Means, this user is already verified by otp, so let's now push an error
			res.send({code: config.codes.code_error, message: 'Already verified with this OTP', 
						gw_transaction_id: gw_transaction_id});
		}else{
			// Let's validate this otp
			if(otpUser.otp === otp){
				// Otp verified, lets check the user's subscription

				let data = {};
				data.code = config.codes.code_otp_validated;
				data.data = 'OTP Validated!';

				await otpRepo.updateOtp(msisdn, {verified: true});
				let user = await otpRepo.getUserByMsisdn(msisdn);
				
				if(user){
					data.access_token = authService.generateAccessToken(msisdn);
					data.refresh_token = authService.generateRefreshToken(msisdn);

					let subscriber = await otpRepo.getSubscriberByUserId(user._id);
					if(subscriber && subscribed_package_id){
						let subscription = await otpRepo.getSubscriptionByPackageId(subscriber._id, subscribed_package_id);
						let subscribed_package_ids = await otpRepo.getPackagesOfSubscriber(subscriber._id);
						if(subscription){
							data.subscription_status = subscription.subscription_status;
							data.is_allowed_to_stream = subscription.is_allowed_to_stream; 
							data.user_id = user._id;
							data.subscribed_package_id = subscribed_package_id;
							data.gw_transaction_id = gw_transaction_id;
							data.subscribed_packages = subscribed_package_ids;
						}
					}
				}
				res.send(data);
			} else{
				res.send({code: config.codes.code_otp_not_validated, message: 'OTP mismatch error', gw_transaction_id: gw_transaction_id});
			}
		}
	}else{
		// Means no user present in collection, let's throw an error to user.
		res.send({code: config.codes.code_error, message: 'No OTP found to validate', gw_transaction_id: gw_transaction_id});
	}
}