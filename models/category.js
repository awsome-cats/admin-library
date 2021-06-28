'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      // define association here
      // Category.belongsTo(models.IssueBook)
      // Category.belongsTo(models.Book)
    }
  };
  Category.init({
    name: DataTypes.STRING,
    status: DataTypes.ENUM('1','0')
  }, {
    sequelize,
    modelName: 'Category',
  });
  return Category;
};
