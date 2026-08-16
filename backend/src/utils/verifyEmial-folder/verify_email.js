import nodemailer from 'nodemailer';
import config from '../../config/config.js';
import fs from 'fs'
import path from 'path';
import handlebars from 'handlebars'
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export const sendVerificationEmail = (email, token)=>{

    const emailTemplateToString = fs.readFileSync(path.join(__dirname,"template.hbs"),"utf-8");
    const compileFileTemplate  = handlebars.compile(emailTemplateToString);
    const htmlFileToSend = compileFileTemplate({token:encodeURIComponent(token)})


    const transpoter = nodemailer.createTransport({
        host:"smtp.gmail.com",
        port:465,
        service:"gmail",
        auth:{
            user:config.EMAIL_USER,
            pass:config.EMAIL_PASS,
        },

    });

    const emailConfig = {
        from :config.EMAIL_USER,
        to:email,
        subject:`Email verification !`,
        html:htmlFileToSend
    };

    transpoter.sendMail(emailConfig,(err,info)=>{
        if(err){
            console.log("Something Went Wrong in Send verification File ❌")
        }else{
            console.log(`verification Email Send At Your email ${email}`)
        }
    })




}