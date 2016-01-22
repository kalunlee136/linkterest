var mongoose = require('mongoose');

var LinksSchema = new mongoose.Schema({
    title:String,
    url:String,
    upvotes:{type:Number, default:0},
    favorites:{type:Number, default:0},
    user:String,
    user_id:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

LinksSchema.methods.upvote = function(cb){
    this.upvotes += 1;
    this.save(cb);
}

LinksSchema.methods.downvote = function(cb){
    this.upvotes -= 1;
    this.save(cb);
}

LinksSchema.methods.upFavorite = function(cb){
    this.favorites += 1;
    this.save(cb);
}

module.exports = mongoose.model('Links',LinksSchema);