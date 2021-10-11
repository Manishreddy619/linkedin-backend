import mongoose from 'mongoose'

const{Schema,model}=mongoose

const commentSchema=new Schema({
    comment:{type:String,required:true},
    postWithUser:{type:Object}
},{timestamps:true})

export default model('comment',commentSchema)