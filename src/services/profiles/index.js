import express from 'express';
import { validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import { parseFile } from '../cloudinary.js';
import { profileValidator } from './profileValidation.js';
import { fileIsRequired } from '../validationfileType.js';
import profileModel from './profileSchema.js';
import { getPdfReadableStream } from './pdf.js';
import { pipeline } from 'stream';
import json2csv from 'json2csv';
import experienceModel from './experienceSchema.js';

import fs from 'fs-extra';
const profileRouter = express.Router();

//const experienceRoutes = express.Router();

profileRouter.post('/:username/experiences', async (req, res, next) => {
	try {
		const users = await profileModel.find();
		if (users) {
			const getPname = users.find(
				(usr) => usr.username === req.params.username,
			);
			console.log(getPname);
			if (getPname) {
				const myObj = {
					...req.body,
					username: req.params.username,
				};

				const newExperience = new experienceModel(myObj);
				const exp = await newExperience.save();
				if (exp) {
					const userDetails = await profileModel.findByIdAndUpdate(
						getPname._id,
						{ $push: { experiences: exp } },
						{ new: true },
					);
					res.status(201).send(newExperience);
				}
			} else {
				res
					.status(401)
					.send(`the profile name with ${req.params.username} was not found.`);
			}
		}
	} catch (error) {
		console.log(error);
	}
});
profileRouter.get('/:username/experiences', async (req, res, next) => {
	try {
		const users = await profileModel.find();
		if (users) {
			const userExists = users.find(
				(usr) => usr.username === req.params.username,
			);
			if (userExists) {
				const userExperiences = await experienceModel.find();
				if (userExperiences) {
					const experiences = userExperiences.filter(
						(ex) => ex.username === req.params.username,
					);
					res.send(experiences);
				} else {
					res.send(`username  ${req.params.username} not found`);
				}
			} else {
				res.send(`username  ${req.params.username} not found`);
			}
		}
	} catch (error) {
		next(error);
	}
});
profileRouter.get('/:username/experiences/:exId', async (req, res, next) => {
	try {
		const getPName = await profileModel.find();
		if (getPName) {
			const user = getPName.find((usr) => usr.username === req.params.username);

			if (user) {
				const exp = await experienceModel.findById(req.params.exId);
				if (exp) {
					res.status(200).send(exp);
				}
			} else {
				res.send(`experience id with ${req.params.exId} not found`);
			}
		} else {
			res
				.status(401)
				.send(`the profile name with ${req.params.username} was not found.`);
		}
	} catch (error) {
		console.log(error);
	}
});
profileRouter.put(
	'/:username/experiences/:exId',
	fileIsRequired,
	async (req, res, next) => {
		try {
			const getPName = await profileModel.find();
			if (getPName) {
				const user = getPName.find(
					(usr) => usr.username === req.params.username,
				);

				if (user) {
					const myObj = {
						...req.body,
						username: req.params.username,
					};

					const updateExp = await experienceModel.findByIdAndUpdate(
						req.params.exId,
						myObj,
						{ new: true },
					);
					if (updateExp) {
						res.status(200).send(updateExp);
					}
				} else {
					res.send(`experience id with ${req.params.exId} not found`);
				}
			} else {
				res
					.status(401)
					.send(`the profile name with ${req.params.username} was not found.`);
			}
		} catch (error) {
			next(error);
		}
	},
);
profileRouter.delete('/:username/experiences/:exId', async (req, res, next) => {
	try {
		const getUser = await profileModel.find();
		if (getUser) {
			const user = getUser.find((usr) => usr.username === req.params.username);
			if (user) {
				const delExp = await experienceModel.findByIdAndDelete(req.params.exId);
				res.send('exp deleted');
			}
		}
	} catch (error) {
		next(error);
	}
});
profileRouter.post(
	'/:username/experiences/:exId/picture',
	parseFile.single('image'),
	fileIsRequired,
	async (req, res, next) => {
		try {
			const users = await profileModel.find();
			if (users) {
				const getPname = users.find(
					(usr) => usr.username === req.params.username,
				);
				console.log(getPname);
				if (getPname) {
					const myObj = { image: req.file.path };
					const experience = await experienceModel.findByIdAndUpdate(
						req.params.exId,
						myObj,
						{ new: true },
					);
					if (experience) {
						res.send(experience).status(201);
					} else {
						res
							.status(401)
							.send(`the profile name with ${req.params.exId} was not found.`);
					}
				} else {
					res
						.status(401)
						.send(
							`the profile name with ${req.params.username} was not found.`,
						);
				}
			}
		} catch (error) {
			next(error);
		}
	},
);
profileRouter.get(
	'/:username/experiences/download/csv',
	async (req, res, next) => {
		try {
			res.setHeader('Content-Disposition', `attachment; filename=books.csv`);

			const users = await profileModel.find();
			if (users) {
				const userExists = users.find(
					(usr) => usr.username === req.params.username,
				);
				if (userExists) {
					const userExperiences = await experienceModel.find();
					if (userExperiences) {
						const experiences = userExperiences.filter(
							(ex) => ex.username === req.params.username,
						);

						const source = JSON.stringify(experiences);
						const transform = new json2csv.Transform({
							fields: ['role', 'company', 'description', 'area', 'username'],
						});
						const destination = res;
						pipeline(source, transform, destination, (err) => {
							if (err) next(err);
						});
					} else {
						res.send(`username  ${req.params.username} not found`);
					}
				} else {
					res.send(`username  ${req.params.username} not found`);
				}
			}
		} catch (error) {
			next(error);
		}
	},
);

//export default experienceRoutes;
//------------------------------------------------------create users-------------------------------------
profileRouter.post('/', profileValidator, async (req, res, next) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			next(createHttpError(400, { message: errors }));
		} else {
			const { name, surname, email, bio, title, area, username } = req.body;
			const users = await profileModel.find();
			let userNameExists = users.find((user) => user.username === username);
			console.log(userNameExists?.username);
			if (userNameExists) {
				next(
					createHttpError(400, {
						message: 'username already exists try with another',
					}),
				);
			} else {
				const newUser = {
					name,
					surname,
					email,
					bio,
					title,
					area,
					username,
				};
				console.log(newUser);
				const newProfile = new profileModel(newUser);
				const { _id } = await newProfile.save();
				res.status(201).send(_id);
			}
		}
	} catch (error) {
		next(error);
	}
});
profileRouter.get('/', async (req, res, next) => {
	const users = await profileModel.find();

	res.json({ users: users }).status(200);
});

profileRouter.get('/:userId', async (req, res, next) => {
	try {
		const id = req.params.userId;
		const user = await profileModel.findById(id);
		// const experiences = await experienceModel.find();
		// const { username } = user;
		if (user) {
			res.send(user).status(200);
		} else {
			next(createHttpError(404, `user with id ${id} not found!`));
		}
	} catch (error) {
		next(error);
	}
});
profileRouter.put('/:userId', profileValidator, async (req, res, next) => {
	try {
		const id = req.params.userId;
		const user = await profileModel.findById(id);
		if (user) {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				next(createHttpError(400, { message: errors }));
			} else {
				const { name, surname, email, bio, title, area, username } = req.body;
				const users = await profileModel.find();
				const user = await profileModel.findById(id);
				const newUser = {
					...user.toObject(),
					name,
					surname,
					email,
					bio,
					title,
					area,
					username,
				};
				if (user.username === username) {
					const modifiedProfile = await profileModel.findByIdAndUpdate(
						id,
						newUser,
						{
							new: true,
						},
					);
					if (modifiedProfile) {
						res.send(modifiedProfile);
					} else {
						next(createHttpError(404, `user with id ${id} not found!`));
					}
				}
				if (user.username !== username) {
					let userNameExists = users.find((user) => user.username === username);

					if (userNameExists) {
						next(
							createHttpError(400, {
								message: 'username already exists try with another',
							}),
						);
					} else {
						const modifiedProfile = await profileModel.findByIdAndUpdate(
							id,
							newUser,
							{
								new: true,
							},
						);
						if (modifiedProfile) {
							res.send(modifiedProfile);
						} else {
							next(createHttpError(404, `user with id ${id} not found!`));
						}
					}
				}
			}
		} else {
			next(createHttpError(404, `user with id ${id} not found!`));
		}
	} catch (error) {
		next(error);
	}
});
profileRouter.delete('/:userId', async (req, res, next) => {
	try {
		const user = await profileModel.findByIdAndDelete(req.params.userId);
		res.send('deleted');
	} catch (error) {}
});

profileRouter.post(
	'/:userId/picture',
	parseFile.single('image'),
	fileIsRequired,
	async (req, res, next) => {
		try {
			const users = await profileModel.find();
			const idExists = users.find(
				(usr) => usr._id.toString() === req.params.userId.toString(),
			);
			console.log(idExists);
			if (idExists) {
				const user = await profileModel.findById(req.params.userId);

				if (user) {
					console.log(req.file.path);
					const myImg = { image: req.file.path };
					const updatedUser = { ...user, ...myImg };
					console.log(updatedUser);
					const modifiedProfile = await profileModel.findByIdAndUpdate(
						req.params.userId,
						updatedUser,
						{
							new: true,
						},
					);
					res.send(modifiedProfile);
				} else {
					next(createHttpError(404, `id not found ${req.params.userId}`));
				}
			} else {
				next(createHttpError(404, `id not found ${req.params.userId}`));
			}
		} catch (error) {
			next(error);
		}
	},
);
profileRouter.get('/:userId/cv', async (req, res, next) => {
	try {
		const users = await profileModel.find();
		const currentProfile = users.find(
			(user) => user._id.toString() === req.params.userId.toString(),
		);
		console.log(currentProfile);
		if (!currentProfile) {
			res
				.status(404)
				.send({ message: `blog with ${req.params.id} is not found!` });
		}
		res.setHeader(
			'Content-Disposition',
			`attachment; filename = application.pdf`,
		);
		const source = await getPdfReadableStream(currentProfile);
		const destination = res;
		pipeline(source, destination, (err) => {
			if (err) next(err);
		});
	} catch (error) {
		next(error);
	}
});

export default profileRouter;
