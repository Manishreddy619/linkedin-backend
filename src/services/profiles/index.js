import express from 'express';
import { validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import { parseFile } from '../cloudinary.js';
import { profileValidator } from './profileValidation.js';
import { fileIsRequired } from '../validationfileType.js';
import profileModel from './profileSchema.js';
import { getPdfReadableStream } from './pdf.js';
import { pipeline } from 'stream';

import experienceModel from './experienceSchema.js';
const profileRouter = express.Router();

//const experienceRoutes = express.Router();

profileRouter.post('/:profileName/experiences', async (req, res, next) => {
	try {
		const users = await profileModel.find();
		if (users) {
			const getPname = users.find(
				(usr) => usr.username === req.params.profileName,
			);
			console.log(getPname);
			if (getPname) {
				const myObj = {
					...req.body,
					username: req.params.profileName,
				};

				const newExperience = new experienceModel(myObj);
				const { _id } = await newExperience.save();
				res.status(201).send(_id);
			} else {
				res
					.status(401)
					.send(
						`the profile name with ${req.params.profileName} was not found.`,
					);
			}
		}
	} catch (error) {
		console.log(error);
	}
});
profileRouter.get('/:profileName/experiences', async (req, res, next) => {
	try {
		const users = await profileModel.find();
		if (users) {
			const userExists = users.find(
				(usr) => usr.username === req.params.profileName,
			);
			if (userExists) {
				const userExperiences = await experienceModel.find();
				if (userExperiences) {
					const experiences = userExperiences.filter(
						(ex) => ex.username === req.params.profileName,
					);
					res.send(experiences);
				} else {
					res.send(`profilename  ${req.params.profileName} not found`);
				}
			} else {
				res.send(`profilename  ${req.params.profileName} not found`);
			}
		}
	} catch (error) {
		next(error);
	}
});
profileRouter.get('/:profileName/experiences/:exId', async (req, res, next) => {
	try {
		const getPName = await profileModel.find();
		if (getPName) {
			const user = getPName.find(
				(usr) => usr.username === req.params.profileName,
			);

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
				.send(`the profile name with ${req.params.profileName} was not found.`);
		}
	} catch (error) {
		console.log(error);
	}
});
profileRouter.put('/:profileName/experiences/:exId', async (req, res, next) => {
	try {
		const getPName = await profileModel.find();
		if (getPName) {
			const user = getPName.find(
				(usr) => usr.username === req.params.profileName,
			);

			if (user) {
				const updateExp = await experienceModel.findByIdAndUpdate(
					req.params.exId,
					req.body,
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
				.send(`the profile name with ${req.params.profileName} was not found.`);
		}
	} catch (error) {
		next(error);
	}
});
profileRouter.delete(
	'/:profileName/experiences/:exId',
	async (req, res, next) => {
		try {
			const getUser = await profileModel.find();
			if (getUser) {
				const user = getUser.find(
					(usr) => usr.username === req.params.profileName,
				);
				if (user) {
					const delExp = await experienceModel.findByIdAndDelete(
						req.params.exId,
					);
					res.send('exp deleted');
				}
			}
		} catch (error) {
			next(error);
		}
	},
);
//export default experienceRoutes;

profileRouter.post(
	'/',
	parseFile.single('image'),
	fileIsRequired,
	profileValidator,
	async (req, res, next) => {
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
						image: req.file.path,
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
	},
);
profileRouter.get('/', async (req, res, next) => {
	const users = await profileModel.find();

	res.json({ users: users }).status(200);
});

profileRouter.get('/:userId', async (req, res, next) => {
	try {
		const id = req.params.userId;
		const user = await profileModel.findById(id);
		const experiences = await experienceModel.find();
		const { username } = user;
		if (user) {
			const userExperiences = experiences.filter(
				(ex) => ex.username === username,
			);
			if (userExperiences) {
				const userDetails = await profileModel.findByIdAndUpdate(
					req.params.userId,
					{ $push: { experiences: userExperiences } },
					{ new: true },
				);
				res.status(201).send(userDetails);
			}
			res.send(user).status(200);
		} else {
			next(createHttpError(404, `user with id ${id} not found!`));
		}
	} catch (error) {
		next(error);
	}
});
profileRouter.put(
	'/:userId',
	parseFile.single('image'),
	fileIsRequired,
	profileValidator,
	async (req, res, next) => {
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
						image: req.file?.path,
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
						let userNameExists = users.find(
							(user) => user.username === username,
						);

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
	},
);
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
				console.log(user, '-----------------------------------------------');
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
