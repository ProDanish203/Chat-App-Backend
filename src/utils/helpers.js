import { User } from "../models/User.model.js";

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
