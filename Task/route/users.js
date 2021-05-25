var express = require('express');
var router = express.Router();
var userService = require('../service/users-service');
var {verifyAccessToken,verifyUser}=require('../utilities/commonUtil')

//registration
router.post('/registerUser', (req, res) => {
    console.log("route req::",req.body)
    userService.addUsers(req).then((result) => {
        res.status(200).send(result);
    }, (err) => {
        res.status(500).send(err);
    });
}, (err) => {
    res.status(500).send(err);
});

//login
router.post('/loginUser', (req, res) => {
    userService.getloginIdPass(req).then((result) => {
        res.status(200).send(result);
    }, (err) => {
        res.status(500).send(err);
    });
}, (err) => {
    res.status(500).send(err);
});

//user list with searching, filter, pagination, sorting
router.get('/userList', verifyAccessToken, (req, res) => {
    verifyUser(req).then((verifyUserResult) => {
        if (verifyUserResult) {
            console.log("in route::")
            userService.getUserList(verifyUserResult).then((result) => {
                res.status(200).send(result)
            }, (err) => {
                res.status(401).send(err);
            })
        } else {
            res.status(401);
        }
    }, (err) => {
        res.status(401).send(err);
    });
}, (err) => {
    res.status(500).send(err);
})

module.exports = router;