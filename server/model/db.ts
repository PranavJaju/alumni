import { Client } from 'pg'

export const client = new Client(
    {
        host: process.env.host,
        user: process.env.user,
        port: 5432,
        password: process.env.password,
        database: process.env.name,
        ssl:{
            rejectUnauthorized:false
        }
    }
    
)
client.connect()
    .then(() => {
        console.log("Connection successful");
    })
    .catch((r: any) => {
        console.log("Unable to connect", r)
    })



