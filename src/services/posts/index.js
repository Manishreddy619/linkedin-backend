import express from 'express'
import postModel from './schema.js'
import createHttpError from 'http-errors'
import profileModel from '../profiles/profileSchema.js'
//import q2m from 'query-to-mongo'
import multer from 'multer'
import {v2 as cloudinary} from 'cloudinary'
import {CloudinaryStorage} from 'multer-storage-cloudinary'

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
        }
    } catch (error) {
        next(error)
    }
})
posts.get('/',async(req,res,next)=>{
    try {
        const posts=await postModel.find()
        res.send(posts)
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
        res.send(postWithImage)
    } catch (error) {
        next(error)
    }
})
// EXTRA: GET USER WITH THE POSTS (in normal get I'm retriving POSTS with USER OBJ nested inside)
posts.get('/:userName/userwithposts',async(req,res,next)=>{
    try {
        //const username=req.params.userName
        const user=await profileModel.find({username:req.params.userName})
        const posts=await postModel.find({username:req.params.userName},'text username image createdAt updatedAt')
        const userAndPosts={user,posts}
        res.send(userAndPosts)
    } catch (error) {
        next(error)
    }
})


export default posts