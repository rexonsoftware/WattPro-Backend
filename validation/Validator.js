const { body } = require('express-validator');

const userCreationValidate = [
  body('fname').notEmpty().isString().withMessage('First name must be a non-empty string'),
  body('lname').isString().withMessage('Required only string'),
  // body('username').notEmpty().withMessage('Usernmae ist erforderlich'),
  body('email').notEmpty().isEmail().withMessage('Ungültiges E-Mail-Format'),
  // body('password').notEmpty().isLength({ min: 6 }).withMessage('Das Passwort muss mindestens 6 Zeichen lang sein.'),
  body('roleId').notEmpty().withMessage('Role ist erforderlich'),
];

const userUpdationValidate = [
  body('fname').notEmpty().isString().withMessage('First name must be a non-empty string'),
  body('lname').isString().withMessage('Required only string'),
  // body('username').notEmpty().withMessage('Usernmae ist erforderlich'),
  body('email').notEmpty().isEmail().withMessage('Ungültiges E-Mail-Format'),
  body('roleId').notEmpty().withMessage('Role ist erforderlich'),
];

const userUpdationValidateForProfile = [
  body('fname').notEmpty().isString().withMessage('First name must be a non-empty string'),
  body('lname').isString().withMessage('Required only string'),
];

const loginValidate = [
  body('email').notEmpty().isEmail().withMessage('Ungültiges E-Mail-Format'),
  body('password').notEmpty().withMessage('Passwort ist erforderlich'),
];

const loginWithServerValidate = [
  body('username').notEmpty().withMessage('Username ist erforderlich'),
  body('password').notEmpty().withMessage('Passwort ist erforderlich'),
];

const createInstallationValidate = [
  // body('kundennummer').notEmpty().withMessage('Kunden_nr required'),
  body('kundenname').notEmpty().withMessage('Kunden name ist erforderlich'),
];

const updateInstallationDirectoryPathValidate = [
  body('id').notEmpty().withMessage('Kunden Id ist erforderlich'),
  body('path').notEmpty().withMessage('Path ist erforderlich'),
];

const createServiceContractValidate = [
  body('installation_id').notEmpty().withMessage('Objekt ist erforderlich'),
  body('service_id').notEmpty().withMessage('Contract Nr ist erforderlich'),
  body('wartungsdatum')
    .notEmpty().withMessage('Wartungsdatum is required')
    .custom((value) => {
      // Use a custom function to check if 'wartungsdatum' is a valid date
      if ((/^\d{2}.\d{2}.\d{4}$/.test(value)) || (/^\d{4}-\d{2}-\d{2}$/.test(value))) {
      // if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      }else{
        throw new Error('Wartungsdatum must be a valid date in the format YYYY-MM-DD');
      }
      return true;
    }),
];

const createBaugruppeValidate = [
  body('bgnr').notEmpty().withMessage('Baugruppe Nr ist erforderlich'),
  body('baugruppe').notEmpty().withMessage('Baugruppe ist erforderlich'),
];

const createBaugruppeTemplateValidate = [
  body('baugruppe').notEmpty().withMessage('Baugruppe ist erforderlich'),
];

const createBauelementValidate = [
  body('bauelement').notEmpty().withMessage('Bauelement ist erforderlich'),
];

const createBauelementTemplateValidate = [
  body('baugruppe_template_id').notEmpty().withMessage('Baugruppe ist erforderlich'),
  body('bauelement').notEmpty().withMessage('Bauelement ist erforderlich'),
];

const updateBauelementTemplateValidate = [
  body('bauelement').notEmpty().withMessage('Bauelement ist erforderlich'),
];

const createTatigkeitTemplateValidate = [
  body('baugruppe_template_id').notEmpty().withMessage('Baugruppe ist erforderlich'),
  body('bauelement_template_id').notEmpty().withMessage('Bauelement ist erforderlich'),
  body('tatigkeit').notEmpty().withMessage('Bauelement ist erforderlich'),
];

const updateTatigkeitTemplateValidate = [
  body('tatigkeit').notEmpty().withMessage('Bauelement ist erforderlich'),
];

const updateReportValidate = [
  body('id').notEmpty().withMessage('Bauelement Id is required'),
  body('bemerkung').notEmpty().withMessage('Bemerkung ist required'),
  body('sort_by').isNumeric().withMessage('Sort By must be a number'),
];


const createServiceContractMeta = [
  body('serviceContractId').notEmpty().withMessage('Service Contract Nr ist erforderlich!'),
  body('notes').notEmpty().isString().withMessage('Notizfeld ist erforderlich!'),
];

const createbauelementbaugruppe = [
  body('baugruppe_id').notEmpty().withMessage('Baugruppe ist erforderlich'),
  body('bauelement_id').notEmpty().withMessage('Bauelement ist erforderlich'),
  body('tatigkeit').notEmpty().withMessage('Tatigkeit ist erforderlich'),
];

const createbauelementbaugruppeWithNewElement = [
  body('baugruppe_id').notEmpty().withMessage('Baugruppe ist erforderlich'),
  body('bauelement').notEmpty().withMessage('Bauelement ist erforderlich'),
  body('tatigkeit').notEmpty().withMessage('Tatigkeit ist erforderlich'),
];


const createBaugruppeNewItemValidate = [
  body('bgnr').notEmpty().withMessage('Baugruppe Nr ist erforderlich'),
  body('baugruppe').notEmpty().withMessage('Baugruppe ist erforderlich'),
  body('baugruppe_nr').notEmpty().withMessage('Baugruppe Id ist erforderlich'),
  body('kunden_nr').notEmpty().withMessage('Kunden Nr ist erforderlich'),
];

const createServiceContractMetaImg = [
  body('s_id').notEmpty().withMessage('Service Contract Nr ist required'),
  body('images').notEmpty().withMessage('Image File ist erforderlich'),
];

const reportEmail = [
  body('id').notEmpty().withMessage('Report Id ist erforderlich'),
  body('email1').notEmpty().withMessage('Email One ist erforderlich'),
  body('subject').notEmpty().withMessage('Subject ist erforderlich'),
];

const sendemail = [
  body('email1').notEmpty().withMessage('Email One ist erforderlich'),
  body('subject').notEmpty().withMessage('Subject ist erforderlich'),
  body('file').notEmpty().withMessage('File ist erforderlich'),
]

const MachineServiceContractValidate = [
  // body('kundennummer').notEmpty().withMessage('Kunden_nr required'),
  body('id').notEmpty().withMessage('Baugruppen Id ist erforderlich'),
  body('s_id').notEmpty().withMessage('Service Contract Id ist erforderlich'),
  body('bgnr').notEmpty().withMessage('Bgnr ist erforderlich'),
  body('baugruppen').notEmpty().withMessage('Baugruppen Name ist erforderlich'),
];

const updateMetaImageValidate = [
  body('id').notEmpty().withMessage('Image Nr ist erforderlich'),
  body('title').notEmpty().withMessage('Image title ist erforderlich'),
];

const createRepairingContractValidate = [
  body('installation_id').notEmpty().withMessage('Objekt ist erforderlich'),
  body('contract_id').notEmpty().withMessage('Contract Nr ist erforderlich'),
  body('wartungsdatum')
    .notEmpty().withMessage('Wartungsdatum is required')
    .custom((value) => {
      // Use a custom function to check if 'wartungsdatum' is a valid date
      if ((/^\d{2}.\d{2}.\d{4}$/.test(value)) || (/^\d{4}-\d{2}-\d{2}$/.test(value))) {
      // if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      }else{
        throw new Error('Wartungsdatum must be a valid date in the format YYYY-MM-DD');
      }
      return true;
    }),
];

const createRepairingTaskValidate = [
  body('repairing_contract_id').notEmpty().withMessage('Repairing contract ist erforderlich'),
  body('aufgabeposition').notEmpty().withMessage('Aufgabeposition ist erforderlich'),
  body('bezeichnung').notEmpty().withMessage('Bezeichnung ist erforderlich'),
  body('wartungsdatum')
    .notEmpty().withMessage('Datum is required')
    .custom((value) => {
      // Use a custom function to check if 'wartungsdatum' is a valid date
      if ((/^\d{2}.\d{2}.\d{4}$/.test(value)) || (/^\d{4}-\d{2}-\d{2}$/.test(value))) {
      // if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      }else{
        throw new Error('Wartungsdatum must be a valid date in the format YYYY-MM-DD');
      }
      return true;
    }),
  body('clock_start').notEmpty().withMessage('Process start time ist erforderlich'),
  body('clock_end').notEmpty().withMessage('Process end time ist erforderlich'),
];


module.exports = 
{ userCreationValidate,
  userUpdationValidate,
  loginValidate,
  loginWithServerValidate,
  createInstallationValidate,
  updateInstallationDirectoryPathValidate,
  createServiceContractValidate,
  createBaugruppeValidate,
  createBaugruppeTemplateValidate,
  createBauelementValidate,
  createBauelementTemplateValidate,
  updateBauelementTemplateValidate,
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
  updateReportValidate,
  createTatigkeitTemplateValidate,
  updateTatigkeitTemplateValidate,
  createRepairingContractValidate,
  createRepairingTaskValidate,
};