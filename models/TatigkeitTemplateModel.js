module.exports = (sequelize, DataTypes) => {
    const TatigkeitTemplateModel = sequelize.define('TatigkeitTemplate', {
        id: {type: DataTypes.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true},
        baugruppe_id: {type: DataTypes.INTEGER},
        bauelement_id: {type: DataTypes.INTEGER},
        tatigkeit:{type:DataTypes.STRING},
        createdBy: { type: DataTypes.STRING, allowNull: true, },
        updatedBy: { type: DataTypes.STRING, allowNull: true, },
        deletedBy: { type: DataTypes.STRING, allowNull: true, },
    },{
      tableName: 'baugruppe_bauelement_template_tbl',
      paranoid: true
    });
      return TatigkeitTemplateModel;
  }