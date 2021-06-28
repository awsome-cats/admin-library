'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // define association here
      // User.belongsTo(models.IssueBook)
    }
  };
  User.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    mobile: DataTypes.STRING,
    gender: DataTypes.ENUM('male','female','lgbt'),
    address: DataTypes.TEXT,
    status: DataTypes.ENUM('1','0')
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};
