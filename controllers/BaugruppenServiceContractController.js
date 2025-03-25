// const sequelize = require('../utils/database');
const db = require("../models/ApplyRelation");
const { BaugruppeServiceContractModel, MachineInstallationsModel, MachineModel} = db;
const {Sequelize, QueryTypes} = require('sequelize');
const { validationResult } = require('express-validator');
const Op = Sequelize.Op;

  const updatemachinecontractsbemerkungen = async (req, res, next) => {
    const { id = "", s_id = "",bgnr="", bemerkungen = "", hinweis_letzte_sv = "", baugruppen = ""} = req.body;
    const user = req.user;    // req.user;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({code: 400, status: 'Validation Error', message: errors.array() });
    }
    try {
      const result = await BaugruppeServiceContractModel.findOne({
        where: {
          baugruppe_installation_id: id,
          service_contract_id: s_id
        }
      });
      if (!result) return res.status(404).json({code: 404, status:'Error', message: 'Baugruppen not found'  });
      result.bemerkungen = bemerkungen;
      result.hinweis_letzte_sv = hinweis_letzte_sv;
      result.bgnr = bgnr;
      result.updatedBy = user.ID;

      const machineInstallationObj = await MachineInstallationsModel.findOne({ where: { id: id }});
      if (!machineInstallationObj) return res.status(404).json({code: 404, status:'Error', message: 'Baugruppen Installation not found'  });
      const machineObj = await MachineModel.findOne({ where: { id: machineInstallationObj.baugruppe_id }});
      if (!machineObj) return res.status(404).json({code: 404, status:'Error', message: 'Baugruppen not found'});
      machineObj.baugruppe = baugruppen;
      machineObj.updatedBy = user.ID;

      const data = await result.save();
      const data1= await machineObj.save();
      res.status(201).json({code: 201, status:'Successful', message: 'Kunden has been updated successfully' });
    }
    catch (error) {
      console.log(error);
      res.status(500).json({code: 500, status:'Error', message: 'Interner Serverfehler.' });
    }
  }

  async function updateBaugruppenBemerkungAgainstContract(req, res, next) {
    var obj = req.body;
    const user = req.user;    // req.user;
    if (!obj.data) {
      return res.status(400).json({code: 400, status: 'Validation Error', message: "Data ist erforderlich" });
    }
    try { 
      let dt = JSON.parse(obj.data); 
      if (dt.length <= 0) {
          return res.status(400).json({code: 400, status: 'Validation Error', message: "Data ist erforderlich" });
      }
      dt.forEach(async baugruppen => {
        if ((baugruppen.id == "" || baugruppen.id === undefined) 
            && (baugruppen.s_id == "" || baugruppen.s_id === undefined) 
            && (baugruppen.bemerkungen == "" || baugruppen.bemerkungen === undefined)) 
        {
          
        }else{
            let result = await BaugruppeServiceContractModel.findOne({
                where: {
                  baugruppe_installation_id: baugruppen.id,
                  service_contract_id: baugruppen.s_id
                }
              });
              if (!result) return res.status(404).json({code: 404, status:'Error', message: 'Baugruppen not found'  });
              result.bemerkungen = baugruppen.bemerkungen;
              if (baugruppen.bgnr == "" || baugruppen.bgnr === undefined){}
              else{
                result.bgnr = baugruppen.bgnr;
              }
              let data = await result.save();
        }
      });
      res.status(201).json({code: 201, status:'Successful', message: 'Bemerkung has been updated successfully'});
    } catch (error) 
    {
        res.status(500).json({code: 500, status:'Error', message: 'Interner Serverfehler.', error:error});
    }
  }


module.exports = {
  updatemachinecontractsbemerkungen,
  updateBaugruppenBemerkungAgainstContract
};
  
 