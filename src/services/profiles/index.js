import experience from "./experienceSchema.js";
// import profile from "./profileSchema.js";
import express from "express";
//sdnsldcn
const experienceRoutes = express.Router();

experienceRoutes.post("/:profileName/experiences", async (req, res, next) => {
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
experienceRoutes.get("/:profileName/experiences", async (req, res, next) => {
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
experienceRoutes.get(
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
experienceRoutes.put(
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
experienceRoutes.delete(
  "/:profileName/experiences/:exId",
  async (req, res, next) => {}
);

export default experienceRoutes;
