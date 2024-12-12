module.exports = function otp(){
    let code = Math.floor(Math.random() * 10000);
    return code;
}

