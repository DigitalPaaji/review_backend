
import axios from "axios";

const sendSms = async (mobile: string, otp: string) => {
  try {
    const response = await axios.get(
      "https://api.authkey.io/request",
      {
        params: {
          authkey: process.env.AUTHKEY_API_KEY,
          mobile,
          country_code: "91",
          sid: process.env.AUTHKEY_OTP_SID,
          otp,
        },
        timeout: 15000,
      }
    );

    console.log("Authkey Response:", response.data);

    // Do not assume HTTP 200 means SMS was accepted.
    // Confirm the actual success response from Authkey.
    return {
      success: true,
      data: response.data,
    };

  } catch (error: any) {
    console.error(
      "Authkey Error:",
      error.response?.data || error.message
    );

    return {
      success: false,
      message: error.response?.data || error.message,
    };
  }
};

export default sendSms;
