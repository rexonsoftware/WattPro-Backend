const db = require("../models/ApplyRelation");
const Model = require('../models/ApplyRelation').ElementTemplateModel;
const { ElementDTO } = require('../dtos/element.dto');
const {Sequelize, QueryTypes} = require('sequelize');
const { validationResult } = require('express-validator');
const Op = Sequelize.Op;

async function getselectedTemplateElement(req, res) {
    const { id = '', search = '', page = 1, limit = 50 } = req.query;  //Default to page 1 and 20 records per page
    
    try {
        if (id == "") return res.status(400).json({ code: 400, status: 'Validation Error', message: "Baugruppe Id ist erforderlich" });
        let offset = (page - 1) * limit;
        const data = await db.sequelize.query('CALL getSelectedMachineTemplateElementsV2(:machine_id,:search, :p_limit, :p_offset)', {
            replacements: {
                machine_id: id,
                search: search,
                p_limit: limit,
                p_offset: offset,
            },
            type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
        });
        const recordList = data.map(newdata => new ElementDTO(newdata));
        var totalCount = 0;
        var tableName = "Baugurppe Template Selected Bauelements";
        if (data.length > 0) totalCount = data[0].Count;
        res.status(200).json({
            code: 200, status: 'Successful',
            message: 'Record extracted successfully',
            NumberOfRecords: totalCount, tableName: tableName, recordList: recordList,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ code: 500, status: 'Error', message: 'Interner Serverfehler.' });
    }
}

  const addTemplateElement = async (req, res, next) => {
    const { bauelement, baugruppe_template_id} = req.body;
    const user = req.user;    // req.user;
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({code: 400, status: 'Validation Error', message: errors.array() });
    try {
        data = await db.sequelize.query('CALL assignBauelementToTemplateBaugruppe(:bauelement,:baugruppe_template_id,:userId)', {
            replacements: {
                bauelement: bauelement,
                baugruppe_template_id: baugruppe_template_id,
                userId: user.ID,
            },
            type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
        });
        res.status(201).json({code: 201, status:'Successful', message: 'Template Bauelement has been created successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({code: 500, status:'Error', message: 'Interner Serverfehler.' });
    }
  };
  
  const updateTemplateElement = async (req, res, next) => {
    const { id, bauelement} = req.body;
    const user = req.user;    // req.user;
    if (id == "" || id === undefined) {
      return res.status(400).json({code: 400, status: 'Validation Error', message: "Bauelement Nr ist erforderlich" });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({code: 400, status: 'Validation Error', message: errors.array() });
    }
    try {
      const elementc = await Model.findByPk(id);
      if (!elementc) return res.status(404).json({code: 404, status:'Error', message: 'Template Bauelement not found'  });
      elementc.bauelement = bauelement;
      elementc.updatedBy = user.ID;
      const elementdata  = await elementc.save();
      res.status(201).json({code: 201, status:'Successful', message: 'Template Bauelement has been updated successfully' });
      } catch (error) {
      console.log(error);
        res.status(500).json({code: 500, status:'Error', message: 'Interner Serverfehler.' });
    }
  };
  
  const deleteTemplateElement = async (req, res, next) => {
    const { id } = req.query;  //Get Id
    const user = req.user;    // req.user;
    if (id == "" || id === undefined) return res.status(400).json({code: 400, status: 'Validation Error', message: "Bauelement Nr ist erforderlich" });
    try {
      const elementc = await Model.findByPk(id);
      if (!elementc) return res.status(404).json({code: 404, status:'Error', message: 'Template Bauelement not found'  });
      elementc.deletedBy = user.ID;
      const elementdata  = await elementc.destroy();
      res.status(201).json({code: 201, status:'Successful', message: 'Template Bauelement deleted successfully' });
    } catch (error) {
        //console.log(error);
        res.status(500).json({code: 500, status:'Error', message: 'Interner Serverfehler.' });
    }
  };


module.exports = {
    getselectedTemplateElement,addTemplateElement,updateTemplateElement,deleteTemplateElement
};
  
//