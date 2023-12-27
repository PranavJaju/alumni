import express, { Router } from 'express'
const { getAllProfiles } = require("../controllers/profileController")

const profileRouter: Router = express.Router();

profileRouter.get("/", getAllProfiles);

module.exports = profileRouter