


import express from "express";
//sdnsldcn
import experience from "./experienceSchema.js";
// import profile from "./profileSchema.js";
import createHttpError from "http-errors"
import profileModel from "./profileSchema.js"

const profileRouter = express.Router()

//const experienceRoutes = express.Router();

profileRouter.post("/:profileName/experiences", async (req, res, next) => {
  try {
    const getPName = await profile.findById(req.params.profileName);
    if (getPName) {
      const user = { ...getPName.toObject() };
      const exp = await experience.create(req.body, {
        $push: { userName: user.userName },
      });
      res.status(201).send(exp);
    } else {
      res
        .status(401)
        .send(`the profile name with ${req.params.profileName} was not found.`);
    }
  } catch (error) {
    console.log(error);
  }
});
profileRouter.get("/:profileName/experiences", async (req, res, next) => {
  try {
    const getPName = await profile.findById(req.params.profileName);
    if (getPName) {
      res.status(201).send(getPName);
    } else {
      res
        .status(401)
        .send(`the profile name with ${req.params.profileName} was not found.`);
    }
  } catch (error) {}
});
profileRouter.get(
  "/:profileName/experiences/:exId",
  async (req, res, next) => {
    try {
      const getPName = await profile.findById(req.params.profileName);
      if (getPName) {
        const getExperience = await experience.findById(req.params.exId);
        if (getExperience) {
          res.status(200).send(getExperience);
        } else {
          res.send(`experience id with ${req.params.exId} not found`);
        }
      } else {
        res
          .status(401)
          .send(
            `the profile name with ${req.params.profileName} was not found.`
          );
      }
    } catch (error) {
      console.log(error);
    }
  }
);
profileRouter.put(
  "/:profileName/experiences/:exId",
  async (req, res, next) => {
    try {
      const getPName = await profile.findById(req.params.profileName);
      if (getPName) {
        const updateExperience = await experience.findByIdAndUpdate(
          req.params.exId,
          req.body,
          { new: true }
        );

        res.status(201).send(updateExperience);
      } else {
        res
          .status(401)
          .send(
            `the profile name with ${req.params.profileName} was not found.`
          );
      }
    } catch (error) {
      console.log(error);
    }
  }
);
profileRouter.delete(
  "/:profileName/experiences/:exId",
  async (req, res, next) => {}
);

//export default experienceRoutes;





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
