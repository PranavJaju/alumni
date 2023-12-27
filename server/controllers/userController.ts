import express, { Request, Response, Application, urlencoded } from 'express';
import jwt from "jsonwebtoken"
import {generateUserToken} from '../middleware/userMiddleware'
import bcrypt from 'bcryptjs';
import { client } from '../model/db';
import { QueryResult } from 'pg';
const {sendOtpMail} = require("../emails/ses");
import {UserBody,ReqMid} from '../types/user';

// Function to handle user signup
const SignUserUp = async (req: UserBody, res: Response) => {
    // SQL query to insert user details into the 'users' table in the database

    if(!req.body.username || !req.body.first_name || !req.body.last_name || !req.body.phone || !req.body.user_password || !req.body.phone || !req.body.email || !req.body.passout_year){
        res.status(401).json({error:"Fill all the fields"});
    }
    else{
    const insertUser: string =
      "INSERT INTO users (username, first_name, last_name, phone, email, user_password, is_alumni, is_verified, passout_year, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING username, email, created_at";
    
    // Get the current timestamp in ISO format
    const timeStamp: string = new Date().toISOString();
    
    // Hash the user's password using bcrypt
    const hashPassword = await bcrypt.hash(req.body.user_password, 10);
  
    // Prepare the values for the SQL query
    const values: any[] = [
      req.body.username,
      req.body.first_name,
      req.body.last_name,
      req.body.phone,
      req.body.email.toLowerCase(),
      hashPassword,
      false, // is_alumni (modify this based on your requirements)
      false, // is_verified (modify this based on your requirements)
      req.body.passout_year,
      timeStamp,
      timeStamp,
    ];
  
    try {
      // Execute the SQL query to insert the user data into the database
      const result: QueryResult<any> = await client.query(insertUser, values);
      const data = result.rows; // Access the rows returned by the query
  
      console.log(data); // Log the data returned by the query (for debugging purposes)
      const token = await generateUserToken(data[0].user_id);
      // Send a success response to the client
      res.status(200).json({ message: "User created successfully.",token: token });
    
    } catch (err: any) {
      // Handle errors that occurred during the database operation
  
      // Extract the duplicate error message from the error object
      const duplicateError: string = err.message.split(" ").pop().replaceAll('"', "");
  
      if (duplicateError === "user_email_key") {
        // If a user with the same email already exists, send a 409 Conflict response
        res.status(409).json({ error: "User with this email already exists." });
      } else if (duplicateError === "user_mobile_number_key") {
      res
        .status(409)
        .json({ error: "User with this mobile_number already extsts" });
    }else {
        // For other errors, log the error and send a 500 Internal Server Error response
        console.log(err);
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
    }
  };
const SignUserIn = async (req: UserBody, res: Response) => {
    try {
        if(!req.body.email || !req.body.user_password){
            res.status(401).json({error:"Fill all the fields"});
        }
        else{
        const email = req?.body?.email;
        const text = `select * from users where email='${email}';`;
        console.log(text);
        const data: QueryResult<any> = await client.query(text);
        console.log(data.rows[0])
        if (data.rowCount === 1) {
            const auth =await bcrypt.compare(req.body.user_password, data.rows[0].user_password);
            if (auth) {
                const token = await generateUserToken(data.rows[0].user_id);
                const user = data.rows[0];
                delete user.password;
                return res.json({
                    token: token,
                    user: user
                });
            } else {
                return res.status(400).send("Invalid password");
            }
        } else {
            return res.status(400).send("User Not Found");
        }
      }
    }
    catch (err: any) {
        res.status(400).send(err.message);
    }
}
const UserLogout = async (req:ReqMid, res: Response) => {
    
    if (!req.token) {

        return res.status(401).json({ error: "You are already logged out" });

    }

    const removeUser: string = "DELETE FROM user_token WHERE token = $1";

    const value: any[] = [
        req.token
    ];

    try {
        const result: QueryResult<any> = await client.query(removeUser, value);

        return res.status(200).json({ success: "User logged out successfully!" });

    } catch (err: any) {

        return res.status(500).json({ error: "An error occurred while logging out" });
    }
}

const OTPSend = async(req:any,res:any) =>{
   try{
        const email:string = req.body.email?.toLowerCase();
        let user:QueryResult<any> = await client.query("select * from users where email = $1",[email]);
        if(user.rowCount === 0){
            res.status(404).json({message:"User Not Found"});
        }
        let result = user.rows[0];
        var minm:number= 100000;
        var maxm:number = 999999;
        const otp :number= Math.floor(Math.random() * (maxm - minm + 1)) + minm;
        const key = process.env.TOKEN_SECRET || 'default_secret_key';
        const token:string = jwt.sign({otp},key,{expiresIn: "900s"});
        user = await client.query("update users set otp = $1 where email = $2",[token,email]);

        sendOtpMail(result.name,email,otp);

        res.status.json({message:"OTP sent Successfully"});
   }catch(err:any){
    console.log(err);
    res.status(500).json({error:"Internal server error"});
   }
}
const OTPVerify = async(req:any,res:any)=>{
    try{
        const email: string = req.body.email?.toLowerCase();
        const otp: number = req.body.otp; // OTP entered by the user

        const user: QueryResult<any> = await client.query("select * from users where email = $1", [email]);
        if (user.rowCount === 0) {
            res.status(404).json({ message: "User Not Found" });
            return;
        }

        const token:string = user.rows[0].otp;
        const key = process.env.TOKEN_SECRET || 'default_secret_key';
        try{
            const decoded:any =  jwt.verify(token,key);
            if(decoded.otp === otp){
                await client.query("update users set otp = null where email = $1",[email]);
                res.status(200).json({message:"OTP Verified Successfully"});
            }
            else{
                res.status(400).json({error:"Invalid OTP"});
                
            }
        }
        catch(err:any){
            console.log(err);
            res.status(500).json({error:"Invalid OTP"});
        }

    }
    catch(err:any){
        console.log(err);
        res.status(500).json({error:"Internal server error"});
    }
}
module.exports = { SignUserUp, SignUserIn, UserLogout , OTPSend , OTPVerify };


