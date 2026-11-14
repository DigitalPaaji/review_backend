import type { NextFunction, Request, Response } from "express";
import { randomInt } from "node:crypto";
import sendSms from "../helper/sendSms";
import redisClient from "../helper/redisServer";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";
import FormAdmin from "../models/FormAdmin";
import FormPage from "../models/formPageSchema";
import FormdataLeads from "../models/formSendSchema";
import { deleteImage } from "../helper/deleteImage";

export const SendOtpFormAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { phone, password, name } = req.body;

    if (
      !name ||
      !phone ||
      !password ||
      typeof phone !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Name ,Phone and password are required.",
      });
    }

    // 2. Length validation
    if (phone.length > 12 || password.length > 128) {
      return res.status(400).json({
        success: false,
        message: "One or more fields exceed the allowed length.",
      });
    }

    // 3. Phone validation (India)
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit mobile number.",
      });
    }

    // 4. Password validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long.",
      });
    }

    // 5. Business name validation

    // 6. Check existing client
    const alreadyExists = await FormAdmin.findOne({ phone });

    if (alreadyExists) {
      return res.status(409).json({
        success: false,
        message: "An account with this Phone Number already exists.",
      });
    }

    // 7. Generate OTP
    const otp = randomInt(100000, 1000000).toString();

    const cacheKey = `form-client-verify:${phone}`;

    // 8. Save OTP in Redis for 5 minutes
    await redisClient.set(cacheKey, otp, {
      EX: 300,
    });

    // 9. Send OTP using Authkey
    const smsResult = await sendSms(phone, otp);

    if (!smsResult.success) {
      await redisClient.del(cacheKey);

      return res.status(502).json({
        success: false,
        message: "Unable to send OTP. Please try again.",
      });
    }

    // 10. Success response
    return res.status(200).json({
      success: true,
      message: "OTP sent successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOtpFormAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, phone, password, otp } = req.body;
    if (!name || !phone || !password || !otp) {
      return res.status(400).json({
        success: false,
        message: "Name ,Email, password  and Otp are required.",
      });
    }

    if (phone.length > 12 || name.length > 50 || password.length > 128) {
      return res.status(400).json({
        success: false,
        message: "One or more fields exceed the allowed length.",
      });
    }

    if (password.length < 5) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long.",
      });
    }

    const alreadyExists = await FormAdmin.findOne({ phone });

    if (alreadyExists) {
      return res.status(409).json({
        success: false,
        message: "An account with this Phone Number already exists.",
      });
    }

    const cacheKey = `form-client-verify:${phone}`;

    const getOtp = await redisClient.get(cacheKey);

    if (!getOtp) {
      return res.status(409).json({
        success: false,
        message: "Expired Otp.",
      });
    }
    if (getOtp.toString() !== otp.toString()) {
      return res.status(409).json({
        success: false,
        message: "Invalied Otp.",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    await FormAdmin.create({ name, phone, password: hashPassword });

    await redisClient.del(cacheKey);
    return res.status(201).json({
      success: true,
      message: "Client Created",
    });
  } catch (error) {
    next(error);
  }
};

export const loginFormAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Phone and password are required.",
      });
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit mobile number.",
      });
    }

    const findClient = await FormAdmin.findOne({ phone }).select("+password");

    if (!findClient) {
      return res.status(401).json({
        success: false,
        message: "Invalid phone or password.",
      });
    }

    const comparePassword = await bcrypt.compare(password, findClient.password);

    if (!comparePassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid phone or password.",
      });
    }

    const token = JWT.sign({ id: findClient._id }, process.env.JWT_SECRET!, {
      expiresIn: "90d",
    });

    res.cookie("form_admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 90 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Login successful.",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const logout= async( req: Request,res: Response,next: NextFunction)=>{
try {

 res.clearCookie("form_admin_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successfully",
    });

} catch (error) {
  next(error)
}
}

export const verifyForm_Admin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const client = req.form;

    return res.status(200).json({ success: true, client });
  } catch (error) {
    next(error);
  }
};


export const createForm = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const imagepath = req.file?.filename
    ? `/uploads/${req.file.filename}`
    : null;

  try {
    const user = req.form as any;

    const {
      title,
      description,
      fields: rawFields,
      settings: rawSettings,
      status,
    } = req.body;

    // Validate title
    if (!title?.trim()) {
      if (imagepath) deleteImage(imagepath);

      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    // Parse multipart JSON fields
    let fields;
    let settings;

    try {
      fields =
        typeof rawFields === "string"
          ? JSON.parse(rawFields)
          : rawFields;

      settings =
        typeof rawSettings === "string"
          ? JSON.parse(rawSettings)
          : rawSettings;
    } catch {
      if (imagepath) deleteImage(imagepath);

      return res.status(400).json({
        success: false,
        message: "Invalid fields or settings JSON",
      });
    }

    // Validate parsed data
    if (!Array.isArray(fields)) {
      if (imagepath) deleteImage(imagepath);

      return res.status(400).json({
        success: false,
        message: "Fields must be an array",
      });
    }

    if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
      if (imagepath) deleteImage(imagepath);

      return res.status(400).json({
        success: false,
        message: "Invalid form settings",
      });
    }

    // Find admin
    const formAdmin = await FormAdmin.findById(user._id);

    if (!formAdmin) {
      if (imagepath) deleteImage(imagepath);

      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Check form page limit
    if (formAdmin.formpageLimit <= formAdmin.formPage.length) {
      if (imagepath) deleteImage(imagepath);

      return res.status(403).json({
        success: false,
        message: "Form page limit full",
      });
    }

    // Generate unique slug
    const slug = `${title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}-${Date.now()}`;

    // Create form
    const formCreateData = await FormPage.create({
      title: title.trim(),
      slug,
      description,
      settings,
      bannerImage: imagepath,
      status: status || "draft",
      createdBy: formAdmin._id,
      fields,
    });

    // Add form ID to admin
    formAdmin.formPage.push(formCreateData._id);
    await formAdmin.save();

    return res.status(201).json({
      success: true,
      message: "Form created successfully",
      formCreateData: {
        title: formCreateData.title,
        _id: formCreateData._id,
      },
    });
  } catch (error) {
    if (imagepath) deleteImage(imagepath);
    next(error);
  }
};


export const getMyForm = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const formId = req.params.id;
    const user = req.form as any;

    const formPage = await FormPage.findOne({
      _id: formId,
      createdBy: user._id,
    });

    if (!formPage) {
      return res
        .status(401)
        .json({ success: false, message: "Form Page not found" });
    }

    return res.status(200).json({ success: true, formPage });
  } catch (error) {
    next(error);
  }
};


export const updateForm = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const newImagePath = req.file?.filename
    ? `/uploads/${req.file.filename}`
    : null;

  try {
    const formId = req.params.id;
    const user = req.form as any;

    const {
      title,
      description,
      fields: rawFields,
      settings: rawSettings,
      status,
      removeBanner,
    } = req.body;

    // Validate title
    if (!title?.trim()) {
      if (newImagePath) deleteImage(newImagePath);

      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    // Find form
    const formPage = await FormPage.findOne({
      _id: formId,
      createdBy: user._id,
    });

    if (!formPage) {
      if (newImagePath) deleteImage(newImagePath);

      return res.status(404).json({
        success: false,
        message: "Form Page not found",
      });
    }

    // Parse JSON fields
    let fields;
    let settings;

    try {
      fields =
        typeof rawFields === "string"
          ? JSON.parse(rawFields)
          : rawFields;

      settings =
        typeof rawSettings === "string"
          ? JSON.parse(rawSettings)
          : rawSettings;
    } catch {
      if (newImagePath) deleteImage(newImagePath);

      return res.status(400).json({
        success: false,
        message: "Invalid fields or settings JSON",
      });
    }

    // Validate fields
    if (!Array.isArray(fields)) {
      if (newImagePath) deleteImage(newImagePath);

      return res.status(400).json({
        success: false,
        message: "Fields must be an array",
      });
    }

    if (
      !settings ||
      typeof settings !== "object" ||
      Array.isArray(settings)
    ) {
      if (newImagePath) deleteImage(newImagePath);

      return res.status(400).json({
        success: false,
        message: "Invalid form settings",
      });
    }

    // Save previous banner path
    const oldImagePath = formPage.bannerImage;

    // Update form data
    formPage.title = title.trim();
    formPage.description = description || "";
    formPage.fields = fields;
    formPage.settings = settings;
    formPage.status = status || "draft";

    // Banner handling
    if (newImagePath) {
      // New image uploaded: replace old image
      formPage.bannerImage = newImagePath;
    } else if (removeBanner === "true" || removeBanner === true) {
      // User requested banner removal
      formPage.bannerImage = null;
    }

    // Save database first
    await formPage.save();

    // Delete old image only after successful database update
    if (
      oldImagePath &&
      oldImagePath !== formPage.bannerImage
    ) {
      deleteImage(oldImagePath);
    }

    return res.status(200).json({
      success: true,
      message: "Form Updated",
      formCreateData: {
        _id: formPage._id,
        title: formPage.title,
        description: formPage.description,
        slug: formPage.slug,
        status: formPage.status,
        bannerImage: formPage.bannerImage,
        fields: formPage.fields,
        settings: formPage.settings,
      },
    });
  } catch (error) {
    // Remove newly uploaded image if update fails
    if (newImagePath) {
      deleteImage(newImagePath);
    }

    next(error);
  }
};


export const deleteForm = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const formId = req.params.id;
    const user = req.form as any;

    const formAdmin = await FormAdmin.findById(user._id);
    if (!formAdmin) {
      return res.status(401).json({ success: false, mesage: "User not found" });
    }

    const deleteFormData = await FormPage.findOneAndDelete({
      _id: formId,
      createdBy: user._id,
    });
    if (!deleteFormData) {
      return res
        .status(401)
        .json({ success: false, message: "Form Not Found" });
    }

    formAdmin.formPage = formAdmin.formPage.filter(
      (item) => item.toString() !== formId.toString(),
    );
    await formAdmin.save();

    return res.status(200).json({ success: true, message: "Form Delete" });
  } catch (error) {
    next(error);
  }
};




 const VALID_STATUSES = ["new", "read", "archived"] as const;

export const getFormLeads = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const formId = req.params.id;
    const user = req.form as any;

    // 1. Check form ownership
    const formPage = await FormPage.findOne({
      _id: formId,
      createdBy: user._id,
    });

    if (!formPage) {
      return res.status(404).json({
        success: false,
        message: "Form page not found",
      });
    }

    // 2. Pagination
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    // 3. Status filter
    const status = req.query.status as string | undefined;

    if (status && !VALID_STATUSES.includes(status as any)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
        allowedStatuses: VALID_STATUSES,
      });
    }

    // 4. Build filter
    const filter: Record<string, any> = {
      formId: formPage._id,
      userId: user._id,
    };

    if (status) {
      filter.status = status;
    }

    // 5. Fetch leads and total count
    const [leads, total] = await Promise.all([
      FormdataLeads.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      FormdataLeads.countDocuments(filter),
    ]);

    // 6. Pagination details
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      message: "Form leads fetched successfully",
      data: leads,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });

  } catch (error) {
    next(error);
  }
};







export const getForm = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { slug } = req.params;

    const formData = await FormPage.findOne({ slug });
    if (!formData) {
      return res
        .status(401)
        .json({ success: false, message: "Form data not Found" });
    }
    return res.status(200).json({ success: true, formData });
  } catch (error) {
    next(error);
  }
};

export const SubmitedForm = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { formId, submissionData } = req.body;
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip;

    const formPage = await FormPage.findById(formId);

    if (!formPage) {
      return res
        .status(404)
        .json({ success: false, message: "Form Page not Found" });
    }

    await FormdataLeads.create({
      formId: formPage._id,
      userId: formPage.createdBy,
      submissionData,
      userAgent,
      ipAddress,
    });

    return res
      .status(201)
      .json({ success: true, message: formPage.settings.successMessage });
  } catch (error) {
    next(error);
  }
};
