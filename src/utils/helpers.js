import { User } from "../models/user.model.js";
import { Request } from "../models/request.model.js";
import { Chat } from "../models/chat.model.js";
import { Message } from "../models/message.model.js";

export const getBase64 = (file) =>
  `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;


export const getPaginatedData = async ({
  model,
  page = 1,
  limit = 10,
  query = {},
  populate = "",
  select = "-password -refreshToken -forgotPasswordToken -forgotPasswordTokenExpiry",
  sort = { createdAt: -1 },
}) => {
  const options = {
    select,
    sort,
    page,
    limit,
    populate,
    lean: true,
    customLabels: {
      totalDocs: "totalItems",
      docs: "data",
      limit: "perPage",
      page: "currentPage",
      meta: "pagination",
    },
  };

  const { data, pagination } = await model.paginate(query, options);
  delete pagination?.pagingCounter;

  return { data, pagination };
};

export const getPaginatedUsers = async ({ query, page, limit, sort }) => {
  const { data, pagination } = await getPaginatedData({
    model: User,
    query: { ...query },
    page,
    limit,
    sort,
  });

  return { data, pagination };
};
