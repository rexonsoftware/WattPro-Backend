const db = require("../models/ApplyRelation");
const { MachineELementModel } = db;
const { ElementModel } = db;
const { ElementDTO, MachineELementDTO, MachineELementOfflineDTO, TatigkeitDTO } = require('../dtos/element.dto');
const { MachineInstallationDTO } = require('../dtos/machinedto');
const { validationResult } = require('express-validator');
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

async function getMachineElements(req, res) {
    const { id = '', s_id = null, search = '', page = 1, limit = 50 } = req.query;  //Default to page 1 and 20 records per page
    try {
        if (id == "") {
            return res.status(400).json({ code: 400, status: 'Validation Error', message: "Baugruppe Id ist erforderlich" });
        }

        const offset = (page - 1) * limit;
        const data = await db.sequelize.query('CALL getMachineElements(:machine_id, :servicecontract_id, :search, :p_limit, :p_offset)', {
            replacements: {
                machine_id: id,
                servicecontract_id: s_id,
                search: search,
                p_limit: limit,
                p_offset: offset,
            },
            type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
        });
        // const mappedData = data.rows; // Access the rows property to get the array of results
        const recordList = data.map(newdata => new MachineELementDTO(newdata));
        var totalCount = 0;
        var tableName = "";
        if (data.length > 0) {
            totalCount = data[0].Count;
            tableName = data[0].baugruppe;
        }
        res.status(200).json({
            code: 200, status: 'Successful',
            message: 'Record extracted successfully',
            NumberOfRecords: totalCount, PageNumber: page, tableName: tableName, recordList: recordList,
        });
    } catch (error) {
        
        res.status(500).json({ code: 500, status: 'Error', message: 'Interner Serverfehler.' });
    }
}

async function getBaugruppeMachineElements(req, res) {
    var page = 1;
    const { id = '', s_id = '' } = req.query;  //Default to page 1 and 20 records per page
    try {
        if (id == "") {
            return res.status(400).json({ code: 400, status: 'Validation Error', message: "Kunden Nr ist erforderlich" });
        }
        if (s_id == "") {
            return res.status(400).json({ code: 400, status: 'Validation Error', message: "Service Contract Nr ist erforderlich" });
        }
        const data = await db.sequelize.query('CALL getBaugruppe_MachineElements(:installation_id, :servicecontract_id)', {
            replacements: {
                installation_id: id,
                servicecontract_id: s_id,
            },
            type: Sequelize.QueryTypes.SELECT, // Set the query type to RAW
        });

        var tableName = "Baugruppe Bauelements";
        var arrayOfValues = Object.values(data[0]);
        const recordList = arrayOfValues.map(newdata => new MachineInstallationDTO(newdata));
        var totalCount = 0;
        if (arrayOfValues.length > 0) {
            totalCount = arrayOfValues[0].Count;
        }
        var arrayOfValues = Object.values(data[1]);
        const recordList1 = arrayOfValues.map(newdata => new MachineELementOfflineDTO(newdata));
        var totalCount1 = 0;
        if (arrayOfValues.length > 0) {
            totalCount1 = arrayOfValues[0].Count;
        }
        const myObject = {
            baugruppe: {
                NumberOfRecords: totalCount,
                recordList: recordList
            },
            bauelement: {
                NumberOfRecords: totalCount1,
                recordList: recordList1
            },
        };
        res.status(200).json({
            code: 200, status: 'Successful',
            message: 'Record extracted successfully', tableName: tableName, grouplist: myObject,
        });
    } catch (error) {
        res.status(500).json({ code: 500, status: 'Error', message: 'Interner Serverfehler.' });
    }
}

const updateMachineElement = async (req, res, next) => {


    const { id } = req.params;  //Get Id
    const { bauelement ,tatigkeit, bemerkung, sort_by, interne_bemerkungen } = req.body;
    const user = req.user;

    if (id == "" || id === undefined) 
        return res.status(400).json({ code: 400, status: 'Validation Error', message: "Record Nr ist erforderlich" });
    const errors = validationResult(req);
    if (!errors.isEmpty()) 
        return res.status(400).json({ code: 400, status: 'Validation Error', message: errors.array() });
    try {
        const machineelementc = await MachineELementModel.findByPk(id);
        if (!machineelementc) 
            return res.status(404).json({ code: 404, status: 'Error', message: 'Record not found' });
        if (tatigkeit == "" || tatigkeit === undefined) { } else { machineelementc.tatigkeit = tatigkeit; }
        if (interne_bemerkungen == "" || interne_bemerkungen === undefined) { } else { machineelementc.interne_bemerkungen = interne_bemerkungen; }
        machineelementc.prev_bemerkung_val = machineelementc.bemerkung;
        machineelementc.bemerkung = bemerkung;
        machineelementc.updatedBy = user.ID;
        machineelementc.sort_by = sort_by || id;
        const machineelementdata = await machineelementc.save();
        if (bauelement == "" || bauelement === undefined) { } 
        else { 
            const elementc = await ElementModel.findByPk(machineelementc.bauelement_id);
            if (!elementc) 
                return res.status(404).json({code: 404, status:'Error', message: 'Bauelement not found'  });
            if(elementc.bauelement != bauelement){
                elementc.bauelement = bauelement;
                elementc.updatedBy = user.ID;
                const elementdata  = await elementc.save();
            }
        }
        res.status(201).json({ code: 201, status: 'Successful', message: 'Record has been updated successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ code: 500, status: 'Error', message: 'Interner Serverfehler.' });
    }
};

const revertMachineElement = async (req, res, next) => {
    const { id } = req.params;  //Get Id
    const user = req.user;    // req.user;
    if (id == "" || id === undefined) {
        return res.status(400).json({ code: 400, status: 'Validation Error', message: "Record Nr ist erforderlich" });
    }
    try {
        const machineelementc = await MachineELementModel.findByPk(id);
        if (!machineelementc) {
            return res.status(404).json({ code: 404, status: 'Error', message: 'Record not found' });
        }
        let data = await db.sequelize.query('CALL revert_BauelementStatus(:reportid, :userId)', {
            replacements: {
                reportid: id,
                userId: user.ID,
            },
            type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
        });
        res.status(201).json({ code: 201, status: 'Successful', message: 'Record has been updated successfully' });
    } catch (error) {
        res.status(500).json({ code: 500, status: 'Error', message: 'Interner Serverfehler.' });
    }
};

const updateAllMachineElement = async (req, res, next) => {
    var obj = req.body;
    const user = req.user;    // req.user;
    if (!obj.data) {
        return res.status(400).json({ code: 400, status: 'Validation Error', message: "Records ist erforderlich" });
    }
    try {
        let dt = JSON.parse(obj.data);
        if (dt.length <= 0) {
            return res.status(400).json({ code: 400, status: 'Validation Error', message: "Records ist erforderlich" });
        }
        await Promise.all(
            dt.map(element => 
                db.sequelize.query('CALL update_Bulk_BauelementStatus(:reportid,:bemerkung_status,:sort_by,:tatigkeit_value,:userId)', {
                    replacements: {
                        reportid: element.be_nr,
                        bemerkung_status: element.bemerkung,
                        sort_by: element.sort_by,
                        tatigkeit_value: element.tatigkeit,
                        userId: user.ID,
                    },
                    type: Sequelize.QueryTypes.RAW,
                })
            )
        );
        res.status(201).json({ code: 201, status: 'Successful', message: 'Record has been updated successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ code: 500, status: 'Error', message: 'Interner Serverfehler.' });
    }
};

const revertAllMachineElement = async (req, res, next) => {
    console.log("a");
    var obj = req.body;
    const user = req.user;    // req.user;
    if (!obj.data) {
        return res.status(400).json({ code: 400, status: 'Validation Error', message: "Records ist erforderlich" });
    }
    try {
        let dt = JSON.parse(obj.data);
        if (dt.length <= 0) {
            return res.status(400).json({ code: 400, status: 'Validation Error', message: "Records ist erforderlich" });
        }
        let data;
        dt.forEach(async element => {
            let data = await db.sequelize.query('CALL revert_BauelementStatus(:reportid, :userId)', {
                replacements: {
                    reportid: element.be_nr,
                    userId: user.ID,
                },
                type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
            });
        });
        res.status(201).json({ code: 201, status: 'Successful', message: 'Record has been updated successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ code: 500, status: 'Error', message: 'Interner Serverfehler.' });
    }
};

async function getAssignedBauelementBaugruppe(req, res) {
    const { id = '', search = '' } = req.query;  //Default to page 1 and 20 records per page
    try {
        if (id == "") {
            return res.status(400).json({ code: 400, status: 'Validation Error', message: "Baugruppe Id ist erforderlich" });
        }
        const data = await db.sequelize.query('CALL getAssignedMachineElements(:machine_id, :search)', {
            replacements: {
                machine_id: id,
                search: search,
            },
            type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
        });
        const recordList = data.map(newdata => new ElementDTO(newdata));
        var totalCount = 0;
        var tableName = "Assigned Bauelements";
        if (data.length > 0) {
            // totalCount = data[0].Count;
            totalCount = data.length;
        }
        res.status(200).json({
            code: 200, status: 'Successful',
            message: 'Record extracted successfully',
            NumberOfRecords: totalCount, tableName: tableName, recordList: recordList,
        });
    } catch (error) {
       
        res.status(500).json({ code: 500, status: 'Error', message: 'Interner Serverfehler.' });
    }
}

async function getUnAssignedBauelementBaugruppe(req, res) {
    const { id = '', search = '' } = req.query;  //Default to page 1 and 20 records per page
    try {
        if (id == "") {
            return res.status(400).json({ code: 400, status: 'Validation Error', message: "Baugruppe Id ist erforderlich" });
        }
        const data = await db.sequelize.query('CALL getUnAssignedMachineElements(:machine_id, :search)', {
            replacements: {
                machine_id: id,
                search: search,
            },
            type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
        });
        const recordList = data.map(newdata => new ElementDTO(newdata));
        var totalCount = 0;
        var tableName = "Unassigned Bauelements";
        if (data.length > 0) {
            // totalCount = data[0].Count;
            totalCount = data.length;
        }
        res.status(200).json({
            code: 200, status: 'Successful',
            message: 'Record extracted successfully',
            NumberOfRecords: totalCount, tableName: tableName, recordList: recordList,
        });
    } catch (error) {
     
        res.status(500).json({ code: 500, status: 'Error', message: 'Interner Serverfehler.' });
    }
}

const AssignBauelementBaugruppe = async (req, res, next) => {
    var obj = req.body;
    const user = { ID: 1 };    // req.user;
    if (!obj.data) {
        return res.status(400).json({ code: 400, status: 'Validation Error', message: "Records ist erforderlich" });
    }
    try {
        let dt = JSON.parse(obj.data);
        if (dt.length <= 0) {
            return res.status(400).json({ code: 400, status: 'Validation Error', message: "Records ist erforderlich" });
        }
        let data;
        var error = 0;
        dt.forEach(async bauelement => {
            if (error == 0) {
                if (bauelement.baugruppe_id == "" || bauelement.baugruppe_id === undefined) {
                    error = 1;
                } else if (bauelement.bauelement_id == "" || bauelement.bauelement_id === undefined) {
                    error = 2;
                } else {
                    data = await db.sequelize.query('CALL assignBauelementtoBaugruppe(:baugruppeid,:bauelementid,:userId)', {
                        replacements: {
                            baugruppeid: bauelement.baugruppe_id,
                            bauelementid: bauelement.bauelement_id,
                            userId: user.ID,
                        },
                        type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
                    });
                }
            }
        });
        if (error == 1) {
            return res.status(400).json({ code: 400, status: 'Validation Error', message: "Baugruppe Nr ist erforderlich" });
        } else if (error == 2) {
            return res.status(400).json({ code: 400, status: 'Validation Error', message: "Bauelement Nr ist erforderlich" });
        } else {
            res.status(201).json({ code: 201, status: 'Successful', message: 'Record has been updated successfully' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ code: 500, status: 'Error', message: 'Interner Serverfehler.' });
    }
};

async function getAllTatigkeit(req, res) {
    const { search = '' } = req.query;  //Default to page 1 and 20 records per page
    try {
        const data = await db.sequelize.query('CALL getAllTatigkeit(:search)', {
            replacements: {
                search: search,
            },
            type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
        });
        const recordList = data.map(newdata => new TatigkeitDTO(newdata));
        var totalCount = 0;
        var tableName = "Tatigkeit List";
        if (data.length > 0) {
            totalCount = data.length;
        }
        res.status(200).json({
            code: 200, status: 'Successful',
            message: 'Record extracted successfully',
            NumberOfRecords: totalCount, tableName: tableName, recordList: recordList,
        });
    } catch (error) {
       
        res.status(500).json({ code: 500, status: 'Error', message: 'Interner Serverfehler.' });
    }
}

const addBauelementBaugruppe = async (req, res, next) => {
    const { baugruppe_id, bauelement_id, tatigkeit, s_id = null } = req.body;
    const user = req.user;    // req.user;
    // Validate input using the imported validateRoles array
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ code: 400, status: 'Validation Error', message: errors.array() });
    }
    try {
        const newObject = await db.sequelize.query('CALL addbauelementtobaugruppe(:baug_inst_id,:element_id,:note,:ser_id,:userId)', {
            replacements: {
                baug_inst_id: baugruppe_id,
                element_id: bauelement_id,
                note: tatigkeit,
                ser_id: s_id,
                userId: user.ID
            },
            type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
        });
        res.status(201).json({ code: 201, status: 'Successful', message: 'Element and tatigkeit has successfully assigned' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ code: 500, status: 'Error', message: 'Interner Serverfehler.' });
    }
};

const addBauelementBaugruppeWithNewElement = async (req, res, next) => {
    const { baugruppe_id, bauelement, tatigkeit, s_id = null } = req.body;
    const user = req.user;    // req.user;
    // Validate input using the imported validateRoles array
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ code: 400, status: 'Validation Error', message: errors.array() });
    }
    try {
        const newObject = await db.sequelize.query('CALL createbauelementandassigntobaugruppe(:baug_inst_id,:element,:note,:ser_id,:userId)', {
            replacements: {
                baug_inst_id: baugruppe_id,
                element: bauelement,
                note: tatigkeit,
                ser_id: s_id,
                userId: user.ID
            },
            type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
        });
        res.status(201).json({ code: 201, status: 'Successful', message: 'Element and tatigkeit has successfully assigned' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ code: 500, status: 'Error', message: 'Interner Serverfehler.' });
    }
};

const addArrayOfBauelementAndTatigkeitOnBaugruppe = async (req, res, next) => {
    var obj = req.body;
    const user = req.user;    // req.user;
    let msg = "";

    if (!obj.data) return res.status(400).json({ code: 400, status: 'Validation Error', message: "Bauelement Records ist erforderlich" });
    try {
        var error = 0;
        let dt = JSON.parse(obj.data);
        if (dt.length <= 0) return res.status(400).json({ code: 400, status: 'Validation Error', message: "Bauelement Records ist erforderlich" });
        dt.forEach(async currentData => {
            if(error == 0)
            {
                if (currentData.bauelement == "" || currentData.bauelement === undefined) {
                    error = 1;
                    msg = "Bauelement ist erforderlich";
                } else if (currentData.tatigkeit == "" || currentData.tatigkeit === undefined) {
                    error = 2;
                    msg = "Tatigkeit ist erforderlich";
                } else if (currentData.baugruppe_id === undefined || currentData.baugruppe_id == null) {
                    error = 3;
                    msg = "Baugruppe installation ist erforderlich";
                } else if (currentData.s_id === undefined || currentData.s_id == null) {
                    error = 4;
                    msg = "Contract ist erforderlich";
                } else if (currentData.sort_by === undefined || currentData.sort_by == null) {
                    error = 5;
                    msg = "Sort by ist erforderlich";
                } else {
                    const newObject = await db.sequelize.query('CALL createbauelementandassigntobaugruppeV3(:baug_inst_id,:element,:note,:ser_id,:sorted_by,:userId)', {
                        replacements: {
                            baug_inst_id: currentData.baugruppe_id,
                            element: currentData.bauelement,
                            note: currentData.tatigkeit,
                            ser_id: currentData.s_id,
                            sorted_by: currentData.sort_by,
                            userId: user.ID
                        },
                        type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
                    });
                }
            }
        });
        if(msg != ""){
            return res.status(400).json({code: 400, status: 'Validation Error', message: msg });
        }
        else{
            res.status(201).json({code: 201, status:'Successful', message: 'Record has been updated successfully' });
        } 
    } catch (error) {
        res.status(500).json({ code: 500, status: 'Error', message: 'Interner Serverfehler.' });
    }
};

async function getselectedbauelement(req, res) {
    const { id = '', search = '' } = req.query;  //Default to page 1 and 20 records per page
    try {
        if (id == "") return res.status(400).json({ code: 400, status: 'Validation Error', message: "Baugruppe Id ist erforderlich" });
        const data = await db.sequelize.query('CALL getSelectedMachineElements(:machine_id,:search)', {
            replacements: {
                machine_id: id,
                search: search,
            },
            type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
        });
        const recordList = data.map(newdata => new ElementDTO(newdata));
        var totalCount = 0;
        var tableName = "Baugurppe Selected Bauelements";
        if (data.length > 0) totalCount = data.length;
        res.status(200).json({
            code: 200, status: 'Successful',
            message: 'Record extracted successfully',
            NumberOfRecords: totalCount, tableName: tableName, recordList: recordList,
        });
    } catch (error) {
        res.status(500).json({ code: 500, status: 'Error', message: 'Interner Serverfehler.' });
    }
}

async function getselectedTatigkeit(req, res) {
    const { id = '', search = '' } = req.query;  //Default to page 1 and 20 records per page
    try {
        if (id == "") {
            return res.status(400).json({ code: 400, status: 'Validation Error', message: "Bauelement Id ist erforderlich" });
        }
        const data = await db.sequelize.query('CALL getSelectedTatigkeit(:element_id,:search)', {
            replacements: {
                element_id: id,
                search: search,
            },
            type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
        });
        const recordList = data.map(newdata => new TatigkeitDTO(newdata));
        var totalCount = 0;
        var tableName = "Bauelement Selected Tatigkeit";
        if (data.length > 0) {
            totalCount = data.length;
        }
        res.status(200).json({
            code: 200, status: 'Successful',
            message: 'Record extracted successfully',
            NumberOfRecords: totalCount, tableName: tableName, recordList: recordList,
        });
    } catch (error) {
      
        res.status(500).json({ code: 500, status: 'Error', message: 'Interner Serverfehler.' });
    }
}

async function getselectedTatigkeitwithTemplate(req, res) {
    const { baugruppe_id = '', id = '', search = '' } = req.query;  //Default to page 1 and 20 records per page
    try {
        if (id == "") {
            return res.status(400).json({ code: 400, status: 'Validation Error', message: "Bauelement Id ist erforderlich" });
        }
        if (baugruppe_id == "") {
            return res.status(400).json({ code: 400, status: 'Validation Error', message: "Baugruppe Id ist erforderlich" });
        }
        const data = await db.sequelize.query('CALL getSelectedTatigkeitTemplate(:machine_id,:element_id,:search)', {
            replacements: {
                machine_id: baugruppe_id,
                element_id: id,
                search: search,
            },
            type: Sequelize.QueryTypes.RAW, // Set the query type to RAW
        });
        const recordList = data.map(newdata => new TatigkeitDTO(newdata));
        var totalCount = 0;
        var tableName = "Bauelement Selected Tatigkeit";
        if (data.length > 0) {
            totalCount = data.length;
        }
        res.status(200).json({
            code: 200, status: 'Successful',
            message: 'Record extracted successfully',
            NumberOfRecords: totalCount, tableName: tableName, recordList: recordList,
        });
    } catch (error) {
    
        res.status(500).json({ code: 500, status: 'Error', message: 'Interner Serverfehler.' });
    }
}

const deleteMachineElement = async (req, res, next) => {
    const { id } = req.query;  //Get Id
    const user = req.user;    // req.user;
    if (id == "" || id === undefined) {
        return res.status(400).json({ code: 400, status: 'Validation Error', message: "Bauelement Nr ist erforderlich" });
    }
    try {
        const machineelement = await MachineELementModel.findByPk(id);
        if (!machineelement) {
            return res.status(404).json({ code: 404, status: 'Error', message: 'Bauelement not found' });
        }
        machineelement.deletedBy = user.ID;
        const machinedata = await machineelement.destroy();
        res.status(201).json({ code: 201, status: 'Successful', message: 'Bauelement deleted successfully' });
    } catch (error) {
        res.status(500).json({ code: 500, status: 'Error', message: 'Interner Serverfehler.' });
    }
};

module.exports = {
    getMachineElements,
    getBaugruppeMachineElements,
    updateMachineElement,
    revertMachineElement,
    updateAllMachineElement,
    getAssignedBauelementBaugruppe,
    revertAllMachineElement,
    getUnAssignedBauelementBaugruppe,
    AssignBauelementBaugruppe,
    getAllTatigkeit,
    addBauelementBaugruppe,
    getselectedbauelement,
    getselectedTatigkeit,
    getselectedTatigkeitwithTemplate,
    addBauelementBaugruppeWithNewElement,
    deleteMachineElement,
    addArrayOfBauelementAndTatigkeitOnBaugruppe
};

