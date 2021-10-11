import { body } from 'express-validator';
export const profileValidator = [
	body('name').exists().withMessage('name is mandatory'),
	body('surname').exists().withMessage('surname is mandatory'),
	body('email').exists().withMessage('email is mandatory'),
	body('bio').exists().withMessage('bio is mandatory'),
	body('title').exists().withMessage('title is mandatory'),
	body('area').exists().withMessage('area is mandatory'),
	body('username').exists().withMessage('username is mandatory'),
];
