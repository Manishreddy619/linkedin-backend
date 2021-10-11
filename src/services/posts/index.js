import express from 'express'
import postModel from './schema.js'
import createHttpError from 'http-errors'
import profileModel from '../profiles/profileSchema.js'
import q2m from 'query-to-mongo'
import multer from 'multer'
import {v2 as cloudinary} from 'cloudinary'
import {CloudinaryStorage} from 'multer-storage-cloudinary'
import commentModel from './commentSchema.js'

const posts=express.Router()
const{CLOUDINARY_NAME,CLOUDINARY_KEY,CLOUDINARY_SECRET}=process.env
cloudinary.config({
    cloud_name:CLOUDINARY_NAME,
    api_key:CLOUDINARY_KEY,
    api_secret:CLOUDINARY_SECRET
})
const storage=new CloudinaryStorage({cloudinary,params:{folder:'posts'}})

posts.post('/',async(req,res,next)=>{
    try {
        const profile=await profileModel.findOne({username:req.body.username})
        if(profile){
            const{text,username,image,user}=req.body
            const myObj= {
                text,username,image,
                user:profile
            }
            const post= new postModel(myObj)
            const{_id}=await post.save()
            res.send(_id)
        }else{
            next(createHttpError(404,`PROFILE NAMED ${req.body.username} NOT FOUND`))
        }
    } catch (error) {
        next(error)
    }
})
posts.get('/',async(req,res,next)=>{
    try {
        const mQ=q2m(req.query)
        const totalPosts=await postModel.countDocuments(mQ.criteria)
        const posts=await postModel
            .find(mQ.criteria,mQ.options.fields)
            .sort(mQ.options.sort)
            .skip(mQ.options.skip)
            .limit(mQ.options.limit||10).sort(mQ.options.sort)
        res.send({links:mQ.links('/posts',totalPosts),totalPosts,pageTotal:Math.ceil(totalPosts/mQ.options.limit),posts})
    } catch (error) {
        next(error)
    }
})
posts.get('/:postId',async(req,res,next)=>{
    try {
        const postId=req.params.postId
        const post=await postModel.findById(postId)
        if(post){
            res.send(post)
        }else{
            next(createHttpError(404,`POST ID${postId} NOT FOUND`))
        }
    } catch (error) {
        next(error)
    }
})
posts.put('/:postId',async(req,res,next)=>{
    try {
        const postId=req.params.postId
        const modifiedPost=await postModel.findByIdAndUpdate(postId,req.body,{new:true})
        if(modifiedPost){
            res.send(modifiedPost)
        }else{
            next(createHttpError(404,`POST ID${postId} NOT FOUND`))
        }

    } catch (error) {
        next(error)
    }
})
posts.delete('/:postId',async(req,res,next)=>{
    try {
        const postId=req.params.postId
        const deletedPost=await postModel.findByIdAndDelete(postId)
        if(deletedPost){
            res.send([`POST ID${postId} IS GONE`,deletedPost])
        }else{
            next(createHttpError(404,`POST ID${postId}NOT FOUND`))
        }
    } catch (error) {
        next(error)
    }
})
// UPLOAD AN IMAGE FILE
posts.post('/:postId',multer({storage:storage}).single('post'),async(req,res,next)=>{
    try {
        const postId=req.params.postId
        const postWithImage=await postModel.findByIdAndUpdate(postId,{image:req.file.path},{new:true})
        if(postWithImage){
            res.send(postWithImage)
        }else{
            next(createHttpError(404,`POST ID${postId}NOT FOUND`))
        }
    } catch (error) {
        next(error)
    }
})
// EXTRA CREATIVE: GET USER WITH THE POSTS (in normal get I'm retriving POSTS with USER OBJ nested inside)
posts.get('/:userName/userwithposts',async(req,res,next)=>{
    try {
        const user=await profileModel.find({username:req.params.userName})
        if(user==!undefined){
            const posts=await postModel.find({username:req.params.userName},'text username image createdAt updatedAt')
            const userAndPosts={user,posts}
            res.send(userAndPosts)
        }else{
            next(createHttpError(404,`USER NAMED ${req.params.userName} NOT FOUND`))
        }
    } catch (error) {
        next(error)
    }
})
// COMMENTS
posts.post('/:postId/comment',async(req,res,next)=>{
    try {
        const post=await postModel.findById(req.params.postId)
        if(post){
            const{comment}=req.body
            const commentWithInfo={
                comment,
                postWithUser:post // BECAUSE OUR POSTS CONTAIN USER INFO YET !
            }
            const newComment=new commentModel(commentWithInfo)
            const{_id}=await newComment.save()
            res.send(newComment)
        }else{
            next(createHttpError(404,`POST WITH ID${req.params.postId} NOT FOUND`))
        }
    } catch (error) {
        next(error)
    }
})
posts.get('/:postId/comment',async(req,res,next)=>{
    try {
        const postId=req.params.postId
        const post=await postModel.findById(postId)
        const username=post.username
        const comments=await commentModel.find({'postWithUser.user.username':username})
        res.send(comments)
    } catch (error) {
        next(error)
    }
})
posts.put('/:postId/comment/:commentId',async(req,res,next)=>{
    try {
        const commentId=req.params.commentId
        const modifiedComment=await commentModel.findByIdAndUpdate(commentId,req.body,{new:true})
        if(modifiedComment){
            res.send(modifiedComment)
        }else{
            next(createHttpError(404,`COMMENT ID${commentId} NOT FOUND`))
        }
    } catch (error) {
        next(error)
    }
})
posts.delete('/:postId/comment/:commentId',async(req,res,next)=>{
    try {
        const commentId=req.params.commentId
        const deletedComment=await commentModel.findByIdAndDelete(commentId)
        if(deletedComment){
            res.send([`COMMENT ID${commentId} IS GONE`,deletedComment])
        }else{
            next(createHttpError(404,`COMMENT ID${commentId} NOT FOUND`))
        }
    } catch (error) {
        next(error)
    }
})

export default posts