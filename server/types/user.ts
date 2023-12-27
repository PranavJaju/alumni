import { Request,Response } from "express"

export interface UserBody {
    body: {
    username:string,
    first_name: string,
    last_name:string,
    phone:Number,
    email:string,
    user_password:string,
    is_alumni:boolean,
    is_verified :boolean,
    passout_year :number
    }

} 
export interface  ReqMid extends Request{
    user:{
        username:string,
        first_name: string,
        last_name:string,
        phone:Number,
        email:string,
        user_password:string,
        is_alumni:boolean,
        is_verified :boolean,
        passout_year :number
    }
    token: string
}
export interface Token {
    
}