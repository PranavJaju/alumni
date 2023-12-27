import express, { Router } from 'express';
const adminRouter = express.Router();
const { SignAdminUp, SignAdminIn, AdminLogout } = require('../controllers/adminController');

adminRouter.post("/signup", SignAdminUp);
adminRouter.post("/signin", SignAdminIn);
adminRouter.post("/logout", AdminLogout);

module.exports = adminRouter;