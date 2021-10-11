import express from 'express';
import { validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import { parseFile } from '../cloudinary.js';
import { profileValidator } from './profileValidation.js';
import { fileIsRequired } from '../validationfileType.js';
import profileModel from './profileSchema.js';

const profileUsersRouter = express.Router();

profileUsersRouter.post(
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
profileUsersRouter.get('/', async (req, res, next) => {
	const users = await profileModel.find();
	res.json({ users: users }).status(200);
});

profileUsersRouter.get('/:userId', async (req, res, next) => {
	try {
		const id = req.params.userId;
		const user = await profileModel.findById(id);
		if (user) {
			res.send(user).status(200);
		} else {
			next(createHttpError(404, `user with id ${id} not found!`));
		}
	} catch (error) {
		next(error);
	}
});
profileUsersRouter.put(
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
profileUsersRouter.delete('/:userId', async (req, res, next) => {
	try {
		const user = await profileModel.findByIdAndDelete(req.params.userId);
		res.send('deleted');
	} catch (error) {}
});

profileUsersRouter.post(
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
export default profileUsersRouter;
