import express from "express"
import createHttpError from "http-errors"
import profileModel from "./profileSchema.js"

const profileRouter = express.Router()

profileRouter.post('/', async(req,res,next) =>{
    try {
        const newprofile = new profileModel(req.body)
        const { _id } = await newprofile.save()
        res.status(201).send({ _id })
    } catch (error) {
        next(error)
        
    }
})

profileRouter.get('/', async(req,res,next)  =>{
    try {
        const profile = await profileModel.find()
        res.send(profile)
    } catch (error) {
        next(error)
        
    }
})

profileRouter.get('/:userId', async(req,res,next)  =>{
    try {
        const eachprofile = await profileModel.findById(req.params.userId)
        if(eachprofile) res.send(eachprofile)
        else next(createHttpError(404, `profile with id ${req.params.userId} is not found`))
    } catch (error) {
        next(error)
        
    }
})

profileRouter.put('/:userId', async(req,res,next)  =>{
    try {
        const updatedprofile = await profileModel.findByIdAndUpdate(req.params.userId, req.body, {new: true})
        if(updatedprofile) res.send(updatedprofile)
        else next(createHttpError(404, `profile with id ${req.params.id} is not found`))
    } catch (error) {
        next(error)
        
    }
})

profileRouter.delete('/:userId', async(req,res,next)  =>{
    try {
        const removeprofile = await profileModel.findByIdAndDelete(req.params.userId)
        if(removeprofile) res.status(204).send({message:"Profile deleted successfully"})
        else next(createHttpError(404, `profile with id ${req.params.userId} is not found`))
    } catch (error) {
        next(error)
        
    }
})

export default profileRouter