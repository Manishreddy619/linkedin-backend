import express from 'express'
import postModel from './schema.js'
import createHttpError from 'http-errors'

const posts=express.Router()

export default posts