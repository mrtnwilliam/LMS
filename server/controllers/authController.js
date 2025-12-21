import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import transporter from "../configs/nodemailer.js";
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from "../configs/emailTemplates.js";

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({ success: false, message: "Missing Details" });
  }
  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.isAccountVerified) {
        return res.json({ success: false, message: "User already exists" });
      } else {
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        existingUser.verifyOtp = otp;
        existingUser.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
        await existingUser.save();

        const mailOptions = {
          from: process.env.SENDER_EMAIL,
          to: email,
          subject: 'Account Verification OTP',
          html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}",existingUser.email)
        }

        await transporter.sendMail(mailOptions)

        return res.json({ success: true, message: "Account exists but unverified. OTP resent.", isUnverified: true });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hashedPassword});
    await user.save();

    // Generate OTP for verification
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

     const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: 'Account Verification OTP',
      html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}",user.email)
    }

    await transporter.sendMail(mailOptions)

    return res.json({success: true, message: "Registration successful. Please verify your email."});

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({success: false, message: 'Email and Password are required'});
  }
  try {
    const user = await User.findOne({email});

    if (!user) {
      return res.json({success: false, message: 'Invalid email'});
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid Password" })
    }

    if (!user.isAccountVerified) {
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
        await user.save();

        const mailOptions = {
          from: process.env.SENDER_EMAIL,
          to: email,
          subject: 'Account Verification OTP',
          html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}",user.email)
        }

        await transporter.sendMail(mailOptions)

        return res.json({ success: false, message: "Please verify your account. OTP sent.", isUnverified: true });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({success: true, message: "Logged in successfully"});

  } catch (error) {
    return res.json({success: false, message: error.message});
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    })

    return res.json({success: true, message: "Logged Out"})
    
  } catch (error) {
    return res.json({success: false, message: error.message});
  }
}

export const sendVerifyOtp = async (req, res) => {
  try {
    const { email } = req.body; // Changed to accept email instead of userId for more flexibility or use req.auth if logged in usage (but typically this is for unverified/pre-login)
    // Actually, usually you might need to send to the logged in user or a user attempting a flow. 
    // The previous code used userId which implies they were logged in or we passed it. 
    // Let's stick to the flow where verify is called after register or login attempt.
    
    // For now, let's assume we pass { email } or we use middleware if it was protected. 
    // But since they can't login, they can't use middleware.
    // Let's assume frontend sends email.
    
    const user = await User.findOne({email});

    if (!user) {
        return res.json({success: false, message: "User not found"});
    }

    if (user.isAccountVerified) {
      return res.json({success: false, message: 'Account Already verified'});
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000
    await user.save();

    const mailOption = { 
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: 'Account Verification OTP',
      html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}",user.email)
     }
     await transporter.sendMail(mailOption);

     res.json({ success: true, message: 'Verification OTP Sent on Email'});

  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

export const verifyEmail = async (req, res) => {
  const {email, otp} = req.body;

  if (!email || !otp) {
    return res.json({ success: false, message: "Missing Details" })
  }
  try {
    const user = await User.findOne({email});

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.verifyOtp === '' || user.verifyOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" })
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP Expired" });
    }

    user.isAccountVerified = true;
    user.verifyOtp = '';
    user.verifyOtpExpireAt = 0;
    await user.save();

    // Login the user after verification
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
  
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", // Adjust based on your env
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true, message: 'Email verified successfully' })

  } catch (error) {
    return res.json({ success: false, message: error.message })
  }
}

export const isAuthenticated = async (req, res) => {
  try {
    // If middleware runs successfully, this runs.
    // However, we need to check if we attached user to req.
    // Oh wait, we haven't implemented the middleware yet (verifyToken).
    // The previous isAuthenticated just returned true.
    // We need to add the verification logic here OR use a middleware.
    // Since we used `authRouter.get('/is-auth', isAuthenticated)`, it has no middleware attached in the route definition.
    // So we must verify token here.
    
    const { token } = req.cookies;
    
    if(!token) {
        return res.json({ success: false, message: 'Not Authorized. Please Login Again.' })
    }
    
    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
        if(tokenDecode.id){
             return res.json({ success: true });
        }
    } catch (e) {
        return res.json({ success: false, message: e.message });
    }
    return res.json({ success: false, message: 'Not Authorized. Please Login Again.' });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
}

export const sendResetOTP = async (req, res) => {
  const {email} = req.body;

  if (!email) {
    return res.json({success: false, message: 'Email is required'})
  }

  try {
    const user = await User.findOne({email});
    if (!user) {
      return res.json({success: false, message: 'User not found'});
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000
    await user.save();

    const mailOption = { 
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: 'Password Reset OTP',
      html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)
     }
     await transporter.sendMail(mailOption);

     return res.json({success: true, message: 'OTP sent to your email'})

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
}

export const resetPassword = async (req, res) => {
  const {email, otp, newPassword} = req.body;

  if (!email || !otp || !newPassword) {
    return res.json({success: false, message: 'Email, OTP and new password are required'});
  }

  try {
    const user = await User.findOne({email});
    if (!user) {
      return res.json({success: false, message: 'User not found'});
    }

    if (user.resetOtp === '' || user.resetOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" })
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: 'OTP Expired' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetOtp = '';
    user.resetOtpExpireAt = 0;
    await user.save();

    return res.json({ success:true, message: 'Password has been reset successfully.' })

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
}
