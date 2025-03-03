const Model = require('../models/ApplyRelation').BaugruppeTemplateModel;
const { Sequelize, QueryTypes } = require('sequelize');
const { MachineDTO ,Baugruppelist } = require('../dtos/machinedto');

const { validationResult } = require('express-validator');
const Op = Sequelize.Op;

async function getMachinesTemplate(req, res) {
  try {
    const { search = '', page = 1, limit = 50 } = req.query;  //Default to page 1 and 20 records per page
    const offset = (page - 1) * limit;
    let whereCondition = {};
    if (search != '') {
      whereCondition = {
        baugruppe: {
          [Op.like]: `${search}%`,
        },
      };
    }
    const data = await Model.findAndCountAll({
      where: whereCondition,
      order: [['baugruppe', 'ASC']],
    });
    const recordList = data.rows.map(newdata => new Baugruppelist(newdata,true));
    var totalCount = 0;
    var tableName = "Baugruppe Template List";
    if(data.rows.length>0){
      totalCount = data.count;
    }
    res.status(200).json({
      code: 200, status: 'Successful', message: 'Record extracted successfully',
      NumberOfRecords: totalCount, PageNumber: page, tableName:tableName, recordList: recordList
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, status:'Error', message: 'Interner Serverfehler.' });
  }
}

const getMachinesTemplateById = async (req, res, next) => {
    const { id } = req.query;
    try {
      if (id == "" || id === undefined) {
        return res.status(400).json({code: 400, status: 'Validation Error', message: "Baugruppe Id ist erforderlich" });
      }
      const data = await Model.findByPk(id);
      if (!data) {
        return res.status(404).json({code: 404, status:'Error', message: 'Baugruppe Template not found'  });
      }

      const recordList = new MachineDTO(data.dataValues);
      var tableName = data.baugruppe;
      res.status(200).json({
        code: 200, status: 'Successful', message: 'Record extracted successfully',
        tableName:tableName, records: recordList
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ code: 500, status:'Error', message: 'Interner Serverfehler.' });
    }
}

const addMachinesTemplate = async (req, res, next) => {
  const { bgnr = null, baugruppe} = req.body;
  const user = req.user;    // req.user;
  // Validate input using the imported validateRoles array
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({code: 400, status: 'Validation Error', message: errors.array() });
  try {
      const newObject = await Model.create({
        baugruppe: baugruppe,
        bgnr: bgnr,
        createdBy: user.ID
      });
      res.status(201).json({code: 201, status:'Successful', message: 'Baugruppe template has been created successfully' });
  } catch (error) {
    console.log(error);
      res.status(500).json({code: 500, status:'Error', message: 'Interner Serverfehler.' });
  }
};

const updateMachinesTemplate = async (req, res, next) => {
  const { id, bgnr , baugruppe } = req.body;
  const user = req.user;    // req.user;
  if (id == "" || id === undefined) return res.status(400).json({code: 400, status: 'Validation Error', message: "Baugruppe Nr ist erforderlich" });
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({code: 400, status: 'Validation Error', message: errors.array() });
  try {
    const machinec = await Model.findByPk(id);
    if (!machinec) return res.status(404).json({code: 404, status:'Error', message: 'Objekt not found'  });
    machinec.bgnr = bgnr;
    machinec.baugruppe = baugruppe;
    machinec.updatedBy = user.ID;
    const installationdata  = await machinec.save();
    res.status(201).json({code: 201, status:'Successful', message: 'Baugruppe template has been updated successfully' });
  } catch (error) {
      res.status(500).json({code: 500, status:'Error', message: 'Interner Serverfehler.' });
  }
};

const deleteMachinesTemplate = async (req, res, next) => {
  const { id } = req.query;  //Get Id
  const user = req.user;    // req.user;
  if (id == "" || id === undefined) return res.status(400).json({code: 400, status: 'Validation Error', message: "Baugruppe Nr ist erforderlich" });
  try {
    const machinec = await Model.findByPk(id);
    if (!machinec) return res.status(404).json({code: 404, status:'Error', message: 'Baugruppe not found'  });
    machinec.deletedBy = user.ID;
    const machinedata  = await machinec.destroy();
    res.status(201).json({code: 201, status:'Successful', message: 'Baugruppe template deleted successfully' });
  } catch (error) {
    res.status(500).json({code: 500, status:'Error', message: 'Interner Serverfehler.' });
  }
};


module.exports = {
   getMachinesTemplate,
   addMachinesTemplate,
   updateMachinesTemplate,
   deleteMachinesTemplate,
   getMachinesTemplateById
};