'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Option extends Model {
    static associate(models) {
      // define association here
    }
  };
  Option.init({
    option_name: DataTypes.STRING,
    option_value: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Option',
    timestamps:false
  });
  return Option;
};
