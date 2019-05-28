
const mongoose = require('mongoose');
const port = process.env.PORT || 3000;

const Product = require('../models/product');
const model_name = Product.model_name;
const model_docs = Product.model_docs;

//ss We can define debuggers with custom names, which will do "console.log" job (same functionality) for specific cases.
// For example when we wanna console-log
// 1. only errors, then we can define env variable as DEBUG=err
// 2. doc & docs results, then we can define DEBUG=doc,docs
// 3. all, then we can define DEBUG=*
// And after that run node (for us: npm start).
// Also we can run node with debug variable(s) at same time like this (example for us),
// DEBUG=doc,err npm start
// which will flush env DEBUG initialized value(s) after stopping the node
const errorDebugger = require('debug')('err');
const docDebugger = require('debug')('doc');
const docsDebugger = require('debug')('docs');
const fileDebugger = require('debug')('file');
// Note: that we can define env variables like this:
// export DEBUG=err // UNIX (Mac & Linux)
// set DEBUG=err // Windows


exports.get_products = (req, res, next) => {
    Product.find()
        .select('name price image _id')
        // .exec()
        .then(docs => {
            docsDebugger(docs); // console.log(docs);

            const response = {
                count: docs.length,
                items: docs.map(doc => {
                    return {
                        name: doc.name,
                        price: doc.price,
                        image: doc.image,
                        _id: doc._id,
                        request: {
                            description: 'get_' + model_name,
                            type: 'GET',
                            url: 'http://localhost:' + port + '/' + model_docs + '/' + doc._id,
                            body: {}
                        },
                    }
                })
            };

            // if(docs.length >= 0) {
            res.status(200).json({
                success: true,
                message: 'Got ' + model_docs,
                data: response
            });
            // } else {
            //     res.status(403).json({
            //         success: true,
            //         message: "Have not any item there.",
            //     });
            // }
        })
        .catch(err => {
            errorDebugger(err); // console.log(err);
            res.status(500).json({
                success: false,
                message: err
            });
        });
};

exports.get_product = (req, res, next) => {
    const itemId = req.params.itemId;
    Product.findById(itemId)
        .select('name price image _id')
        // .exec()
        .then(doc => {
            docDebugger(doc); // console.log(doc);

            if(doc) {
                // res.status(200).json(doc);
                res.status(200).json({
                    success: true,
                    message: "Found Data.",
                    data: doc,
                    request: {
                        description: 'update_' + model_name,
                        type: 'PATCH',
                        url: 'http://localhost:' + port + '/' + model_docs + '/' + itemId,
                        body: {
                            name: 'String',
                            price: 'Number',
                            image: 'Image'
                        }
                    }
                });
            } else {
                return res.status(403).json({
                    success: false,
                    message: model_name + ' not found!',
                });
            }
        })
        .catch(err => {
            errorDebugger(err); // console.log(err);
            res.status(500).json({
                success: false,
                message: err
            });
        });
};

exports.create_product = (req, res, next) => {

    fileDebugger(req.file); // console.log(req.file);

    const createdItem = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        image: req.file.path
    });

    createdItem.save()
        .then(result => {
            docDebugger(result); // console.log(result);

            res.status(201).json({
                success: true,
                message: "Item was successfully created!",
                data: {
                    name: result.name,
                    price: result.price,
                    image: result.image,
                    _id: result._id,
                    request: {
                        description: 'delete_' + model_name,
                        type: 'DELETE',
                        url: 'http://localhost:' + port + '/' + model_docs + '/' + result._id,
                        body: {}
                    }
                }
            });
        })
        .catch(err => {
            errorDebugger(err); // console.log(err);
            res.status(500).json({
                success: false,
                message: err
            });
        });
};

exports.delete_product = (req, res, next) => {
    const itemId = req.params.itemId;
    Product.remove({
        _id: itemId
    })
    // .exec()
        .then(result => {
            res.status(200).json({
                success: true,
                message: "Item successfully deleted.",
                data: result,
                request: {
                    description: 'create_' + model_name,
                    type: 'POST',
                    url: 'http://localhost:' + port + '/' + model_docs,
                    body: {
                        name: 'String',
                        price: 'Number',
                        image: 'Image'
                    }
                }
            });
        })
        .catch(err => {
            errorDebugger(err); // console.log(err);
            res.status(500).json({
                success: false,
                message: err
            });
        });
};

exports.update_product = (req, res, next) => {
    const itemId = req.params.itemId;
    const updateOps = {};

    for(let key in req.body){
        updateOps[key] = req.body[key];
    }

    Product.update({ _id: itemId }, { $set: updateOps })
    // .exec()
        .then(result => {
            res.status(200).json({
                success: true,
                message: "Item successfully updated.",
                data: result,
                request: {
                    description: 'create_' + model_name,
                    type: 'POST',
                    url: 'http://localhost:' + port + '/' + model_docs,
                    body: {
                        name: 'String',
                        price: 'Number',
                        image: 'Image'
                    }
                }
            });
        })
        .catch(err => {
            errorDebugger(err); // console.log(err);
            res.status(500).json({
                success: false,
                message: err
            });
        });
};
