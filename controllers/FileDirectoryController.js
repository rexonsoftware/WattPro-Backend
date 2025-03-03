const Model = require('../models/ApplyRelation').ElementModel;
const { DirectoryDTO } = require('../dtos/fileDirectory');
const {Sequelize, QueryTypes} = require('sequelize');
const { validationResult } = require('express-validator');
const Op = Sequelize.Op;
require('dotenv').config();
const SMB2 = require('smb2');
const mime = require('mime-types'); // To determine Content-Type dynamically

  function smbActivation(){
    const smb2Client = new SMB2({
      share: process.env.SHARED_STORAGE_URL,
      domain: process.env.SHARED_STORAGE_DOMAIN || '',
      username: process.env.SHARED_STORAGE_USERNAME,
      password: process.env.SHARED_STORAGE_PASSWORD
    });
    return smb2Client;
  }

  const accessDirectory = async (req, res, next) => {
    let { url = '' } = req.query;
    if (url === '') url = '/'; // or set to a base directory like '/SBS' if required
    console.log(url);
    const smb2Client = smbActivation();
    smb2Client.exists(url, function (err, exists) {
      if (err) return res.status(500).json({ code: 500, status: 'Error', message: err });
      if (!exists) return res.status(404).json({ code: 404, status: 'Error', message: 'File does not exist' });
      smb2Client.readdir(url, function(err, files){
        if(err) return res.status(500).json({ code: 500, status:'Error', message: err });
        const recordList = new DirectoryDTO(files);
        var tableName = "File Directory";
        res.status(200).json({
          code: 200, status: 'Successful', message: 'Record extracted successfully',
          tableName:tableName, records: recordList
        });
      });
    });
  };

  const accessFile = async (req, res, next) => {
    const { url = '' } = req.query;
    console.log(url);
    const smb2Client = smbActivation();
    smb2Client.exists(url, function (err, exists) {
      if (err) return res.status(500).json({ code: 500, status: 'Error', message: err });
      if (!exists) return res.status(404).json({ code: 404, status: 'Error', message: 'File does not exist' });
      
      smb2Client.readFile(url, function (err, fileContent) {
        if (err) return res.status(500).json({ code: 500, status: 'Error', message: err });
        const mimeType = mime.lookup(url) || 'application/octet-stream';
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Disposition', `inline; filename="${url.split('\\').pop()}"`);
        res.status(200).send(fileContent);
      });
    });
  };


module.exports = {
    accessDirectory,
    accessFile
};