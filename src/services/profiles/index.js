import express from "express";

import experience from "./experienceSchema.js";
import profile from "./profileSchema.js";
import createHttpError from "http-errors";
import profileModel from "./profileSchema.js";

const profileRouter = express.Router();

profileRouter.post("/:userName/experiences", async (req, res, next) => {
  try {
    console.log(req.params);
    const users = await profile.find();

    if (users) {
      const user = users.find((usr) => usr.username === req.params.userName);
      if (user) {
        const myobj = { username: req.params.userName };
        const expe = new experience({ ...req.body, ...myobj });
        const newExp = await expe.save();
        res.status(201).send(newExp);
      }
    }
    // if (getPName) {
    //   const user = { ...getPName.toObject() };
    //   const user_name = user.find((user) => user.username);
    //   const exp = await experience.create(req.body, {
    //     $push: { userName: user_name },
    //   });
    //   res.status(201).send(exp);
    // } else {
    //   res
    //     .status(401)
    //     .send(`the profile name with ${req.params.userName} was not found.`);
    // }
  } catch (error) {
    console.log(error);
  }
});
profileRouter.get("/:userName/experiences", async (req, res, next) => {
  try {
    const getPName = await experience.find();
    if (getPName) {
      const user = getPName.find((usr) => usr.username === req.params.userName);
      if (user) {
        res.status(201).send(getPName);
      } else {
        next(
          createHttpError(
            404,
            `user with username ${req.params.userName} not found!`
          )
        );
      }
    } else {
      res
        .status(401)
        .send(`the profile name with ${req.params.userName} was not found.`);
    }
  } catch (error) {
    next(error);
  }
});
profileRouter.get("/:userName/experiences/:exId", async (req, res, next) => {
  try {
    const getPName = await profile.find();
    if (getPName) {
      const user = getPName.find((usr) => usr.username === req.params.userName);

      if (user) {
        const exp = await experience.findById(req.params.exId);
        if (exp) {
          res.status(200).send(exp);
        }
      } else {
        res.send(`experience id with ${req.params.exId} not found`);
      }
    } else {
      res
        .status(401)
        .send(`the profile name with ${req.params.userName} was not found.`);
    }
  } catch (error) {
    console.log(error);
  }
});
profileRouter.put("/:userName/experiences/:exId", async (req, res, next) => {
  try {
    const getPName = await profile.find();
    if (getPName) {
      const user = getPName.find((usr) => usr.username === req.params.userName);

      if (user) {
        const updateExp = await experience.findByIdAndUpdate(
          req.params.exId,
          req.body,
          { new: true }
        );
        if (updateExp) {
          res.status(200).send(updateExp);
        }
      } else {
        res.send(`experience id with ${req.params.exId} not found`);
      }
      // const getPName = await profile.findById(req.params.userName);
      // if (getPName) {
      //   const updateExperience = await experience.findByIdAndUpdate(
      //     req.params.exId,
      //     req.body,
      //     { new: true }
      //   );

      //   res.status(201).send(updateExperience);
    } else {
      res
        .status(401)
        .send(`the profile name with ${req.params.userName} was not found.`);
    }
  } catch (error) {
    console.log(error);
  }
});
profileRouter.delete("/:userName/experiences/:exId", async (req, res, next) => {
  try {
    const getUser = await profile.find();
    if (getUser) {
      const user = getUser.find((usr) => usr.username === req.params.userName);
      if (user) {
        const delExp = await experience.findByIdAndDelete(req.params.exId);
        res.send("exp deleted");
      }
    }
  } catch (error) {}
});

profileRouter.post("/", async (req, res, next) => {
  try {
    const newprofile = new profileModel(req.body);
    const { _id } = await newprofile.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

profileRouter.get("/", async (req, res, next) => {
  try {
    const profile = await profileModel.find();
    res.send(profile);
  } catch (error) {
    next(error);
  }
});

profileRouter.get("/:userId", async (req, res, next) => {
  try {
    const eachprofile = await profileModel.findById(req.params.userId);
    if (eachprofile) res.send(eachprofile);
    else
      next(
        createHttpError(
          404,
          `profile with id ${req.params.userId} is not found`
        )
      );
  } catch (error) {
    next(error);
  }
});

profileRouter.put("/:userId", async (req, res, next) => {
  try {
    const updatedprofile = await profileModel.findByIdAndUpdate(
      req.params.userId,
      req.body,
      { new: true }
    );
    if (updatedprofile) res.send(updatedprofile);
    else
      next(
        createHttpError(404, `profile with id ${req.params.id} is not found`)
      );
  } catch (error) {
    next(error);
  }
});

profileRouter.delete("/:userId", async (req, res, next) => {
  try {
    const removeprofile = await profileModel.findByIdAndDelete(
      req.params.userId
    );
    if (removeprofile)
      res.status(204).send({ message: "Profile deleted successfully" });
    else
      next(
        createHttpError(
          404,
          `profile with id ${req.params.userId} is not found`
        )
      );
  } catch (error) {
    next(error);
  }
});
export default profileRouter;
