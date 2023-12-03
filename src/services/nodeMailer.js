import nodemailer from 'nodemailer';
import fs from 'fs';

// Create a transporter with your email service details
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.FROM_EMAIL,
        pass: process.env.EMAIL_PASS,
    },
});

// Generate a random 6-digit OTP
function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000);
}

// Function for sending the OTP via email
const sendCreateAccountOTP = (email) => {
    const otp = generateOTP();

    // Email configuration
    const mailOptions = {
        from: 'onpodsapp@gmail.com',
        to: email,
        subject: 'Your OTP Code',
        html: `
    <html>
  <head>
    <style>
      /* Add styles for the body and container */
      body {
        background-color: #f5f5f5;
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
      }

      .container {
        background-color: #ffffff;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }

      /* Style the logo */
      .logo {
        width: 50%;
        max-width: 50%;
        height: auto;
      }

      /* Style the header and OTP text */
      h1 {
        color: #333;
        font-size: 24px;
        margin-top: 10px;
      }

      p {
        font-size: 16px;
        color: #666;
      }

      /* Style the call-to-action button */
      .cta-button {
        background-color: #007bff;
        color: #fff;
        text-decoration: none;
        padding: 10px 20px;
        border-radius: 5px;
        display: inline-block;
        margin-top: 20px;
        font-weight: bold;
        width:100%
      }

      span {
        color: #007bff;
        font-weight: bold;
        font-size:20px
      }

      /* Add additional styles as needed */
    </style>
  </head>
  <body>
    <div class="container">
      <img src="https://lh3.googleusercontent.com/pw/AIL4fc93WhfatcGMkosHLW6yj3cmYG-7W1LRsG2ye22A3-E4LQfSJ8mgcaiRRLLXeIIH5Td3gL9bVGXJfAViA9Rn93GWKkrV69L4WSkZiVUzmxFgfYUJ9PVPiTiHK8XfxU8w4o4KEF1YhpoPAnvlU30ycO9Bv94SiDyvHtyb4KZHaCndZWCulZIYBu0P40iSeVaBCoW66V1ofXa-QMcZO4I1YA85VjOKnVQZZ81-2_KQT-gCU0i5sWU21Mg3qJr5axDej6xUcWIxztO7TX9fozGZ2K95n1dbEPoil7ksETht3HS2NDQyIpbs0XqIzoGs10R_udjdloJKUWHhQ7ofiwSi561CtKn7N2ls8ZHDdaGhjjaXTXWJqyw6KfUBOzdfelEorfCCkH_1Ymsz78m4xOg-aanVTkfi2vPJhe80834diJr3Y5h_imk4O1_gHGujsUKXLBBwV0gC3-B781hbbxkzrOucC1A3HHiVo9V59LNRVwOkc_x_SpotS_Ei9ow_hH-L_xX8sPlBXhpBjnoWXPjZWHw1vC8Of0rvtjIvvn32s8Qr_U0w_TwytZgw-5e_UmT7xhxFJtF9Ol1FJGlhPOlrbxywM-ufLb3XLkukHzS6dEnL8oa2QdWwGGShEW_tAQXpRsZ5jLBGSG5RSHYxg4UPE8xV5zUblICPp_fMO4j4-juLFuzgV4ufT2WL0wlcxm_MVLMpAENkIdY8tBQ7bIvzNmOnPjEjTUFM6UkO_HpRnMI1SzeTnKZ-TeChN1dtm049hsTpxAIMIm3ojuD2RQ559bknWdrB7G52k4XQ5t7sVOEMzIGvXNAbSxe2qlIlgOubIgz8N0LAhYbSOMJVY2DbOT5paj7u9beI-rphHvXgqGLYlG5ArpdHB9BYdjM3Lq_k9kLjOrEDGrP16P06JmWf=w123-h49-s-no?authuser=0" alt="App Logo" class="logo" />
      <h1>Welcome to OnPods!</h1>
      <p>Thank you for choosing OnPods. You're just one step away from creating your account. Use the following OTP to create your new account:</p>
      <p>Your OTP code is: <span>${otp}</span></p>

    </div>
  </body>
</html>

    `,
    };

    // Send the OTP via email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
         
            throw error;
        } else {
          
        }
    });

    return otp;
};


const sendForgotPasswordOTP = (email) => {
    const otp = generateOTP();

    // Email configuration
    const mailOptions = {
        from: 'onpodsapp@gmail.com',
        to: email,
        subject: 'Your OTP Code',
        html: `
      <html>
      <head>
        <style>
          /* Add styles for the body and container */
          body {
            background-color: #f5f5f5;
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
          }
    
          .container {
            background-color: #ffffff;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
    
          /* Style the logo */
          .logo {
            width: 50%;
            max-width: 50%;
            height: auto;
          }
    
          /* Style the header and message text */
          h1 {
            color: #333;
            font-size: 24px;
            margin-top: 10px;
          }
    
          p {
            font-size: 16px;
            color: #666;
          }
    
          /* Style the call-to-action button */
          .cta-button {
            background-color: #007bff;
            color: #fff;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
            display: inline-block;
            margin-top: 20px;
            font-weight: bold;
            width: 100%;
          }
    
          span {
            color: #007bff;
            font-weight: bold;
            font-size:20px
          }
        </style>
      </head>
      <body>
        <div class="container">
          <img src="https://lh3.googleusercontent.com/pw/AIL4fc93WhfatcGMkosHLW6yj3cmYG-7W1LRsG2ye22A3-E4LQfSJ8mgcaiRRLLXeIIH5Td3gL9bVGXJfAViA9Rn93GWKkrV69L4WSkZiVUzmxFgfYUJ9PVPiTiHK8XfxU8w4o4KEF1YhpoPAnvlU30ycO9Bv94SiDyvHtyb4KZHaCndZWCulZIYBu0P40iSeVaBCoW66V1ofXa-QMcZO4I1YA85VjOKnVQZZ81-2_KQT-gCU0i5sWU21Mg3qJr5axDej6xUcWIxztO7TX9fozGZ2K95n1dbEPoil7ksETht3HS2NDQyIpbs0XqIzoGs10R_udjdloJKUWHhQ7ofiwSi561CtKn7N2ls8ZHDdaGhjjaXTXWJqyw6KfUBOzdfelEorfCCkH_1Ymsz78m4xOg-aanVTkfi2vPJhe80834diJr3Y5h_imk4O1_gHGujsUKXLBBwV0gC3-B781hbbxkzrOucC1A3HHiVo9V59LNRVwOkc_x_SpotS_Ei9ow_hH-L_xX8sPlBXhpBjnoWXPjZWHw1vC8Of0rvtjIvvn32s8Qr_U0w_TwytZgw-5e_UmT7xhxFJtF9Ol1FJGlhPOlrbxywM-ufLb3XLkukHzS6dEnL8oa2QdWwGGShEW_tAQXpRsZ5jLBGSG5RSHYxg4UPE8xV5zUblICPp_fMO4j4-juLFuzgV4ufT2WL0wlcxm_MVLMpAENkIdY8tBQ7bIvzNmOnPjEjTUFM6UkO_HpRnMI1SzeTnKZ-TeChN1dtm049hsTpxAIMIm3ojuD2RQ559bknWdrB7G52k4XQ5t7sVOEMzIGvXNAbSxe2qlIlgOubIgz8N0LAhYbSOMJVY2DbOT5paj7u9beI-rphHvXgqGLYlG5ArpdHB9BYdjM3Lq_k9kLjOrEDGrP16P06JmWf=w123-h49-s-no?authuser=0" alt="App Logo" class="logo" />
          <h1>Password Reset Request</h1>
          <p>We received a request to reset your OnPods account password. If you didn't make this request, please ignore this email.</p>
          <p>If you did request a password reset, please use the following OTP to reset your password:</p>
          <p>Your OTP code is: <span class="otp-code">${otp}</span></p>
        </div>
      </body>
    </html>
    
      `,
    };

    // Send the OTP via email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
       
            throw error;
        } else {
          
        }
    });

    return otp;
};


export { sendCreateAccountOTP, sendForgotPasswordOTP };
