function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function getOtpHtml(otp) {
    return `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Email Verification</h2>
            
            <p>Your OTP for verification is:</p>
            
            <h1 style="color: #2563eb; letter-spacing: 5px;">
                ${otp}
            </h1>

            <p>This OTP is valid for 10 minutes.</p>

            <p>If you did not request this, please ignore this email.</p>
        </div>
    `;
}

export {
    generateOtp,
    getOtpHtml
};