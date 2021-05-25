const db=require('../config/databaseConnection');
const Sequelize = require('sequelize');
var sequelize = db.sequelize;

console.log("db",db);
module.exports = function (sequelize, DataTypes) {
    const Users = sequelize.define('users', {
        id: {
            type: Sequelize.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        firstName:{
            type:Sequelize.STRING
        },
        lastName:{
            type:Sequelize.STRING
        },
        email: {
            type: Sequelize.STRING,
            allowNull: true,
            validate: {
                isEmail: {
                    args: true,
                    msg: 'The email you entered is invalid.'
                }
            }
        },
        password: {
            type: Sequelize.STRING
        }, 
    },{
        freezeTableName: true
    })
    
    return Users;
}