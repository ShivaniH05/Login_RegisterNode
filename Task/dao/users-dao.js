require('dotenv').config()
var db = require("../config/databaseConnection");
var crypto = require('crypto');
const JWT = require('jsonwebtoken')
module.exports = {

    addUsers: function (reqObj) {
        console.log("user ::", reqObj.employeeId)
        return new Promise(function (resolve, reject) {
            return db.employee.findOne({ where: { employeeId: reqObj.employeeId } }).then(function (empResult) {
                console.log("emp result ::", empResult)
                if (empResult) {
                    return reject(409).send("EmployeeID already exists")
                } else {
                    let userObj = {
                        "firstName": reqObj.firstName,
                        "lastName": reqObj.lastName,
                        "password": reqObj.password,
                        "email": reqObj.email
                    }
                    return db.users.create(userObj).then(function (result) {
                        if (result) {
                            let employeeObj = {
                                "employeeId": reqObj.employeeId,
                                "organizationName": reqObj.organizationName,
                                "userId": result.dataValues.id
                            }
                            db.employee.create(employeeObj).then(function (res) {
                                if (res) {
                                    return resolve(result)
                                } else {
                                    return reject(500).send("Error while adding")
                                }
                            })
                        } else {
                            return reject(500).send("Error while adding")
                        }
                    })
                }
            })

        });
    },

    getloginIdPass: function (reqObj) {
        console.log("reqObj", reqObj, reqObj.password, reqObj.userName)
        let pass = reqObj.password
        let encryptedPass = crypto.createHmac('sha256', "Test123").update(pass).digest('hex');
        console.log(encryptedPass)
        return new Promise(function (resolve, reject) {
            return db.users.findOne({ where: { email: reqObj.userName } }).then(function (result) {
                if (result) {
                    console.log("result::", result)
                    if (result.dataValues.password == encryptedPass) {
                        // return resolve(result)
                        //accesstoken     
                        let email = result.dataValues.email + ""
                        let id = result.dataValues.id + ""
                        const payload = { email, id }
                        console.log("payload::", payload)
                        const secret = process.env.JWT_SECRET
                        const options = {
                            expiresIn: '1h',//1h
                            audience: email
                        }
                        JWT.sign(payload, secret, options, (err, token) => {
                            if (err) {
                                console.log(err.message)
                                reject(err.message)
                            }
                            let accesstoken = token
                            const secret = process.env.JWT_REF_SECRET
                            const options = {
                                expiresIn: '1d',
                                audience: email,
                            }
                            JWT.sign(payload, secret, options, (err, token) => {
                                if (err) {
                                    console.log(err.message)
                                    reject(err.message)
                                    //   return
                                }
                                let refreshToken = token
                                const data = {
                                    user: {
                                        "name": result.dataValues.fullName,
                                        "email": result.dataValues.email
                                    },
                                    token: {
                                        accessToken: accesstoken,
                                        refreshToken: refreshToken
                                    }
                                }

                                resolve(data)
                            })
                            //resolve(accesstoken)
                        })
                    } else {
                        return reject(404).send("Invalid password")
                    }
                } else {
                    return reject(404).send("User Not found")
                }
            })
        });
    },

    getUserList: function (reqObj) {
        console.log("dao req object::", reqObj)
        var limit = reqObj.page.limit;
        var offset = reqObj.page.offset;
        let query

        query = "select (select count(*) from users u inner join employee e on u.id = e.userId )as NoOfCount, firstName,lastName, email,employeeId,organizationName from users u inner join employee e on u.id = e.userId  "

        //search
        if (reqObj.search != '') {
            query = query + "and (firstName like '%" + reqObj.search + "%' or lastName like '%" + reqObj.search + "%' or employeeId like '%" + reqObj.search + "%') "
        }


        //sort
        let order
        let keyName
        let valueName
        console.log("sort", reqObj.sort)
        if (reqObj.sort != '') {
            order = reqObj.sort.split(',')
            keyName = order[0]
            valueName = order[1]
            if (keyName == 'FirstName') {
                if (keyName == 'FirstName' && valueName == 'asc') {
                    query = query + "order by firstName asc"
                } else if (keyName == 'FirstName' && valueName == 'desc') {
                    query = query + "order by firstName desc"
                }
            }else if(keyName == 'LastName'){
                if (keyName == 'LastName' && valueName == 'asc') {
                    query = query + "order by LastName asc"
                } else if (keyName == 'LastName' && valueName == 'desc') {
                    query = query + "order by LastName desc"
                }
            }else if(keyName == 'Email'){
                if (keyName == 'Email' && valueName == 'asc') {
                    query = query + "order by email asc"
                } else if (keyName == 'Email' && valueName == 'desc') {
                    query = query + "order by email desc"
                }
            }else if(keyName == 'EmployeeId'){
                if (keyName == 'EmployeeId' && valueName == 'asc') {
                    query = query + "order by e.employeeId asc"
                } else if (keyName == 'EmployeeId' && valueName == 'desc') {
                    query = query + "order by e.employeeId desc"
                }
            }else if(keyName == 'organizationName'){
                if (keyName == 'organizationName' && valueName == 'asc') {
                    query = query + "order by organizationName asc"
                } else if (keyName == 'LastName' && valueName == 'desc') {
                    query = query + "order by organizationName desc"
                }
            }

        }

        let queryObj
        if (limit > 0 && offset >= 0) {
            queryObj = query + " limit " + offset + "," + limit + "";
        }
        else {
            queryObj = query
        }

        console.log("query::", queryObj)
        return new Promise(function (resolve, reject) {
            return db.sequelize.query(queryObj).then(function (result) {
                if (result[0].length > 0) {
                    // console.log("length of data ::",result[0].length)
                    //return resolve(result[0]);
                    let data = {}
                    data.Count = result[0][0].NoOfCount
                    data.data = result[0]
                    for (var i = 0; i < data.data.length; i++) {
                        delete data.data[i].NoOfCount
                    }
                    //console.log("result ::",data)
                    return resolve(data);
                } else {
                    return reject(404).send("Not found")
                }
            })
        });
    },

}
