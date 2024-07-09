import { Schema, model, models } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const ChatSchema = new Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    groupChatName: String,
  },
  { timestamps: true }
);


ChatSchema.plugin(mongoosePaginate);

export const Chat = models.Chat || model("Chat", ChatSchema);
