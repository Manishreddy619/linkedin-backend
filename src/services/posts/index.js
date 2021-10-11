import express from 'express'
import postModel from './schema.js'
import createHttpError from 'http-errors'
import profileModel from '../profiles/profileSchema.js'
import q2m from 'query-to-mongo'

const posts=express.Router()

posts.get('/',async(req,res,next)=>{
    try {
        //const mQ=q2m(req.query)
        const posts=await postModel.find()
            //mQ.criteria,mQ.options.fields).populate({path:'user'})
        res.send(posts)
    } catch (error) {
        next(error)
    }
})
posts.post('/',async(req,res,next)=>{
    try {
        const profile=await profileModel.findOne({username:req.body.username})
        console.log(profile)
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

export default posts