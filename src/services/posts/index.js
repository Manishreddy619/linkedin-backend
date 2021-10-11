import express from 'express'
import postModel from './schema.js'
import createHttpError from 'http-errors'

const posts=express.Router()

posts.get('/',async(req,res,next)=>{
    try {
        const posts=await postModel.find()
        res.send(posts)
    } catch (error) {
        next(error)
    }
})
posts.post('/',async(req,res,next)=>{
    try {
        const newPost=new postModel(req.body)
        const{_id}=await newPost.save()
        res.send(_id)
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

export default posts