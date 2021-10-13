import mongoose from 'mongoose';
import validator from 'validator';
const { Schema, model } = mongoose;
const { isEmail } = validator;
const profileUserSchema = new Schema(
	{
		name: { type: String, required: true },
		surname: { type: String, required: true },
		email: {
			type: String,
			required: true,
			validate: [isEmail, 'invalid email'],
		},
		bio: { type: String, required: true },
		title: { type: String, required: true },
		area: { type: String, required: true },
		username: { type: String, required: true },
		image: { type: String },
		experiences: [{ type: Object }],
	},
	{
		timestamps: true,
	},
);

export default model('ProfileUser', profileUserSchema);
