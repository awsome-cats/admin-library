'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class IssueBook extends Model {
    static associate(models) {
      IssueBook.belongsTo(models.User)
      IssueBook.belongsTo(models.Category)
      IssueBook.belongsTo(models.Book)
    }
  };
  IssueBook.init({
    categoryId: DataTypes.INTEGER,
    bookId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    days_issued: DataTypes.INTEGER,
    issued_date: DataTypes.DATE,
    is_returned: DataTypes.ENUM('1','0'),
    returned_date: DataTypes.DATE,
    status: DataTypes.ENUM('1','0')
  }, {
    sequelize,
    modelName: 'IssueBook',
  });
  return IssueBook;
};
