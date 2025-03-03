const {Sequelize} = require('sequelize');
const Op = Sequelize.Op;
require('dotenv').config();
const ActiveDirectory = require('activedirectory2');

function activeDirActivation(){
    let baseDN = 'DC='+process.env.USER_AUTHENTICATOR_SERVER_BASE_DOMAIN+',DC='+process.env.USER_AUTHENTICATOR_SERVER_END_DOMAIN;
    let adminUsername = process.env.USER_AUTHENTICATOR_SERVER_ADMIN+'@'+process.env.USER_AUTHENTICATOR_SERVER_BASE_DOMAIN+'.'+process.env.USER_AUTHENTICATOR_SERVER_END_DOMAIN;
    const activeDir = new ActiveDirectory({
        url: process.env.USER_AUTHENTICATOR_SERVER_IP,
        baseDN: baseDN, // Your domain's base distinguished name
        username: adminUsername, // An AD user with permissions to query the directory
        password: process.env.USER_AUTHENTICATOR_SERVER_ADMIN_PASSWORD       // Password of the AD user
    });
    return activeDir;
}

async function authenticateServerUser(username, password) {
    try{
        let currentUserName = username+'@'+process.env.USER_AUTHENTICATOR_SERVER_BASE_DOMAIN+'.'+process.env.USER_AUTHENTICATOR_SERVER_END_DOMAIN;
        const activeDir = activeDirActivation();
        return new Promise((resolve, reject) => {
            activeDir.authenticate(currentUserName, password, (err, auth) => {
                if (err) {
                    if (err.name === 'InvalidCredentialsError') { 
                        reject({ code: 401, status: 'Error', message: `Authentication Error: Invalid Credentials` }); }
                    else{ reject({ code: 401, status: 'Error', message: `Authentication Error: ${err.message}` }); }
                } else if (auth) {
                    resolve({ code: 200, status: 'Successful', message: 'Authenticated!' });
                } else {
                    reject({ code: 401, status: 'Error', message: 'Authentication failed!' });
                }
            });
        });
    }
    catch (error) {
        return { code: 500, status: 'Error', message: 'Interner Serverfehler'};
    }
}

module.exports = {
    authenticateServerUser
};