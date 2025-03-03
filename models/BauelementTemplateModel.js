module.exports = (sequelize, DataTypes) => {
    const ElementTemplateModel = sequelize.define('ElementTemplate', {
        id: {type: DataTypes.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true},
        bauelement:{type:DataTypes.STRING},
        createdBy: { type: DataTypes.STRING, allowNull: true, },
        updatedBy: { type: DataTypes.STRING, allowNull: true, },
        deletedBy: { type: DataTypes.STRING, allowNull: true, },
    },{
      tableName: 'bauelement_template_tbl',
      paranoid: true
    });
      return ElementTemplateModel;
  }