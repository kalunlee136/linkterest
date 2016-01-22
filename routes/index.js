var passport = require('passport');
var jwt = require('express-jwt');
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});
var User = require('../models/Users')
var Link = require('../models/Links')

var Links = [
      {title:'eyy lmao', url:'http://i.imgur.com/IPzHxpb.gif',upvotes:3,user:'kalun lee'},
      {title:'rofl lmao', url:'http://i.imgur.com/dFtL4Ok.gif',upvotes:7,user:'bobby jones'},
      {title:'zeyy lmao', url:'http://i.imgur.com/IPzHxpb.gif',upvotes:3,user:'davy jones'},
      {title:'u wat m8', url:'http://i.imgur.com/5OM9gas.jpg',upvotes:7,user:'vlad putin'}
    ];

module.exports = function(app){
    /* GET home page. */
    app.get('/', function(req, res, next) {
      res.render('index');
    });
    
    //assigns req.link with the link we are looking for in the req received from client
    app.param('link',function(req,res,next,id){
      var query = Link.findById(id);
      
      query.exec(function(err,link){
        if(err) next(err);
        
        req.link = link;
        return next();
      });
    });
    
    //returns all links 
    app.get('/links', function(req, res, next) {
      
      Link.find(function(err,links){
        res.json(links);
      });
      
    });
    
    //create new links
    app.post('/links',function(req,res,next){
      var link = new Link(req.body);
      
      link.save(function(err,link){
        if(err){return next(err);}
        
        res.json(link)
      });
    });
    
    //upvotes links
    app.put('/links/:link/upvote',function(req,res,next){
      req.link.upvote(function(err, link){
        if (err) { return next(err); }
        
        res.json(link);
      });
    });
    
    app.get('/links/:link/favorite', auth, function(req,res,next){
      User.findById(req.payload._id,function(err,user){
        user.populate('favorites',function(err,user){
          console.log('/links/:link/favorite');
          console.log(user);
          res.json(user);
        })
      });
    });
    //favorite links
    app.put('/links/:link/favorite', auth, function(req,res,next){
      User.findById(req.payload._id,function(err,user){
          console.log(user);
          user.favorites.push(req.link._id)
          
          req.link.upFavorite(function(err, link){
              if (err) { return next(err); }
              
          });
            
          user.save(function(err,user){
            
            res.json(user);
          });
          
      });
    

    })
    //returns all of a user's links.
    //used for current user's profile and for viewing anoth user's page
    app.get('/links/:user',function(req,res,next){

      var query = Link.find({user_id:req.params.user})
      query.exec(function(err,links){
        if(err){return next(err);}
        
        res.json(links);
      })
      
    });
    
    //delete the logged-in user's links
    app.delete('/users/links/:link',function(req,res){

      Link.remove({_id:req.link._id},function(err,link){
       
        Link.find(function(err,links){
          res.json(links)
        })
        
      })
    
    });
   
    app.post('/register', function(req, res, next){
      if(!req.body.username || !req.body.password){
        return res.status(400).json({message: 'Please fill out all fields'});
      }
      
      console.log(req.body)
      var user = new User();
    
      user.username = req.body.username;
    
      user.setPassword(req.body.password)
    
      user.save(function (err){
        if(err){ return next(err); }
    
        return res.json({token: user.generateJWT()})
      });
    });
    
    app.post('/login', function(req, res, next){
      if(!req.body.username || !req.body.password){
        return res.status(400).json({message: 'Please fill out all fields'});
      }
    
      passport.authenticate('local', function(err, user, info){
        if(err){ return next(err); }
    
        if(user){
          return res.json({token: user.generateJWT()});
        } else {
          return res.status(401).json(info);
        }
      })(req, res, next);
    });
}

