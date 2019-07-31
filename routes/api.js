/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

const expect = require('chai').expect;
const MongoClient = require('mongodb');
const ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      const query = req.query;
    
      let lookFor = Object.keys(query).reduce((obj, k) =>{
        if(query[k] !== '') obj[k] = query[k];
        return obj;
      }, {});
    
      if(lookFor.open === 'false') lookFor.open = false;
      if(lookFor.open === 'true') lookFor.open = true;
      if(lookFor.hasOwnProperty('_id')) lookFor._id = ObjectId(lookFor._id);
    
      MongoClient.connect(CONNECTION_STRING, (err, db) =>{
        db.collection(project).find(lookFor).toArray((err, docs) =>{
          if(err) return;
          res.json(docs);
          
          db.close();
        });
      });
    })
    
    .post(function (req, res){
      let project = req.params.project;
      const body = req.body;
      const newEntry = {
        issue_title: body.issue.title,
        issue_text: body.issue.text,
        created_by: body.created_by,
        created_on: new Date(),
        updated_on: new Date(),
        assigned_to: body.assigned_to || '',
        status_text: body.status_text || '',
        open: true
      }
      
      if(body.issue_title === undefined || (body.isuue_text === undefined || body.created_by === undefined)) return res.type('text').send('missing inputs')
    
      MongoClient.connect(CONNECTION_STRING, (err, db) =>{
        db.collection(project).insertOne(newEntry, (err, docs) =>{
          if(err) res.json(err);
          res.json(docs.ops[0]);
          
          db.close();
        });
      });
    })
    
    .put(function (req, res){
      let project = req.params.project;
      const _id = req.body._id;
      
      try{
        ObjectId(_id);
      } catch(err){
        return res.type('text').send('Could not update' + _id);
      }
    
      const body = req.body;
      let updatedEntry = Object.keys(body).reduce((obj, k) =>{
        if(body[k] !== '' && k !== '_id') obj[k] = body[k];
        return obj;
    }, {});
    
      if(updatedEntry.open === 'false') updatedEntry.open = false;
      if(updatedEntry.open === 'true') updatedEntry.open = true;
    
      if(Object.keys(updatedEntry).length > 0) updatedEntry.updated_on = new Date();
    
      MongoClient.connect(CONNECTION_STRING, (err, db) =>{
        db.collection(project).updateOne({_id: ObjectId(_id)}, {$set: updatedEntry}, (err, docs) =>{
          if(err){
            db.close();
            if(Object.keys(updatedEntry).length === 0) return res.type('text').send('No updated field sent');
          }
          
          if(docs.result.n === 0){
            res.type('text').send('Successfully updated');
          } else{
            res.type('text').send('Successfully updated');
          }
          db.close();
        });
      });
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      const _id = req.body._id;
    
      if(_id === undefined) return res.type('text').send('_id error');
      
      try{
        ObjectId(_id)
      } catch(err){
        return res.type('text').send('_id error');
      }
    
      MongoClient.connection(CONNECTION_STRING, (err, db) =>{
        db.collection(project).findOneAndDelete({_id: ObjectId(_id)}, (err, docs) =>{
          if(err){
            db.close();
            res.type('text').send('Could not delete ' + _id);
          }
          if(docs.value === null){
            res.type('text').send('Deleted ' + _id);
          } else {
            res.type('text').send('Deleted ' + _id);
          }
          db.close();
      })  
    })
  });
    
};
