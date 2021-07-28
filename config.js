const env = process.env.NODE_ENV || 'development';

// application gets environment from either system envs or from this file in above line.
// Total tps is 40 for now but we need to increase this

const telenor_subscriber_query_api_tps = 10;
const local_subscription_api_tps = 10;
const ep_subscription_api_tps = 1;

const HARD_TOKEN = "I3zrSLC0eK5aKBCCmO1D.9uVrgDWfltvbthuirham.Zkd7whBHLKwMJgvt45oc.XVxPBgEBvyTB";
const ACCESS_TOKEN_SECRET = "d213db37e96a781c5b5eee1eb000dc6edd1d9ce0264247aea073b16d7daac7efeb30b2949c9845d4549efad77556673f6a16ae81a1725c0dcbffb1c9dc13fed8";
const REFRESH_TOKEN_SECRET = "6a097f388a863d691721261efcf53cd09e89f4e0770837c50fc4f59a33e5a146b22abb12aa37272665cead73fc5ee268608f522a2109ad98deae722328362a20";

const codes = {
    code_error: -1,
    code_success: 0,
    code_record_added: 1,
    code_record_updated: 2,
    code_record_deleted: 3,

    code_invalid_data_provided: 4,
    code_record_already_added: 5,
    code_data_not_found: 6,

    code_otp_validated: 7,
    code_otp_not_validated: 8,
    code_already_subscribed: 9,
    code_in_billing_queue: 10,
    code_trial_activated: 11,
    code_user_gralisted: 12,
    code_user_blacklisted: 13,
    code_auth_failed: 14,
    code_auth_token_not_supplied: 15,
    code_already_in_queue: 16,
    code_otp_not_found: 17
}


// User Service URL
const goonj_paywall_microservice = 'http://localhost:5000';
const user_service_url = 'http://localhost:6000';
const subscriber_query = 'http://localhost:7000';
const billing_service = 'http://localhost:8000';

let config = {
    development: {
        telenor_subscriber_query_api_tps: telenor_subscriber_query_api_tps,
        port: '5000',
        mongoDB: 'mongodb://localhost:27017/goonjpaywall',
        codes: codes,
        logger_url: "http://127.0.0.1:8000/",
        ACCESS_TOKEN_SECRET: ACCESS_TOKEN_SECRET,
        REFRESH_TOKEN_SECRET: REFRESH_TOKEN_SECRET,
        HARD_TOKEN: HARD_TOKEN,
        goonj_paywall_microservice: goonj_paywall_microservice,
        user_service_url: user_service_url,
        subscriber_query: subscriber_query,
        billing_service: billing_service,
    },
    staging: {
        telenor_subscriber_query_api_tps: telenor_subscriber_query_api_tps,
        port: '5000',
        mongoDB: 'mongodb://mongodb:27017/goonjpaywall',
        rabbitMq: 'amqp://rabbitmq',
        codes: codes,
        logger_url: "http://127.0.0.1:8000/",
        ACCESS_TOKEN_SECRET: ACCESS_TOKEN_SECRET,
        REFRESH_TOKEN_SECRET: REFRESH_TOKEN_SECRET,
        HARD_TOKEN: HARD_TOKEN,
        goonj_paywall_microservice: goonj_paywall_microservice,
        user_service_url: user_service_url,
        subscriber_query: subscriber_query,
        billing_service: billing_service,
    },
    production: {
        telenor_subscriber_query_api_tps: telenor_subscriber_query_api_tps,
        port: process.env.PW_PORT,
        mongoDB: process.env.PW_MONGO_DB_URL,
        rabbitMq: process.env.PW_RABBIT_MQ,
        codes: codes,
        logger_url: "http://127.0.0.1:8000/",
        ACCESS_TOKEN_SECRET: ACCESS_TOKEN_SECRET,
        REFRESH_TOKEN_SECRET: REFRESH_TOKEN_SECRET,
        HARD_TOKEN: HARD_TOKEN,
        goonj_paywall_microservice: goonj_paywall_microservice,
        user_service_url: user_service_url,
        subscriber_query: subscriber_query,
        billing_service: billing_service,
    }
};

console.log("---", env);

if (env === 'development') config = config.development;
if (env === 'staging') config = config.staging;
if (env === 'production') config = config.production;

module.exports = config;
