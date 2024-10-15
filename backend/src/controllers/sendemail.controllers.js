import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import nodemailer from 'nodemailer';
import axios from "axios";
import { UserNotification } from "../models/userNotification.models.js";

// Helper function to recursively search for 'isAvailable' in an object
const searchIsAvailable = (obj) => {
    for (let key in obj) {
        if (key === 'isAvailable' && obj[key] === true) {
            return true; // Found isAvailable: true
        }
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            const result = searchIsAvailable(obj[key]); // Recursive call for nested objects
            if (result) {
                return true; // Found in a nested object
            }
        }
    }
    return false; // Not found
};

// Main function to check product stock
const checkProductStock = async (url) => {
    try {
        const response = await axios.get(url,{
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36'
            }
        }); // Send request to the product URL
        console.log(response.data); // Log the entire response data for debugging

        const isInStock = searchIsAvailable(response.data); // Recursively search for 'isAvailable' in the response data
        console.log(typeof(isInStock), isInStock); // Log the type and value of isInStock

        return isInStock; // Return whether the product is in stock
    } 
    catch (error) {
        console.error("Error fetching product status: ", error.message);
        if (error.response) {
            console.error("Response data: ", error.response.data); // Log response data for more context
        }
        return false; // Return false in case of an error
    }
};


const sendNotificationEmail = asyncHandler(async (email) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        secure: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Product Availability Notification',
        text: 'The product is now in stock! Check it out!',
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Notification email sent to ${email}`);
    } catch (error) {
        console.error('Error sending notification email:', error);
    }
});

// Function to check stock status for all users
const checkStocks = async () => {
    const notifications = await UserNotification.find({ notified: false }); // Get users who haven't been notified yet

    for (const notification of notifications) {
        const isInStock = await checkProductStock(notification.productUrl);
        if (isInStock) {
            await sendNotificationEmail(notification.email);
            notification.notified = true; // Mark as notified
            await notification.save(); // Save the changes to the database
        }
    }
};

// Call the function to check stock every 1 minute
setInterval(checkStocks, 1 * 60 * 1000); // Check every 1 minute

//Send email and start monitoring for product availability
const sendEmail = asyncHandler(async (req, res) => {

    const { email, productUrl } = req.body;

    // Check if email and product URL are provided
    if (!email || !productUrl) {
        return res.status(400).json({
            statusCode: 400,
            data: null,
            success: false,
            errors: ['Email and product URL are required.']
        });
    }

    // Check if the user is already subscribed for the same product URL
    const existingNotification = await UserNotification.findOne({
        email: email, 
        productUrl: productUrl
    });
    //console.log('existingNotification:', existingNotification, typeof existingNotification);

        //console.log(email,productUrl)

    if (existingNotification) {
        //throw new ApiError(400,'You are already subscribed for this product.')
        return res.status(400).json({
            statusCode: 400,
            data: null,
            success: false,
            errors: ['You are already subscribed for this product.']
        });
    }

    // Save the user and product link to the database
    try {
        const userNotification = new UserNotification({ email, productUrl });
        await userNotification.save();
    } catch (error) {
        // Catch MongoDB duplicate key error (E11000)
        console.error("MongoDB Error:", error); 
        if (error.code === 11000) {
            return res.status(400).json({
                statusCode: 400,
                data: null,
                success: false,
                errors: ['You are already subscribed for this product(while saving to database).']
            });
        }
        return res.status(500).json({
            statusCode: 500,
            data: null,
            success: false,
            errors: ['Internal server error while saving notification.']
        });
    }

    // Initial check to notify if already in stock
    const isInStock = await checkProductStock(productUrl);
    if (isInStock === null) {  // handle product stock check failure
        return res.status(500).json({
            statusCode: 500,
            data: null,
            success: false,
            errors: ['Error checking product stock.']
        });
    }

    if (isInStock) {
        await sendNotificationEmail(email);
        return res.status(200).json({ message: 'Product is already in stock. Email sent!' });
    }

    return res.status(200).json(new ApiResponse(200, 'You will be notified when the product is back in stock.'));
});



export { sendEmail };




