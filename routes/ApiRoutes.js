const express = require("express");
const { userCreationValidate,
        userUpdationValidate, 
        loginValidate, 
        loginWithServerValidate,
        createInstallationValidate, 
        updateInstallationDirectoryPathValidate,
        createServiceContractValidate,
        createBaugruppeValidate,
        createBauelementValidate, 
        createBauelementTemplateValidate,
        updateBauelementTemplateValidate,
        updateReportValidate, 
        createServiceContractMeta, 
        createbauelementbaugruppe,
        createbauelementbaugruppeWithNewElement,
        createBaugruppeNewItemValidate,
        createServiceContractMetaImg,
        reportEmail,
        sendemail,
        MachineServiceContractValidate,
        userUpdationValidateForProfile,
        updateMetaImageValidate,
        createBaugruppeTemplateValidate,
        createTatigkeitTemplateValidate,
        updateTatigkeitTemplateValidate,
        createRepairingContractValidate,
        createRepairingTaskValidate,
    } = require("../validation/Validator");



const { authenticateUser } = require('../middlewares/authMiddleware');
const { roleMiddleware } = require('../middlewares/roleMiddleware');

const userController = require('../controllers/UserController');
const InstallationController = require('../controllers/InstallationController');
const ServiceController = require('../controllers/ServiceContractController');
const MachineController = require('../controllers/MachineController');
const MachineInstallationController = require('../controllers/MachineInstallationController');
const ElementController = require('../controllers/ElementController');
const MachineElementController = require('../controllers/MachineElementController');
const ServiceContractMeta = require('../controllers/ServiceContractMetaController');
const MachineTemplateController = require('../controllers/MachineTemplateController');
const emailService = require('../services/email');
const ReportController = require('../controllers/ReportController');
const UserHasInstallationsController = require('../controllers/UserHasInstallationsController');
const EmailController = require('../controllers/EmailController');
const BaugruppeServiceController = require('../controllers/BaugruppenServiceContractController');
const FileDirectoryController = require('../controllers/FileDirectoryController');
const UserAccessFromServerController = require('../controllers/UserAccessFromServerController');
const BauelementTemplateController = require('../controllers/ElementTemplateController');
const TatigkeitTemplateController = require('../controllers/TatigkeitTemplateController');
const RepairingContractController = require('../controllers/RepairingContractController');
const RepairingTaskController = require('../controllers/RepairingTaskController');
const FileServiceController = require('../controllers/FileServiceController');

const router = express.Router();

const createRoleRouter = (roles) => {
    const roleRouter = express.Router();
    roleRouter.use(roleMiddleware(roles));
    return roleRouter;
};

// Create a nested router for user routes with admin role requirement
// const adminRouter = createRoleRouter(['admin']);
// const managerRouter = createRoleRouter(['manager']);

const adminMiddleware = roleMiddleware(['admin']);
const ManagerMiddleware = roleMiddleware(['manager']);
const adminManagerMiddleware = roleMiddleware(['admin', 'manager']);
const adminManagerEngineerMiddleware = roleMiddleware(['admin', 'manager','engineer']);
const allRoleMiddleware = roleMiddleware(['admin', 'manager','engineer','external']);


// USER
router.post('/login', loginValidate, userController.login);
router.post('/loginFromServer', loginWithServerValidate, userController.loginFromServer);
//Report access on email too

router.get('/getreportbyid', ReportController.getReportById);
router.get('/accessdirectorypath', FileDirectoryController.accessDirectory);
router.get('/accessfile', FileDirectoryController.accessFile);
router.get('/serverUserAuthenticate', UserAccessFromServerController.authenticateServerUser);

// Authentication Apply Here
router.use(authenticateUser);

//Installation
router.get('/objektlist', allRoleMiddleware, InstallationController.getInstallations);
router.get('/getobjektbyid', allRoleMiddleware, InstallationController.getInstallationById);
router.post('/objekt/add', adminManagerMiddleware, createInstallationValidate, InstallationController.addInstallations);
router.put('/objekt/update', adminManagerEngineerMiddleware, createInstallationValidate, InstallationController.updateInstallations);
router.put('/objekt/update/assignpath', adminMiddleware, updateInstallationDirectoryPathValidate, InstallationController.updateInstallationsDirectoryPath);
router.get('/objekt/delete', adminManagerMiddleware, InstallationController.deleteInstallations);

//Service Contract
router.get('/servicecontract', allRoleMiddleware, ServiceController.getServiceContracts);
router.post('/servicecontract/add/', adminManagerEngineerMiddleware, createServiceContractValidate, ServiceController.addServiceContracts);
router.put('/servicecontract/update/', adminManagerEngineerMiddleware, createServiceContractValidate, ServiceController.updateServiceContracts);
router.get('/servicecontract/delete', adminManagerMiddleware, ServiceController.deleteServiceContracts);

// API for service contract notes and images
router.get('/servicecontract/meta/note/list', allRoleMiddleware, ServiceContractMeta.getNote);
router.post('/servicecontract/meta/note', adminManagerEngineerMiddleware, createServiceContractMeta, ServiceContractMeta.createNote);
router.post('/servicecontract/meta/note/all', adminManagerEngineerMiddleware, ServiceContractMeta.createNoteList);
router.get('/servicecontract/meta/note/delete', adminManagerEngineerMiddleware, ServiceContractMeta.deleteNote);
router.delete('/servicecontract/meta/note/array/delete', adminManagerEngineerMiddleware, ServiceContractMeta.deleteNoteList);

router.get('/servicecontract/meta/image/list', allRoleMiddleware, ServiceContractMeta.getImages);
router.post('/servicecontract/meta/image', adminManagerEngineerMiddleware, ServiceContractMeta.createImage);
router.put('/servicecontract/meta/image/update', adminManagerEngineerMiddleware, updateMetaImageValidate, ServiceContractMeta.updateImage);
router.get('/servicecontract/meta/image/delete', adminManagerEngineerMiddleware, ServiceContractMeta.deleteImage);
router.delete('/servicecontract/meta/image/array/delete', adminManagerEngineerMiddleware, ServiceContractMeta.deleteImageList);

//Repairing Contract
router.get('/repairingcontract', allRoleMiddleware, RepairingContractController.getRepairingContracts);
router.post('/repairingcontract/add/', adminManagerEngineerMiddleware, createRepairingContractValidate, RepairingContractController.addRepairingContracts);
router.put('/repairingcontract/update/', adminManagerEngineerMiddleware, RepairingContractController.updateRepairingContracts);
router.get('/repairingcontract/delete', adminManagerMiddleware, RepairingContractController.deleteRepairingContracts);

//Repairing Contract
router.get('/repairingtask', allRoleMiddleware, RepairingTaskController.getRepairingTasks);
router.post('/repairingtask/add/', adminManagerEngineerMiddleware, createRepairingTaskValidate, RepairingTaskController.addRepairingTasks);
router.get('/repairingtask/view', allRoleMiddleware, RepairingTaskController.getRepairingTaskById);
router.put('/repairingtask/update/', adminManagerEngineerMiddleware, RepairingTaskController.updateRepairingTasks);
router.get('/repairingtask/delete', adminManagerMiddleware, RepairingTaskController.deleteRepairingTasks);
router.put('/repairingtask/bulk/update', adminManagerEngineerMiddleware, RepairingTaskController.updateBulkRepairingTasks);



//Machine Relation
router.get('/baugruppelist', allRoleMiddleware, MachineController.getMachines);
router.get('/baugruppebyid', allRoleMiddleware, MachineController.getMachineById);
router.post('/baugruppe/add', adminManagerMiddleware, createBaugruppeValidate, MachineController.addMachines);
router.put('/baugruppe/update', adminManagerMiddleware, createBaugruppeValidate, MachineController.updateMachines);
router.get('/baugruppe/delete', adminManagerMiddleware, MachineController.deleteMachines);

//Machine Installation
router.get('/baugruppeinstallation', allRoleMiddleware, MachineInstallationController.getBaugruppeInstallation);
router.get('/baugruppeinstallation/dropdown', allRoleMiddleware, MachineInstallationController.getBaugruppeInstallationDropdown);
router.get('/baugruppe/assigned', adminManagerMiddleware, MachineInstallationController.getAssignedBaugruppeInstallation);
router.get('/baugruppe/unassigned', adminManagerMiddleware, MachineInstallationController.getUnAssignedBaugruppeInstallation);
router.put('/baugruppe/assign', adminManagerMiddleware, MachineInstallationController.AssignBaugruppeInstallation);
router.post('/baugruppe/assign/newitem', adminManagerEngineerMiddleware, createBaugruppeNewItemValidate, MachineInstallationController.AssignBaugruppeInstallationByNewBaugruppe);
router.put('/baugruppe/assign/newinstantarray', adminManagerEngineerMiddleware, MachineInstallationController.AssignBaugruppeInstallationWithNewInstant);
router.get('/baugruppeinstallation/delete', adminManagerEngineerMiddleware, MachineInstallationController.deleteBaugruppeInstallation);
router.put('/gruppen/update', adminManagerEngineerMiddleware, MachineServiceContractValidate, BaugruppeServiceController.updatemachinecontractsbemerkungen);
router.put('/baugruppen/bulk/update', adminManagerEngineerMiddleware, BaugruppeServiceController.updateBaugruppenBemerkungAgainstContract);

//Elements
router.get('/bauelementlist', allRoleMiddleware, ElementController.getElements);
router.get('/allbauelementlist', allRoleMiddleware, ElementController.getAllElements);
router.post('/bauelement/add', adminManagerMiddleware, createBauelementValidate, ElementController.addElement);
router.put('/bauelement/update', adminManagerMiddleware, createBauelementValidate, ElementController.updateElement);
router.get('/bauelement/delete', adminManagerMiddleware, ElementController.deleteElement);

//Templates
//Machine Template
router.get('/baugruppetemplate/list', adminManagerEngineerMiddleware, MachineTemplateController.getMachinesTemplate);
router.get('/baugruppetemplatebyid', adminManagerMiddleware, MachineTemplateController.getMachinesTemplateById);
router.post('/baugruppetemplate/add', adminMiddleware, createBaugruppeTemplateValidate, MachineTemplateController.addMachinesTemplate);
router.put('/baugruppetemplate/update', adminMiddleware, createBaugruppeTemplateValidate, MachineTemplateController.updateMachinesTemplate);
router.get('/baugruppetemplate/delete', adminMiddleware, MachineTemplateController.deleteMachinesTemplate);

//Element Template
router.get('/bauelementtemplate/list', adminManagerMiddleware, BauelementTemplateController.getselectedTemplateElement);
router.post('/bauelementtemplate/add', adminMiddleware, createBauelementTemplateValidate, BauelementTemplateController.addTemplateElement);
router.put('/bauelementtemplate/update', adminMiddleware, updateBauelementTemplateValidate, BauelementTemplateController.updateTemplateElement);
router.get('/bauelementtemplate/delete', adminMiddleware, BauelementTemplateController.deleteTemplateElement);

//Tatigkeit Template
router.get('/tatigkeittemplate/list', adminManagerMiddleware, TatigkeitTemplateController.getselectedTemplateTatigkiet);
router.post('/tatigkeittemplate/add', adminMiddleware, createTatigkeitTemplateValidate, TatigkeitTemplateController.addTemplateTatigkiet);
router.put('/tatigkeittemplate/update', adminMiddleware, updateTatigkeitTemplateValidate, TatigkeitTemplateController.updateTemplateTatigkiet);
router.get('/tatigkeittemplate/delete', adminMiddleware, TatigkeitTemplateController.deleteTemplateTatigkiet);


//Machine Element
router.get('/reportlist', allRoleMiddleware, MachineElementController.getMachineElements);
router.put('/report/update/all', allRoleMiddleware, MachineElementController.updateAllMachineElement);
router.put('/report/update', allRoleMiddleware, updateReportValidate, MachineElementController.updateMachineElement);
router.put('/reportelement/revert/all', adminManagerEngineerMiddleware, MachineElementController.revertAllMachineElement);
router.put('/reportelement/revert/:id?', adminManagerEngineerMiddleware, MachineElementController.revertMachineElement);
router.get('/offlinereportlist', allRoleMiddleware, MachineElementController.getBaugruppeMachineElements);
router.get('/bauelement/assigned', adminManagerEngineerMiddleware, MachineElementController.getAssignedBauelementBaugruppe);
router.get('/bauelement/unassigned', adminManagerMiddleware, MachineElementController.getUnAssignedBauelementBaugruppe);
router.put('/bauelement/assign', adminManagerMiddleware, MachineElementController.AssignBauelementBaugruppe);
router.get('/tatigkeitlist', adminManagerMiddleware, MachineElementController.getAllTatigkeit);
router.post('/bauelementandtatigkeit/add', adminManagerMiddleware, createbauelementbaugruppe, MachineElementController.addBauelementBaugruppe);
router.post('/assignbauelementandtatigkeit/add', adminManagerEngineerMiddleware, createbauelementbaugruppeWithNewElement, MachineElementController.addBauelementBaugruppeWithNewElement);
router.put('/assignbauelementandtatigkeit/add/newinstantarray', adminManagerEngineerMiddleware, MachineElementController.addArrayOfBauelementAndTatigkeitOnBaugruppe);
router.get('/selected/bauelement', adminManagerEngineerMiddleware, MachineElementController.getselectedbauelement);
router.get('/selected/tatigkeit', adminManagerEngineerMiddleware, MachineElementController.getselectedTatigkeit);
router.get('/selected/tatigkeittemplate', adminManagerEngineerMiddleware, MachineElementController.getselectedTatigkeitwithTemplate);
router.get('/baugruppebauelement/delete', adminManagerEngineerMiddleware, MachineElementController.deleteMachineElement);

//USER
router.post('/users', adminMiddleware, userCreationValidate, userController.createUser);
router.put('/user/update/:id?' , adminManagerMiddleware,userUpdationValidate, userController.updateUser);
router.put('/profile/update' , allRoleMiddleware,userUpdationValidateForProfile, userController.updateProfile);
router.get('/get/usersbytype', adminManagerMiddleware, userController.getUsersByType);
router.get('/get/roles', adminManagerMiddleware, userController.getRoles);
router.get('/users', allRoleMiddleware, userController.getUsers);
router.get('/logout', allRoleMiddleware, userController.logout);
router.get('/user/delete/:id', adminManagerMiddleware, userController.deleteUser);
router.get('/user/:id?',allRoleMiddleware, userController.getUserByIdOrCurrentUser);

//Reports
router.get('/getreport', allRoleMiddleware, ReportController.getReport);
router.get('/getreports', allRoleMiddleware, ReportController.getAllReports);
router.post('/report/add', allRoleMiddleware, ReportController.addReport);
router.get('/getreportupdatebyid', allRoleMiddleware, ReportController.getReportUpdateById);
router.post('/report/update', allRoleMiddleware, ReportController.updateReport);
router.post('/report/email', allRoleMiddleware, reportEmail, ReportController.emailReport);
router.post('/report/update/tatigkeit', adminMiddleware, ReportController.updateSneakInTatigkeitReport);
router.post('/report/update/checklist', adminMiddleware, ReportController.updateSneakInChecklistReport);

//UserHasObject
router.get('/get/assigned/objecttouser', adminManagerMiddleware, UserHasInstallationsController.getAssignedObjectToUser);
router.get('/get/unassigned/objecttouser', adminManagerMiddleware, UserHasInstallationsController.getUnAssignedObjectToUser);
router.put('/assign/objecttouser', adminManagerMiddleware, UserHasInstallationsController.assignObjectToUser);

//Email
router.post('/email/sent', allRoleMiddleware, EmailController.sendemail);
router.get('/getemail/log/status',allRoleMiddleware, EmailController.get_email_log_status)


//Internal file server
router.get('/internalfileaccess', FileServiceController.readFile);
router.post('/htmltopdfconvertor', allRoleMiddleware, FileServiceController.htmlToPDFConverter);


// Mount the nested routers to the main router
// router.use('', adminRouter);
// router.use('', managerRouter);



module.exports = router;



