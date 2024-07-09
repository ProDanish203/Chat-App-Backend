import { Schema, model, models } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const MessageSchema = new Schema(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },  
    message: {
      type: String,
      required: [true, "Message is required"],
    },
    attachments: [
        {
            public_id: {
              type: String,
              required: true,
            },
            url: {
              type: String,
              required: true,
            },
        },
    ],
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);


ChatSchema.plugin(mongoosePaginate);

export const Message = models.Message || model("Message", MessageSchema);
