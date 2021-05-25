var Sequelize = require('sequelize');
var config = require('./localConfig');
config = config[config.activeEnv];


var sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
    dialectOptions: {
         multipleStatements: true
    },
    logging: false
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

var models=['users','employee'];

models.forEach(function (model) {
    console.log("model ::",model)
     module.exports[model] = sequelize.import('../model/' + model);
    //console.log("module.exports:: ",module.exports);
    
    module.exports[model].sync({force: false}).then( (data)=>{
       // console.log(data)
    },(err)=>{
        //console.log(err)
    });
});
(function (m) {
})(module.exports);
exports.sequelize = sequelize;
exports.Sequelize = Sequelize;