import { Request } from "../models/request.model.js";

export const sendRequest = async (req, res, next) => {
    try {
        const {} = req.body;
    } catch (error) {
        next(error);
        console.log(error);
    }
};

export const getIncomingRequests = async (req, res, next) => {
    try {
        const {} = req.body;
    } catch (error) {
        next(error);
        console.log(error);
    }
};

export const getPendingRequest = async (req, res, next) => {
    try {
        const {} = req.body;
    } catch (error) {
        next(error);
        console.log(error);
    }
};

export const acceptOrRejectRequest = async (req, res, next) => {
    try {
        const {} = req.body;
    } catch (error) {
        next(error);
        console.log(error);
    }
};

export const withdrawRequest = async (req, res, next) => {
    try {
        const {} = req.body;
    } catch (error) {
        next(error);
        console.log(error);
    }
};
