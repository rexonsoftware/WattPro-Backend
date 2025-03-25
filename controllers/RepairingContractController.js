const db = require("../models/ApplyRelation");
const {InstallationModel,RepairingContractModel} = db;
const { RepairingContractDTO } = require ('../dtos/repairing_contract');
const { validationResult } = require('express-validator');
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

async function getRepairingContracts(req, res){
  const { id = ''} = req.query;  //Get Id
    try{
      if (id == "") {
        return res.status(400).json({code: 400, status: 'Validation Error', message: "Kunden Nr ist erforderlich" });
      }
      const data = await db.sequelize.query('CALL getRepairingContracts(:installationid)', {
          replacements: {
              installationid: id
          },
          type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
      });
      var totalCount = 0;
      var tableName = "";
      var recordList = [];
      var kunden = [];
      if(data.length>0){
        if(data[0].current_condition == 0){
          recordList = data.map(newdata => new RepairingContractDTO(newdata) );
          totalCount = data[0].Count;
        }
        tableName = "Wartungsaufträge für " + data[0].kunde;
        kunden = {
          id : data[0].kunden_id,
          project_nr: data[0].project_nr,
          kunde: data[0].kunde,
          contactperson: data[0].contactperson,
          address: data[0].address,
          email: data[0].email,
          tel: data[0].tel,
          bemerkungen: data[0].kunden_bemerkungen,
          directory_path: data[0].directory_path,
        }
      }
      res.status(200).json({code: 200, status:'Successful', message: 'Record extracted successfully', 
      NumberOfRecords: totalCount, tableName: tableName,kunden: kunden, recordList:recordList});
    } catch (error) 
    {
        console.log(error);
        res.status(500).json({ code: 500, status:'Error', message: 'Interner Serverfehler.'  });
    }
}

// const findReportByTypeAndContractId = async (reportType, contractId) => {
//   try {
//     const report = await db.ReportsModel.findOne({
//         where: {
//           report_type_id: reportType,
//           service_contract_id: contractId
        
//         }
//     });
//     if (report) {
//       return report.toJSON();
//     } else {
//       return false;
//     }
//   } catch (error) {
//     console.error('Error:', error);
//     throw error; // Re-throw the error to handle it further if needed
//   }
// };


const addRepairingContracts = async (req, res, next) => {
  const { installation_id, contract_id, bezeichnung = null, wartungsdatum, auftraggeber_name = null, bemerkung = null} = req.body;
  const user = { ID : 1 };    // req.user;
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({code: 400, status: 'Validation Error', message: errors.array() });
  try {
      const repairContract = await RepairingContractModel.findOne({
        where: {
          contract_id: contract_id
        }
      });
      if (repairContract) return res.status(400).json({code: 400, status:'Error', message: 'Die Vertragsnummer existiert bereits.'  });
      
      let datumFormat=null;
      if (wartungsdatum.includes('.')) {
            let [day, month, year] = wartungsdatum.split('.');
            datumFormat = new Date(`${year}-${month}-${day}`);
      }else{
            datumFormat = wartungsdatum; 
      }

      const newContract = await RepairingContractModel.create({
        installation_id: installation_id,
        contract_id: contract_id,
        bezeichnung: bezeichnung,
        datum: datumFormat,
        bemerkung: bemerkung,
        auftraggeber_name: auftraggeber_name,
        createdBy: user.ID
      });
      res.status(201).json({code: 201, status:'Successful', message: 'Repairing Contracts has been created successfully' });
  } catch (error) {
    console.log(error);
      res.status(500).json({code: 500, status:'Error', message: 'Interner Serverfehler.' });
  }
};



const updateRepairingContracts = async (req, res, next) => {
    const { id, contract_id = '', bezeichnung = '', wartungsdatum = '', auftraggeber_name = '', bemerkung = ''} = req.body;
    const user = { ID : 1 };    // req.user;
    // Validate input using the imported validateRoles array
    if (id == "" || id === undefined) return res.status(400).json({code: 400, status: 'Validation Error', message: "Repairing Contract Nr ist erforderlich" });
  
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({code: 400, status: 'Validation Error', message: errors.array() });
    try {
        const repairContract = await RepairingContractModel.findByPk(id);
        if (!repairContract) return res.status(404).json({code: 404, status:'Error', message: 'Repairing contract not found'  });
        if(contract_id != "") repairContract.contract_id = contract_id; 
        if(bemerkung != "") repairContract.bemerkung = bemerkung; 
        if(bezeichnung != "") repairContract.bezeichnung = bezeichnung; 
        if(auftraggeber_name != "") repairContract.auftraggeber_name = auftraggeber_name; 
        if(wartungsdatum != ""){ 
            if (wartungsdatum.includes('.')) {
                let [day, month, year] = wartungsdatum.split('.');
                let war_date = new Date(`${year}-${month}-${day}`);
                repairContract.datum = war_date; 
            }else{
                repairContract.datum = wartungsdatum; 
            }
        }
        repairContract.updatedBy = user.ID;
        const repairContractdata  = await repairContract.save();
        res.status(201).json({code: 201, status:'Successful', message: 'Repairing Contract has been updated successfully' });
        } catch (error) {
        console.log(error);
        res.status(500).json({code: 500, status:'Error', message: 'Interner Serverfehler.' });
    }
};

const deleteRepairingContracts = async (req, res, next) => {
  const { id } = req.query;  //Get Id
  const user = req.user;    // req.user;
  if (id == "" || id === undefined) {
    return res.status(400).json({code: 400, status: 'Validation Error', message: "Reparing Contract Nr ist erforderlich" });
  }
  try {
    const repairContract = await RepairingContractModel.findByPk(id);
    if (!repairContract) return res.status(404).json({code: 404, status:'Error', message: 'Repairing Contract not found'  });
    
    repairContract.deletedBy = user.ID;
    const repairContractdata  = await repairContract.destroy();
    res.status(201).json({code: 201, status:'Successful', message: 'Repairing Contract deleted successfully' });
    } catch (error) {
    console.log(error);
      res.status(500).json({code: 500, status:'Error', message: 'Interner Serverfehler.' });
  }
};

module.exports = {
    getRepairingContracts, addRepairingContracts, deleteRepairingContracts, updateRepairingContracts
};
  
 