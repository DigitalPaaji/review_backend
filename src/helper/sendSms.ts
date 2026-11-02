
import axios from "axios";

const sendSms = async (mobile: string, otp: string) => {
  try {
     const response = await axios.post(
      "https://console.authkey.io/restapi/requestjson.php",
      {
        country_code: "91",
        mobile,
        wid: process.env.AUTHKEY_WHATSAPP_WID,
        type: "text",
        bodyValues: {
          "1": otp,
        },
      },
      {
        headers: {
          Authorization: `Basic ${process.env.AUTHKEY_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

   
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
