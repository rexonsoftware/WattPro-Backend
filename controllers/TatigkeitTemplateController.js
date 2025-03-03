const db = require("../models/ApplyRelation");
const Model = require('../models/ApplyRelation').TatigkeitTemplateModel;
const { TatigkeitTemplateDTO } = require('../dtos/element.dto');
const {Sequelize, QueryTypes} = require('sequelize');
const { validationResult } = require('express-validator');
const Op = Sequelize.Op;

async function getselectedTemplateTatigkiet(req, res) {
    const { baugruppe_template_id = '', bauelement_template_id = '', search = '', page = 1, limit = 50 } = req.query;  //Default to page 1 and 20 records per page
    try {
        if (baugruppe_template_id == "") return res.status(400).json({ code: 400, status: 'Validation Error', message: "Baugruppe Template Id ist erforderlich" });
        if (bauelement_template_id == "") return res.status(400).json({ code: 400, status: 'Validation Error', message: "Bauelement Template Id ist erforderlich" });
        let offset = (page - 1) * limit;
        const data = await db.sequelize.query('CALL getSelectedTatigkeitTemplateV2(:machine_id,:element_id,:search, :p_limit, :p_offset)', {
            replacements: {
                machine_id: baugruppe_template_id,
                element_id: bauelement_template_id,
                search: search,
                p_limit: limit,
                p_offset: offset,
            },
            type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
        });
        const recordList = data.map(newdata => new TatigkeitTemplateDTO(newdata));
        var totalCount = 0;
        var tableName = "Baugurppe & Bauelement Template Selected Tatigkeit";
        if (data.length > 0) totalCount = data[0].Count;
        res.status(200).json({
            code: 200, status: 'Successful',
            message: 'Record extracted successfully',
            NumberOfRecords: totalCount, tableName: tableName, recordList: recordList,
        });
    } catch (error) {
        res.status(500).json({ code: 500, status: 'Error', message: 'Interner Serverfehler.' });
    }
}

const addTemplateTatigkiet = async (req, res, next) => {
  const { tatigkeit, baugruppe_template_id, bauelement_template_id} = req.body;
  const user = req.user;    // req.user;
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({code: 400, status: 'Validation Error', message: errors.array() });
  try {
      const obj = await Model.findOne({ 
        where: { 
          baugruppe_id: baugruppe_template_id,
          bauelement_id:bauelement_template_id,
          tatigkeit:null,
          deletedAt:null,  
        } 
      });
      if (obj) {
        console.log("here");
        obj.tatigkeit = tatigkeit;
        obj.updatedBy = user.ID;
        const tatigkeitdata  = await obj.save();
      }else{
        const newObject = await Model.create({
          baugruppe_id: baugruppe_template_id,
          bauelement_id: bauelement_template_id,
          tatigkeit: tatigkeit,
          createdBy: user.ID
        });
      }
      res.status(201).json({code: 201, status:'Successful', message: 'Template tatigkeit has been created successfully' });
  } catch (error) {
      res.status(500).json({code: 500, status:'Error', message: 'Interner Serverfehler.' });
  }
};
  
  const updateTemplateTatigkiet = async (req, res, next) => {
    const { id, tatigkeit} = req.body;
    const user = req.user;    // req.user;
    if (id == "" || id === undefined) return res.status(400).json({code: 400, status: 'Validation Error', message: "Tatigkeit template id ist erforderlich" });
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({code: 400, status: 'Validation Error', message: errors.array() });
    try {
      const obj = await Model.findByPk(id);
      if (!obj) return res.status(404).json({code: 404, status:'Error', message: 'Tatigkeit Template not found'  });
      obj.tatigkeit = tatigkeit;
      obj.updatedBy = user.ID;
      const objdata  = await obj.save();
      res.status(201).json({code: 201, status:'Successful', message: 'Tatigkeit Template has been updated successfully' });
    } catch (error) {
      res.status(500).json({code: 500, status:'Error', message: 'Interner Serverfehler.' });
    }
  };
  
  const deleteTemplateTatigkiet = async (req, res, next) => {
    const { id } = req.query;  //Get Id
    const user = req.user;    // req.user;
    if (id == "" || id === undefined) return res.status(400).json({code: 400, status: 'Validation Error', message: "Tatigkeit template id ist erforderlich" });
    try {
      const obj = await Model.findByPk(id);
      if (!obj) return res.status(404).json({code: 404, status:'Error', message: 'Tatigkeit Template not found'  });
      obj.deletedBy = user.ID;
      const objdata  = await obj.destroy();
      res.status(201).json({code: 201, status:'Successful', message: 'Tatigkeit Template deleted successfully' });
      } catch (error) {
        res.status(500).json({code: 500, status:'Error', message: 'Interner Serverfehler.' });
    }
  };

module.exports = {
  getselectedTemplateTatigkiet,addTemplateTatigkiet,updateTemplateTatigkiet,deleteTemplateTatigkiet
};
