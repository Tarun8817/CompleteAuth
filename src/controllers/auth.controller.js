import userModel from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import sessionModel from "../models/session.model.js";
import crypto from "crypto";
import { sendEmail } from "../services/email.service.js";
import { generateOtp, getOtpHtml } from "../utils/utils.js";
import otpModel from "../models/otp.model.js";

// Helper function
const getRefreshTokenHash = (token) => {
    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
};

// ================= REGISTER =================

export async function registerUser(req, res) {
    try {
        const { username, email, password } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // Check existing user
        const isAlreadyRegistered = await userModel.findOne({
            $or: [{ username }, { email }]
        });

        if (isAlreadyRegistered) {
            return res.status(409).json({
                message: "Username or email already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await userModel.create({
            username,
            email,
            password: hashedPassword
        });

        // Generate OTP
        const otp = generateOtp();

        // Hash OTP before saving
        const otpHash = crypto
            .createHash("sha256")
            .update(otp)
            .digest("hex");

        // Save OTP in DB
        await otpModel.create({
            email,
            otp: otpHash,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        });

        // Generate HTML
        const html = getOtpHtml(otp);

        // Send Email
        await sendEmail(
            email,
            "OTP Verification",
            `Your OTP code is ${otp}`,
            html
        );

        return res.status(201).json({
            message: "User registered successfully. OTP sent to email.",
            user: {
                username: user.username,
                email: user.email,
                verified: user.verified
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
}

// ================= VERIFY OTP =================

// Removed duplicate verifyOtp function. Use verifyEmail only.

// ================= LOGIN =================

export async function loginUser(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        // Check verification
        if (!user.verified) {
            return res.status(403).json({
                message: "Please verify your email first"
            });
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        // Create refresh token
        const refreshToken = jwt.sign(
            { id: user._id },
            config.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Hash refresh token
        const refreshTokenHash = getRefreshTokenHash(refreshToken);

        // Save session
        const session = await sessionModel.create({
            user: user._id,
            refreshTokenHash,
            ip: req.ip,
            userAgent: req.headers["user-agent"]
        });

        // Create access token
        const accessToken = jwt.sign(
            {
                id: user._id,
                sessionId: session._id
            },
            config.JWT_SECRET,
            { expiresIn: "15m" }
        );

        // Set cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: "Logged in successfully",
            accessToken,
            user: {
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
}

// ================= GET ME =================

export async function getMe(req, res) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "No token provided"
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            config.JWT_SECRET
        );

        // Validate session
        const session = await sessionModel.findById(
            decoded.sessionId
        );

        if (!session || session.revoked) {
            return res.status(401).json({
                message: "Session expired or revoked"
            });
        }

        const user = await userModel.findById(decoded.id)
            .select("-password -__v");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "User fetched successfully",
            user
        });

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
}

// ================= REFRESH TOKEN =================

export async function refreshToken(req, res) {
    try {
        const token = req.cookies.refreshToken;

        if (!token) {
            return res.status(401).json({
                message: "Refresh token not found"
            });
        }

        const decoded = jwt.verify(
            token,
            config.JWT_SECRET
        );

        const refreshTokenHash =
            getRefreshTokenHash(token);

        const session = await sessionModel.findOne({
            refreshTokenHash,
            revoked: false
        });

        if (!session) {
            return res.status(401).json({
                message: "Invalid refresh token"
            });
        }

        // Rotate refresh token
        const newRefreshToken = jwt.sign(
            { id: decoded.id },
            config.JWT_SECRET,
            { expiresIn: "7d" }
        );

        const newRefreshTokenHash =
            getRefreshTokenHash(newRefreshToken);

        session.refreshTokenHash =
            newRefreshTokenHash;

        await session.save();

        // Create new access token
        const newAccessToken = jwt.sign(
            {
                id: decoded.id,
                sessionId: session._id
            },
            config.JWT_SECRET,
            { expiresIn: "15m" }
        );

        // Set new cookie
        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: "Token refreshed successfully",
            accessToken: newAccessToken
        });

    } catch (error) {
        return res.status(403).json({
            message: "Invalid or expired refresh token"
        });
    }
}

// ================= LOGOUT =================

export async function logout(req, res) {
    try {
        const token = req.cookies.refreshToken;

        if (!token) {
            return res.status(400).json({
                message: "Refresh token not found"
            });
        }

        const refreshTokenHash =
            getRefreshTokenHash(token);

        const session = await sessionModel.findOne({
            refreshTokenHash,
            revoked: false
        });

        if (session) {
            session.revoked = true;
            await session.save();
        }

        res.clearCookie("refreshToken");

        return res.status(200).json({
            message: "Logged out successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
}

// ================= LOGOUT ALL =================

export async function logoutAll(req, res) {
    try {
        const token = req.cookies.refreshToken;

        if (!token) {
            return res.status(400).json({
                message: "Refresh token not found"
            });
        }

        const decoded = jwt.verify(
            token,
            config.JWT_SECRET
        );

        await sessionModel.updateMany(
            {
                user: decoded.id,
                revoked: false
            },
            {
                revoked: true
            }
        );

        res.clearCookie("refreshToken");

        return res.status(200).json({
            message: "Logged out from all devices"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
}
export async function verifyEmail(req, res) {
    try {
        const { otp, email } = req.body;

        // Validation
        if (!otp || !email) {
            return res.status(400).json({
                message: "OTP and email are required"
            });
        }

        // Hash incoming OTP
        const otpHash = crypto
            .createHash("sha256")
            .update(otp)
            .digest("hex");

        // Find OTP in DB
        const existingOtp = await otpModel.findOne({
            email
        });

        if (!existingOtp) {
            return res.status(400).json({
                message: "OTP not found"
            });
        }

        // Check expiry
        if (existingOtp.expiresAt < new Date()) {
            return res.status(400).json({
                message: "OTP expired"
            });
        }

        // Compare OTP
        if (otpHash !== existingOtp.otp) {
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }

        // Verify user
        await userModel.findOneAndUpdate(
            { email },
            { verified: true }
        );

        // Delete OTP after verification
        await otpModel.deleteOne({ email });

        return res.status(200).json({
            message: "Email verified successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
}