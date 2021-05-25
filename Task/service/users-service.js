var userDao = require('../dao/users-dao');
var util= require('../utilities/commonUtil')
var crypto = require('crypto');
const paginateService = require('../utilities/commonUtil');


module.exports = {

    addUsers: function (req) {
        let insertObj = req.body
        if (req.body.password) {
            let pass = req.body.password
            //console.log("service::",req.body.password)
            insertObj.password = crypto.createHmac('sha256', "Test123").update(pass).digest('hex');
        }
        console.log("insert object ::", req.body)
        return new Promise(function (resolve, reject) {
            userDao.addUsers(insertObj).then(function (result) {
                return resolve(result);
            }, function (err) {
                return reject(err);
            });
        }, function (err) {
            return reject(err);
        });
    },

    getloginIdPass: function (req) {
        let user = {
            userName:req.body.email,
            password:req.body.password
        }
        return new Promise(function (resolve, reject) {
            userDao.getloginIdPass(user).then(function (result) {
                return resolve(result);
            }, function (err) {
                return reject(err);
            });
        }, function (err) {
            return reject(err);
        });
    },

    getUserList:function (req) {
        console.log("in service::",req)
        let userId = req.id
        var pageObj = paginateService.paginate(req)
        var sort = !req.query.sort ? '' : req.query.sort
        var search = !req.query.search ? '' : req.query.search
        console.log("user ::",userId,pageObj,sort,search)
        return new Promise(function (resolve, reject) {
            userDao.getUserList({"userId":userId,"page": pageObj,"sort": sort ,"search":search}).then(function (result) {
                return resolve(result);
            }, function (err) {
                return reject(err);
            });
        }, function (err) {
            return reject(err);
        });
    },
}