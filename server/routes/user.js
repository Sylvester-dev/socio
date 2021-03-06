const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const requireLogin = require('../middleware/requireLogin')
const Post = mongoose.model("Post")
const User = mongoose.model("User")

router.get('/user/:id',requireLogin,(req,res)=>{
  User.findOne({_id:req.params.id})          //finding detail of the user
  .select("-password")                    //we need all detail except password
  .then(user=>{                         //finding post created by the user  m                                                 
    Post.find({postedBy:req.params.id})
    .populate("postedBy","_id name")
    .exec((err,posts)=>{
      if(err){
        return res.status(422).json({error:err})
      }
      res.json({user,posts})
    })
  }).catch(err=>{
    return res.status(404).json({error:"User not found"})
  })
})


router.put('/follow',requireLogin,(req,res)=>{
  User.findByIdAndUpdate(req.body.followId,{
      $push:{followers:req.user._id}
  },{
      new:true
  },(err,result)=>{
      if(err){
          return res.status(422).json({error:err})
      }
    User.findByIdAndUpdate(req.user._id,{
        $push:{following:req.body.followId}
        
    },{new:true}).select("-password").then(result=>{
        res.json(result)
    }).catch(err=>{
        return res.status(422).json({error:err})
    })

  }
  )
})


router.put('/unfollow',requireLogin,(req,res)=>{
  User.findByIdAndUpdate(req.body.unfollowId,{
      $pull:{followers:req.user._id}
  },{
      new:true
  },(err,result)=>{
      if(err){
          return res.status(422).json({error:err})
      }
    User.findByIdAndUpdate(req.user._id,{
        $pull:{following:req.body.unfollowId}
        
    },{new:true}).select("-password").then(result=>{
        res.json(result)
    }).catch(err=>{
        return res.status(422).json({error:err})
    })

  }
  )
})

router.put('/updatepic',requireLogin,(req,res)=>{
   User.findByIdAndUpdate(req.user._id,{$set:{pic:req.body.pic}},{new:true},(err,result)=>{
     if(err){
       return res.status(422).json({error:"Cant post Pic"})
     }
     res.json(result)
   })
})

module.exports = router