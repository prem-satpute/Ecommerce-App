import nodemailer from 'nodemailer';
import config from '../../config/config.js';

export const sendOtp = (email, otp)=>{
    const tranpoter = nodemailer.createTransport({
        host:"smtp.gmail.com",
        service:"gmail",
        port:465,
        auth:{
            user:config.EMAIL_USER,
            pass:config.EMAIL_PASS,
        }
    });


    const emailConfig = {
        from :config.EMAIL_USER,
        to:email,
        subject:"OTP Verification !",
        html:`OTP = ${otp}`
    };

    tranpoter.sendMail(emailConfig, (err,info)=>{
        if(err){
            console.log(`can't Send The OTP at Email ${email} Beacause Of Some Error`,err);
        }else{
            console.log(`Successfully Send OTP at Email ${email}`)
        }
    })
};