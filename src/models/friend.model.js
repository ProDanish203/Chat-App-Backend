import mongoose, { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const FriendSchema = new Schema(
    {
        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "blocked"],
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
        blockedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

FriendSchema.plugin(mongoosePaginate);
FriendSchema.plugin(aggregatePaginate);

export const Friend = mongoose.models.Friend || model("Friend", FriendSchema);
