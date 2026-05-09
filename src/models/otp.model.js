import mongoose from "mongoose";


const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email is required"]
    },
    otp: {
        type: String,
        required: [true, "OTP is required"]
    },
    expiresAt: {
        type: Date,
        required: [true, "Expiry date is required"]
    }
}, {
    timestamps: true
});

const otpModel = mongoose.model("otp", otpSchema);

export default otpModel;