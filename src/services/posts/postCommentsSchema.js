import mongoose from "mongoose";
const { model, Schema } = mongoose;
const postComments = new Schema(
  {
    comment: {
      type: String,
      required: true,
    },
    post: [{ type: Schema.Types.ObjectId, ref: "post" }],
    user: [{ type: Schema.Types.ObjectId, ref: "linkedin-profile" }],
  },
  { timestamps: true }
);

export default model("postComments", postComments);
