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

  const authenticateServerUser  = async (req, res, next) => {
    const userPrincipalName = `Ehtisham`;
    const password = "abc@123";
    let currentUserName = userPrincipalName+'@'+process.env.USER_AUTHENTICATOR_SERVER_BASE_DOMAIN+'.'+process.env.USER_AUTHENTICATOR_SERVER_END_DOMAIN;
    
    console.log(userPrincipalName);
    // let { url = '' } = req.query;
    // if (url === '') url = '/'; 
    const activeDir = activeDirActivation();
    activeDir.authenticate(currentUserName, password, (err, auth) => {
        if (err) {
            console.error('Authentication Error:', err);
            // return reject('Authentication failed');
        }

        if (auth) {
            console.log('Authenticated!');
            console.log(auth);
            // return resolve('User authenticated successfully');
        } else {
            console.log('Authentication failed!');
            // return reject('Invalid username or password');
        }
    });
  };
    
module.exports = {
    authenticateServerUser
};