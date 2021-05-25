require('dotenv').config()
var nodemailer = require('nodemailer');
const JWT = require('jsonwebtoken')
const { verify } = require('jsonwebtoken');
var db = require("../config/databaseConnection");

module.exports = {
    verifyAccessToken: (req, res, next) => {
        console.log("in verify token ::")
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        console.log("token..", token)
        if (token) {
            verify(token, process.env.JWT_SECRET, (err, payload) => {
                console.log("payload ::", payload)
                if (err) {
                    if (err.name === 'JsonWebTokenError') {
                        res.status(401).send(err.message)
                    } else {
                        res.status(401).send(err.message)
                    }
                } else {
                    req.payload = payload
                    next();
                }
            })
        } else {
            res.status(401).send("Access denied!")
        }
    },

    //check id from token and used same  
    verifyUser: (req) => {
        return new Promise((resolve, reject) => {
            if (req.headers && req.headers.authorization) {
                var authorization = req.headers.authorization.split(' ')[1],
                    decoded;
                try {
                    decoded = verify(authorization, process.env.JWT_SECRET);
                } catch (e) {
                    console.log("unauthorized in catch")
                    reject("Unauthorized").send(401)
                }
                var userId = decoded.id;
                db.users.findOne({ where: { id: userId} }).then((userRes) => {
                        if (userRes) {
                            req.id = userRes.dataValues.id
                            resolve(req)
                        }
                        else {
                            reject("Unauthorized").send(401)
                        }
                   
                }, (err) => {
                    reject(err).send(500)
                })

            } else {
                reject("Access denied!").send(406)
            }
        })
    },

    paginate: function (req) {
        console.log("in util file..")
        var page = parseInt(req.query.pageNumber);
        var size = parseInt(req.query.pageSize);
        //var limit;
        //var offset;
        //console.log("Utill..", page, size);
        let paginateObj;
        if (!page && !size) {
            paginateObj = {
                "limit": 0,
                "offset": 0
                //offset:0
            }
        }
        else {
            paginateObj = {
                "limit": 1 * size,
                "offset": (page - 1) * size
                //offset:(page-1)*limit
            }
        }
        console.log("utill paginate Obj..", paginateObj);
        return paginateObj;
    },
}
