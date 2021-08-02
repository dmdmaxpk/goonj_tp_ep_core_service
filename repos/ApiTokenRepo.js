const mongoose = require('mongoose');
const ApiToken = mongoose.model('ApiToken');

createToken = async(new_token) => {
    let token = new ApiToken({token: new_token});
    let result = await token.save();
    return result;
}

getToken = async() => {
    let result = await ApiToken.findOne();
    if(result){
        return result.token;
    }
    return undefined;
}

updateToken = async(token) => {
    let postBody = {};
    postBody.token = token;
    postBody.last_modified = new Date();
    await ApiToken.updateOne(postBody);
}

module.exports = {
    createToken: createToken,
    getToken: getToken,
    updateToken: updateToken
}