///experience schma..
import database from 'mongoose';
const { model, Schema } = database;
const experience = new Schema(
	{
		role: {
			type: String,
			required: true,
		},
		company: {
			type: String,
			required: true,
		},
		startDate: {
			type: String,
			required: true,
		},
		endDate: {
			type: String,
			required: false,
		},
		description: {
			type: String,
			required: true,
		},
		area: {
			type: String,
			required: true,
		},
		username: String,
		image: { type: String },
	},
	{ timestamps: true },
);

export default model('Experience', experience);
