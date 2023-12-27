import { Request, Response } from "express";

exports.getAllProfiles = async (req: Request, res: Response) => {
    try {
        res.status(200).send("Get All Profiles")
    } catch (err: any) {
        res.status(401).send(err)
    }
}