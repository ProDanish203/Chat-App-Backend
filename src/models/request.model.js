import { Schema, model, models } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const RequestSchema = new Schema(
  {
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
  },
  { timestamps: true }
);


RequestSchema.plugin(mongoosePaginate);

export const Request = models.Request || model("Request", RequestSchema);
