const db = require("../models/ApplyRelation");
const {RepairingTaskModel,RepairingContractModel} = db;
const { RepairingTaskViewDTO, RepairingTaskDTO } = require ('../dtos/repairing_contract');
const { validationResult } = require('express-validator');
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

async function getRepairingTasks(req, res){
  const { id = '', search = '', page = 1, limit = 50, records = ''} = req.query;  //Get Id
    try{
      if (id == "") return res.status(400).json({code: 400, status: 'Validation Error', message: "Repairing Contract Nr ist erforderlich" });
      const offset = (page - 1) * limit;
      const data = await db.sequelize.query('CALL getRepairingTasks(:repairingcontractid, :search, :records, :p_limit, :p_offset)', {
          replacements: {
            repairingcontractid: id,
            search: search,
            records: records,
            p_limit: limit,
            p_offset: offset
          },
          type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
      });
      var totalCount = 0;
      var tableName = "";
      var recordList = [];
      var kunden = [];
      if(data.length>0){
        recordList = data.map(newdata => new RepairingTaskDTO(newdata) );
        totalCount = data[0].Count;
        tableName = "Repairing Tasks";
      }
      res.status(200).json({code: 200, status:'Successful', message: 'Record extracted successfully', 
      NumberOfRecords: totalCount, tableName: tableName, recordList:recordList});
    } catch (error) 
    {
        res.status(500).json({ code: 500, status:'Error', message: 'Interner Serverfehler.'  });
    }
}

const getRepairingTaskById = async (req, res, next) => {
    const { id } = req.query;
    try {
      if (id == "" || id === undefined) {
        return res.status(400).json({code: 400, status: 'Validation Error', message: "Repairing Task Id ist erforderlich" });
      }
      const data = await RepairingTaskModel.findByPk(id);
      if (!data) return res.status(404).json({code: 404, status:'Error', message: 'Baugruppe not found'  });
      
      const recordList = new RepairingTaskViewDTO(data.dataValues);
      var tableName = "Repairing task details";
      res.status(200).json({
        code: 200, status: 'Successful', message: 'Record extracted successfully',
        tableName:tableName, records: recordList
      });
    } catch (error) {
      // console.log(error);
      res.status(500).json({ code: 500, status:'Error', message: 'Interner Serverfehler.' });
    }
}

async function addRepairingTasksGeneric(task, user) {
  try {
    const repairContract = await RepairingContractModel.findOne({
      where: {
        id: task.repairing_contract_id
      }
    });
    if (!repairContract) return {code: 400, status:'Error', message: 'Der Reparaturvertrag besteht nicht.'  };
    
    let datum = task.datum;
    let datumFormat=null;
    if (datum.includes('.')) {
          let [day, month, year] = datum.split('.');
          datumFormat = new Date(`${year}-${month}-${day}`);
    }else{
          datumFormat = datum; 
    }
    const newContract = await RepairingTaskModel.create({
      repairing_contract_id: task.repairing_contract_id,
      aufgabeposition: task.aufgabeposition,
      bezeichnung: task.bezeichnung,
      datum: datumFormat,
      material: task.material,
      user_id: task.sachkundiger_id,
      clock_start: task.clock_start,
      clock_end: task.clock_end,
      baugruppe_inst_id: task.baugruppe_inst_id,
      bauelement_id: task.bauelement_id,
      bemerkung: task.bemerkung,
      tatigkeit_als: task.tatigkeit_als,
      status: task.status,
      createdBy: user.ID
    });
    return {code: 201, status:'Successful', message: 'Repairing task has been created successfully' };
  } catch (error) {
      // console.log(error);
      return {code: 500, status:'Error', message: 'Interner Serverfehler.' };
  }
};

const addRepairingTasks = async (req, res, next) => {
  const { repairing_contract_id, aufgabeposition = null, bezeichnung = null, datum, material = null
    , sachkundiger_id = null, clock_start = null, clock_end = null, baugruppe_inst_id = null,
    bauelement_id = null,bemerkung = null,tatigkeit_als = null, status = 2} = req.body;
  const user = { ID : 1 };    // req.user;
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({code: 400, status: 'Validation Error', message: errors.array() });
  try {
    const task = {
      repairing_contract_id: repairing_contract_id,
      aufgabeposition: aufgabeposition,
      bemerkung: bemerkung,
      bezeichnung: bezeichnung,
      sachkundiger_id: sachkundiger_id,
      material: material,
      baugruppe_inst_id: baugruppe_inst_id,
      bauelement_id: bauelement_id,
      tatigkeit_als: tatigkeit_als,
      clock_start: clock_start,
      clock_end: clock_end,
      status: status,
      datum: datum,
    };
    let repairTask = await addRepairingTasksGeneric(task, user);
    if (repairTask.code!=201) return res.status(repairTask.code).json({code: repairTask.code, status:repairTask.status, message: repairTask.message  });
    res.status(201).json({code: 201, status:'Successful', message: 'Repairing Task has been added successfully' });
  } catch (error) {
    // console.log(error);
      res.status(500).json({code: 500, status:'Error', message: 'Interner Serverfehler.' });
  }
};

async function updateRepairingTasksGeneric(task, user) {
  try {
      const repairTask = await RepairingTaskModel.findByPk(task.repairing_task_id);
      if (!repairTask) return {code: 404, status:'Error', message: 'Repairing task not found'  };
      if(task.aufgabeposition !== undefined && task.aufgabeposition !== null && task.aufgabeposition != "") repairTask.aufgabeposition = task.aufgabeposition; 
      if(task.bemerkung !== undefined && task.bemerkung !== null &&  task.bemerkung != "") repairTask.bemerkung = task.bemerkung; 
      if(task.bezeichnung !== undefined && task.bezeichnung !== null &&  task.bezeichnung != "") repairTask.bezeichnung = task.bezeichnung; 
      if(task.sachkundiger_id !== undefined && task.sachkundiger_id !== null &&  task.sachkundiger_id != "") repairTask.user_id = task.sachkundiger_id; 
      if(task.material !== undefined && task.material !== null &&  task.material != "") repairTask.material =task. material; 
      if(task.baugruppe_inst_id !== undefined && task.baugruppe_inst_id !== null &&  task.baugruppe_inst_id != "") repairTask.baugruppe_inst_id = task.baugruppe_inst_id; 
      if(task.bauelement_id !== undefined && task.bauelement_id !== null &&  task.bauelement_id != "") repairTask.bauelement_id = task.bauelement_id; 
      if(task.tatigkeit_als !== undefined && task.tatigkeit_als !== null &&  task.tatigkeit_als != "") repairTask.tatigkeit_als = task.tatigkeit_als; 
      if(task.clock_start !== undefined && task.clock_start !== null &&  task.clock_start != "") repairTask.clock_start = task.clock_start; 
      if(task.clock_end !== undefined && task.clock_end !== null &&  task.clock_end != "") repairTask.clock_end = task.clock_end; 
      if(task.status !== undefined && task.status !== null &&  task.status != "") repairTask.status = task.status; 
      if(task.datum !== undefined && task.datum !== null &&  task.datum != ""){ 
        let datum = task.datum;
          if (datum.includes('.')) {
              let [day, month, year] = datum.split('.');
              let war_date = new Date(`${year}-${month}-${day}`);
              repairTask.datum = war_date; 
          }else{
              repairTask.datum = datum; 
          }
      }
      repairTask.updatedBy = user.ID;
      const repairContractdata  = await repairTask.save();
      return {code: 201, status:'Successful', message: 'Repairing Task has been updated successfully' };
  } catch (error) {
      // console.log(error);
      return {code: 500, status:'Error', message: 'Interner Serverfehler.' };
  }
};

const updateRepairingTasks = async (req, res, next) => {
    const { repairing_task_id, aufgabeposition = '', bezeichnung = '', datum = '', material = ''
        , sachkundiger_id = '', clock_start = '', clock_end = '', baugruppe_inst_id = '',
        bauelement_id = '',bemerkung = '',tatigkeit_als = '', status = ''} = req.body;
      
    const user = { ID : 1 };    // req.user;
    if (repairing_task_id == "" || repairing_task_id === undefined) return res.status(400).json({code: 400, status: 'Validation Error', message: "Repairing Task Nr ist erforderlich" });
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({code: 400, status: 'Validation Error', message: errors.array() });
    try {
        const task = {
          repairing_task_id: repairing_task_id,
          aufgabeposition: aufgabeposition,
          bemerkung: bemerkung,
          bezeichnung: bezeichnung,
          sachkundiger_id: sachkundiger_id,
          material: material,
          baugruppe_inst_id: baugruppe_inst_id,
          bauelement_id: bauelement_id,
          tatigkeit_als: tatigkeit_als,
          clock_start: clock_start,
          clock_end: clock_end,
          status: status,
          datum: datum,
        };
        let repairTask = await updateRepairingTasksGeneric(task, user);
        if (repairTask.code!=201) return res.status(repairTask.code).json({code: repairTask.code, status:repairTask.status, message: repairTask.message  });
        res.status(201).json({code: 201, status:'Successful', message: 'Repairing Task has been updated successfully' });
    } catch (error) {
        // console.log(error);
        res.status(500).json({code: 500, status:'Error', message: 'Interner Serverfehler.' });
    }
};

async function deleteRepairingTasksGeneric(taskId, user) {
  try {
    const repairTask = await RepairingTaskModel.findByPk(taskId);
    if (!repairTask) return {code: 404, status:'Error', message: 'Repairing Task not found'  };
    repairTask.deletedBy = user.ID;
    const repairContractdata  = await repairTask.destroy();
    return {code: 200, status:'Successful', message: 'Repairing Task deleted successfully' };
  } catch (error) {
      // console.log(error);
      return {code: 500, status:'Error', message: 'Interner Serverfehler.' };
  }
};

const deleteRepairingTasks = async (req, res, next) => {
  const { id } = req.query;  //Get Id
  const user = req.user;    // req.user;
  if (id == "" || id === undefined) return res.status(400).json({code: 400, status: 'Validation Error', message: "Reparing Task Nr ist erforderlich" });
  try {
    let repairTask = await deleteRepairingTasksGeneric(id, user);
    if (repairTask.code!=200) return res.status(repairTask.code).json({code: repairTask.code, status:repairTask.status, message: repairTask.message  });
    res.status(200).json({code: 200, status:'Successful', message: 'Repairing Task deleted successfully' });
  } catch (error) {
      res.status(500).json({code: 500, status:'Error', message: 'Interner Serverfehler.' });
  }
};

async function updateBulkRepairingTasks(req, res, next) {
  var obj = req.body;
  const user = req.user;    // req.user;
  if (!obj.data) return res.status(400).json({code: 400, status: 'Validation Error', message: "Data ist erforderlich" });
  try { 
    let dt = JSON.parse(obj.data); 
    if (dt.length <= 0) return res.status(400).json({code: 400, status: 'Validation Error', message: "Data ist erforderlich" });
    for (const tasks of dt) {
      if ((tasks.action == 1)) {
        let repairTask = await addRepairingTasksGeneric(tasks, user);
        if (repairTask.code!=201) return res.status(repairTask.code).json({code: repairTask.code, status:repairTask.status, message: repairTask.message  });
      }
      else if ((tasks.action == 2)) {
        let repairTask = await updateRepairingTasksGeneric(tasks, user);
        if (repairTask.code!=201) return res.status(repairTask.code).json({code: repairTask.code, status:repairTask.status, message: repairTask.message  });
      }
      else if ((tasks.action == 3)) {
        let repairTask = await deleteRepairingTasksGeneric(tasks.repairing_task_id, user);
        if (repairTask.code!=200) return res.status(repairTask.code).json({code: repairTask.code, status:repairTask.status, message: repairTask.message  });
      }
      else{
        return res.status(500).json({code: 500, status:'Error', message: 'Action not define'});
      }
    }
    res.status(201).json({code: 201, status:'Successful', message: 'Repairing task data has been updated successfully'});
  } catch (error) 
  {
      res.status(500).json({code: 500, status:'Error', message: 'Interner Serverfehler.', error:error});
  }
}

module.exports = {
    getRepairingTasks, addRepairingTasks, deleteRepairingTasks, updateRepairingTasks, getRepairingTaskById, updateBulkRepairingTasks
};
  
 