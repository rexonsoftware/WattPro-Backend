module.exports = (sequelize, DataTypes) => {
    const RepairingContractModel = sequelize.define('repairing_contracts', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      installation_id: {
        type: DataTypes.BIGINT,
      },
      contract_id: {
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
       auftraggeber_name:{
        type: DataTypes.STRING,
        allowNull: true,
       },
       bemerkung: {
         type: DataTypes.STRING,
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
      tableName: 'repairing_contracts',
      paranoid: true
    });
    return RepairingContractModel;
 }
 
 