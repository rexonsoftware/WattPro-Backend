module.exports = (sequelize, DataTypes) => {
    const RepairingTaskModel = sequelize.define('repairing_tasks', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      repairing_contract_id: {
        type: DataTypes.BIGINT,
      },
      aufgabeposition: {
        type: DataTypes.STRING,
      },
      bezeichnung:{
        type: DataTypes.STRING,
        allowNull: true,
       },
      datum:{
        type: DataTypes.DATE,
        allowNull: true,
       },
       material:{
        type: DataTypes.STRING,
        allowNull: true,
       },
       user_id: {
         type: DataTypes.BIGINT,
         allowNull: true,
       },
       clock_start:{
        type: DataTypes.DATE,
        allowNull: true,
       },
       clock_end:{
        type: DataTypes.DATE,
        allowNull: true,
       },
       baugruppe_inst_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
       },
       bauelement_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
       },
       bemerkung:{
        type: DataTypes.STRING,
        allowNull: true,
       },
       tatigkeit_als:{
        type: DataTypes.STRING,
        allowNull: true,
       },
       status: {
        type: DataTypes.INTEGER,
        allowNull: true,
       },
       createdBy: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      updatedBy: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      deletedBy: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    }, {
      tableName: 'repairing_tasks',
      paranoid: true
    });
    return RepairingTaskModel;
 }
 
 