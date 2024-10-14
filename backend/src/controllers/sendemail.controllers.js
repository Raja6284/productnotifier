import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import nodemailer from 'nodemailer';



const sendEmail = asyncHandler(async(req,res)=>{
    try{

        const {to,subject,text} = req.body

        const transporter = nodemailer.createTransport({
            service: 'gmail', 
            secure:true,
            auth: {
                user: process.env.EMAIL,  
                pass: process.env.PASS,   
            },
        });


        const mailOptions = {
            from: process.env.EMAIL,   
            to: to,                        
            subject: subject,             
            text: text,                    
        };

        const info = transporter.sendMail(mailOptions)

        return res
        .status(200)
        .json(new ApiResponse(200,info,"email send sussessfully"))

    }catch(error){
        throw new ApiError(501,"Error sending email",error.message)
    }
})


export {sendEmail}

