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

export const getPaginatedFriends = async ({
    model,
    page = 1,
    limit = 10,
    query = {},
    search = "",
    sort = { createdAt: -1 },
    currentUser,
}) => {
    const skip = (page - 1) * limit;

    const aggregationPipeline = [
        { $match: query },
        // Look for sender
        {
            $lookup: {
                from: "users",
                localField: "sender",
                foreignField: "_id",
                as: "senderDetails",
            },
        },
        { $unwind: "$senderDetails" },
        // Look for receiver
        {
            $lookup: {
                from: "users",
                localField: "receiver",
                foreignField: "_id",
                as: "receiverDetails",
            },
        },
        { $unwind: "$receiverDetails" },
        // Project the fields on the condition of currentUser being the sender or receiver
        {
            $project: {
                _id: 1,
                status: 1,
                friendDetails: {
                    $let: {
                        vars: {
                            selectedUser: {
                                $cond: [
                                    { $eq: ["$sender", currentUser] },
                                    "$receiverDetails",
                                    "$senderDetails",
                                ],
                            },
                        },
                        in: {
                            _id: "$$selectedUser._id",
                            username: "$$selectedUser.username",
                            fullName: "$$selectedUser.fullName",
                            avatar: "$$selectedUser.avatar",
                            email: "$$selectedUser.email",
                        },
                    },
                },
            },
        },
        {
            $match: {
                $or: [
                    {
                        "friendDetails.username": {
                            $regex: search,
                            $options: "i",
                        },
                    },
                    {
                        "friendDetails.email": {
                            $regex: search,
                            $options: "i",
                        },
                    },
                ],
            },
        },
        {
            $facet: {
                data: [{ $sort: sort }, { $skip: skip }, { $limit: limit }],
                pagination: [
                    { $count: "totalItems" },
                    {
                        $addFields: {
                            page,
                            limit,
                            totalPages: {
                                $ceil: {
                                    $divide: ["$totalItems", limit],
                                },
                            },
                        },
                    },
                ],
            },
        },
        { $unwind: "$pagination" },
    ];

    const result = await model.aggregate(aggregationPipeline);

    return {
        data: result[0].data,
        pagination: result[0].pagination,
    };
};
