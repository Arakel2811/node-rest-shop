
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const bcrypt = require('bcrypt');

const User = require('../models/user');
const model_name = User.model_name;
const model_docs = User.model_docs;

// REGISTER
router.post('/register', (req, res, next) => {

    // check if user already exists with entered email
    let email = req.body.email;

    User.find({ email: email })
        // .exec() // for getting back a promise
        .then(user => { // don't forget that user is a mongo document
            if (user.length > 0) {
                res.status(409).json({ // 409 - conflict OR 422 - unprocessable entity
                    success: false,
                    message: 'Already have a user with entered email!'
                });
            } else {
                bcrypt.hash(req.body.password, 10, function(err, hashed_password) {
                    if(err) {
                        console.log(err);
                        res.status(500).json({
                            success: false,
                            message: 'Don\'t have a password, we can\'t safely hash and store it!'
                        });
                    } else {
                        // we have a hashed password
                        // Store hash in your password DB.

                        const createdItem = new User({
                            _id: new mongoose.Types.ObjectId(),
                            name: req.body.name,
                            email: email,
                            password: hashed_password
                        });

                        createdItem.save()
                            .then(result => {
                                console.log(result);

                                res.status(201).json({
                                    success: true,
                                    message: "Successfully registered!",
                                    data: {
                                        name: result.name,
                                        email: email, // result.email,
                                        _id: result._id,
                                    }
                                });
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({
                                    success: false,
                                    message: err
                                });
                            });
                    }
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                success: false,
                message: err
            });
        });

});

// LOGIN
router.post('/login', (req, res, next) => {

    let email = req.body.email;

    // also we can use findOne() for getting only first doc
    User.find({ email: email })
    // .exec() // for getting back a promise
        .then(user => { // don't forget that user is a mongo document
            if (user.length > 0) { // for findOne() we just need to use if(user)

                // the issue of this approach (commented in below), that we open our app to some kind of brute force attack
                // users can just try out email addresses, and they will at least find out which ones are there and which ones are not
                // so once they got a list of available email addresses, they could focus on this

                // res.status(422).json({ // 422 - unprocessable entity
                //     success: false,
                //     message: 'User doesn\'t exist!'
                // });

                // for findOne() we just need to use user.password
                bcrypt.compare(req.body.password, user[0].password,  (err, result) => {
                    if(err) {
                        // thrown some error
                        return res.status(401).json({ // 401 - unauthorized
                            success: false,
                            message: 'Auth failed!'
                        });
                    }

                    if (result) {
                        // email and password match (successfully login case)
                        res.status(200).json({
                            success: true,
                            message: 'Auth successful.',
                        });
                    } else {
                        // wrong password
                        res.status(401).json({ // 401 - unauthorized
                            success: false,
                            message: 'Auth failed!'
                        });
                    }
                });

            } else {
                // have not found user with entered email
                res.status(409).json({ // 409 - conflict
                    success: false,
                    message: 'Auth failed!'
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                success: false,
                message: err
            });
        });

});

// DELETE USER
router.delete('/:userId', (req, res, next) => {
    const itemId = req.params.itemId;
    User.remove({ _id: itemId })
        .then(result => {
            res.status(200).json({
                success: true,
                message: 'User deleted.',
                data: result
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                success: false,
                message: err
            });
        });
});

// EXPORTING
module.exports = router;