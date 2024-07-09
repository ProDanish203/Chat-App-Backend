import mongoose, { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

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
RequestSchema.plugin(aggregatePaginate);

export const Request =
    mongoose.models.Request || model("Request", RequestSchema);
