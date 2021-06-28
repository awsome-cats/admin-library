'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DaySetting extends Model {
    static associate(models) {
      // define association here
    }
  };
  DaySetting.init({
    total_days: DataTypes.INTEGER,
    status: DataTypes.ENUM('1','0')
  }, {
    sequelize,
    modelName: 'DaySetting',
  });
  return DaySetting;
};
