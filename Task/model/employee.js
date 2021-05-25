
const db = require('../config/databaseConnection');
const Sequelize = require('sequelize');
var sequelize = db.sequelize;

console.log("db", db);
module.exports = function (sequelize, DataTypes) {
    var User = sequelize.import('../model/' + 'users');
    const Employee = sequelize.define('employee', {
        id: {
            type: Sequelize.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        employeeId: {
            type: Sequelize.INTEGER,
            unique: true
        },
        organizationName: {
            type: Sequelize.STRING
        }
    }, {
        freezeTableName: true
    })
    Employee.belongsTo(User,{as:"user"})
    return Employee;
}