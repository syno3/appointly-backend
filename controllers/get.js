import axios from "axios";
import datetime from "node-datetime";
import { supabase } from "../utils/supabaseClient.js";
import dotenv from "dotenv";
import chromium from "chrome-aws-lambda";
import puppeteer from "puppeteer-core";

dotenv.config();

export const testUser = async (req, res, next) => {
  res
    .json({
      code: "200",
      message: "route works successfully",
    })
    .status(200);

  req.body = {
    meeting_id: "548eceea-5983-451c-9280-eac85647c882",
    first_name: "festus",
    email: "murimifestus09@gmail.com",
    amount_paid: "100",
  };
  return next();
};

//update user details
// ? authenticated with supabase auth
export const updateUser = async (req, res) => {
  const user = req.body.user;
  const first_name = req.body.firstName;
  const last_name = req.body.lastName;
  const photoUrl = req.body.photoUrl;

  const { data, error } = await supabase
    .from("Members")
    .update([
      {
        first_Name: first_name,
        last_Name: last_name,
        photoUrl: photoUrl,
      },
    ])
    .eq("id", user);

  if (error) {
    return res
      .json({
        code: "400",
        error,
      })
      .status(400);
  }

  return res.json({
    code: "200",
    message: "details updated successfully",
  });
};

// upload image to bucket and get public url
export const uploadImage = async (req, res) => {
  const { file, filename } = req.body;

  // upload file to bucket
  const { data: image, error } = await supabase.storage
    .from("meetings")
    .upload(`${filename}`, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    return res
      .json({
        code: "400",
        error,
      })
      .status(400);
  }

  res
    .send({
      code: "200",
      message: "image uploaded successfully",
      publicUrl,
    })
    .status(200);
};

//create a new meeting
// ! working with authorization
export const createMeeting = async (req, res) => {
  const title = req.body.title;
  const description = req.body.description;
  const payment = req.body.payment;
  const capacity = req.body.capacity;
  const external_link = req.body.external_link;
  const status = req.body.status;
  const date = req.body.date;
  const time = req.body.time;
  const duration = req.body.duration;
  const owner = req.body.owner;
  const filename = req.body.filename;

  // create signed url
  const { data: publicUrl, err } = await supabase.storage
    .from("meetings")
    .getPublicUrl(`${filename}`);

  if (err) {
    return res
      .json({
        code: "400",
        err,
      })
      .status(400);
  }

  // insert meeting to supabase database with cover image url
  const { data, error1 } = await supabase.from("Meetings").insert([
    {
      title: title,
      description: description,
      payment_amount: payment,
      capacity: capacity,
      status: status,
      date_start: date,
      time: time,
      coverPhoto: publicUrl.publicUrl,
      duration: duration,
      owner: owner,
      external_link: external_link,
    },
  ]);

  if (error1) {
    return res
      .json({
        code: "400",
        error,
      })
      .status(400);
  }

  return res
    .send({
      code: "200",
      message: "meeting created successfully",
      data,
    })
    .status(200);
};

//get all meetings that user created
// ! working with authorization
export const getMeetings = async (req, res) => {
  const owner = req.query.owner;

  const { data: meetings, error } = await supabase
    .from("Meetings")
    .select("*")
    .eq("owner", owner);

  if (error) {
    return res
      .json({
        code: "400",
        error,
      })
      .status(400);
  }
  return res
    .send({
      code: "200",
      message: "meetings fetched successfully",
      meetings,
    })
    .status(200);
};

//get a specific meeting
export const getMeeting = async (req, res) => {
  const id = req.query.id; //id of meeting in query
  const { data: meeting, error } = await supabase
    .from("Meetings")
    .select(
      `*
    ,owner (
      id,
      first_name,
      last_name,
      photoUrl
    )
    `
    )
    .eq("id", id);

  if (error) {
    return res
      .json({
        code: "400",
        error,
      })
      .status(400);
  }

  return res
    .json({
      code: "200",
      message: "meeting fetched successfully",
      meeting,
    })
    .status(200);
};
/// get session host meeting
export const getSessionHostMeeting = async (req, res) => {
  const id = req.query.id; //id of meeting in query
  const { data: Host, error } = await supabase
    .from("Host")
    .select('first_name, last_name, role, image')
    .eq("meeting_id", id);

  if (error) {
    return res
      .json({
        code: "400",
        error,
      })
      .status(400);
  }

  return res
    .json({
      code: "200",
      message: "Host fetched successfully",
      Host,
    })
    .status(200);
}
//delete a meeting
export const deleteMeeting = async (req, res) => {
  const id = req.body.id; //id of meeting in query
  const owner = req.body.owner; //owner of meeting in body
  const { data: meeting, error } = await supabase
    .from("Meetings")
    .delete()
    .eq("owner", owner)
    .eq("id", id);

  if (error) {
    return res
      .json({
        code: "400",
        error,
      })
      .status(400);
  }

  return res
    .send({
      code: "200",
      message: "meeting deleted successfully",
    })
    .status(200);
};
// update meeting
// TODO : ADD  TIME, DATE AND FILE UPDATE
export const updateMeeting = async (req, res) => {
  const id = req.body.id;
  const title = req.body.title;
  const description = req.body.description;
  const payment = req.body.payment;
  const capacity = req.body.capacity;
  const link = req.body.link;
  const external_link = req.body.external_link;
  const status = req.body.status;
  const date = req.body.date;
  const time = req.body.time;
  const duration = req.body.duration;
  const filename = req.body.filename;

  // create signed url
  if (filename) {
    const { data: publicUrl, err } = await supabase.storage
      .from("meetings")
      .getPublicUrl(`${filename}`);

    if (err) {
      return res
        .json({
          code: "400",
          err,
        })
        .status(400);
    }
  }

  const { data, error } = await supabase
    .from("Meetings")
    .update([
      {
        title: title,
        description: description,
        payment_amount: payment,
        capacity: capacity,
        link: link,
        date_start: date,
        time: time,
        status: status,
        duration: duration,
        external_link: external_link,
      },
    ])
    .eq("id", id);

  if (error) {
    return res
      .json({
        code: "400",
        error,
      })
      .status(400);
  }

  return res
    .send({
      code: "200",
      message: "meeting updated successfully",
      data,
    })
    .status(200);
};

//check if a specific meeting exists
//check if meeting has passed
export const getMeetingHomepage = async (req, res) => {
  const id = req.body.id;
  const { data, error } = await supabase
    .from("Meetings")
    .select(
      `*,
      owner (
          id,
          first_name,
          last_name,
          email
      )
    `
    )
    .eq("id", id);

  // check if data is empty and return error
  if (data && Object.keys(data).length === 0) {
    return res
      .json({
        error: "404",
        message: "meeting dosent exist",
      })
      .status(404);
  }

  if (error) {
    return res
      .json({
        code: "400",
        error,
      })
      .status(400);
  }

  return res
    .json({
      code: "200",
      message: "meeting fetched successfully",
      data,
    })
    .status(200);
};

// insert personal details to invites
export const insertPersonal = async (req, res, next) => {
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const email = req.body.email;
  const mpesaphone = req.body.mpesaphone;
  const status = req.body.status;
  const meeting_id = req.body.meeting_id;
  const amount_paid = req.body.amount_paid;
  const owner_meeting = req.body.owner_meeting;

  const invite = {
    first_name: firstname,
    last_name: lastname,
    email: email,
    mpesa_number: mpesaphone,
    status: status,
    meeting_id: meeting_id,
    amount_paid: amount_paid,
    owner_meeting: owner_meeting, // we need to fix error
  };

  console.log(invite);

  const { data, error } = await supabase.from("Invites").insert([invite]);

  if (error) {
    return res
      .json({
        code: "400",
        error,
      })
      .status(400);
  }

  res
    .json({
      code: "200",
      message: "personal details update successfully",
    })
    .status(200);

  req.body = {
    meeting_id: meeting_id,
    email: email,
    first_name: firstname,
    amount_paid: amount_paid,
  };

  return next();
};

// get personal details dashboard //
// TODO : GET DETAILS FROM ACCESS TOKEN
export const getPersonal = async (req, res) => {
  const user = req.body.user;
  const { data, error } = await supabase
    .from("Members")
    .select("id, earnings, withdrawable_balance")
    .eq("id", user);

  if (error) {
    return res
      .json({
        code: "400",
        error,
      })
      .status(400);
  }

  return res.send(data).status(200);
};
// get list of all schedules from a member
export const getSchedules = async (req, res) => {
  const owner = req.query.q; // please note that this is a query not a body
  const { data: Schedule, error } = await supabase
    .from("Schedule")
    .select(
      `*,
        appointment_id (
            status,
            client_id,
            schedule_id,
            date
        )
        `
    )
    .eq("member_id", owner);

  if (error) {
    return res
      .json({
        code: "400",
        error,
      })
      .status(400);
  }

  const { data: Member, error: error1 } = await supabase
    .from("Members")
    .select(
      "first_name, last_name, photoUrl, long_description, short_description, appointment_duration, appointment_amount"
    )
    .eq("id", owner);

  if (error1) {
    return res
      .json({
        code: "400",
        error1,
      })
      .status(400);
  }

  return res
    .json({
      code: "200",
      Member,
      Schedule,
    })
    .status(200);
};

// get list of all appointments for a member
export const getAppointments = async (req, res) => {
  const owner = req.query.q; // please note that this is a query not a body
  const { data: Appointment, error } = await supabase
    .from("Appointment")
    .select("*")
    .eq("member_id", owner);

  if (error) {
    return res
      .json({
        code: "400",
        error,
      })
      .status(400);
  }

  return res
    .json({
      code: "200",
      Appointment,
    })
    .status(200);
};

// get a list of all clients in table
export const getClients = async (req, res) => {
  const { data: clients, error } = await supabase.from("Client").select("*");

  if (error) {
    return res
      .json({
        code: "400",
        error,
      })
      .status(400);
  }

  return res
    .send({
      code: "200",
      clients,
    })
    .status(200);
};

// post new client
export const postClient = async (req, res) => {
  const { first_name, last_name, phone_number, email } = req.body;
  const { data: Client, error } = await supabase.from("Client").insert([
    {
      first_name: first_name,
      last_name: last_name,
      phone_number: phone_number,
      email: email,
    },
  ]);

  if (error) {
    return res
      .json({
        code: "400",
        error,
      })
      .status(400);
  }

  const { data: client_id, error1 } = await supabase
    .from("Client")
    .select("id")
    .eq("email", email);

  if (error1) {
    return res
      .json({
        code: "400",
        error1,
      })
      .status(400);
  }

  return res
    .json({
      code: "200",
      message: "client added successfully",
      client_id,
    })
    .status(200);
};

// post new appointment
export const postAppointment = async (req, res, next) => {
  const { member_id, client_id, status, schedule_id, date } = req.body;
  //we create appointment
  const { data, error } = await supabase.from("Appointment").insert([
    {
      member_id: member_id,
      status: status,
      client_id: client_id,
      schedule_id: schedule_id,
      date: date,
    },
  ]);

  if (error) {
    return res
      .json({
        code: "400",
        error,
      })
      .status(400);
  }

  // get appointment id
  const { data: appointment_id, error1 } = await supabase
    .from("Appointment")
    .select("id")
    .eq("date", date);

  if (error1) {
    return res
      .json({
        code: "400",
        error,
      })
      .status(400);
  }
  res
    .json({
      code: "200",
      message: "appointment added successfully",
      appointment_id,
    })
    .status(200);

  req.body = {
    client_id: client_id,
    schedule_id: schedule_id,
    date,
  };
  return next();
};

// update schedule to include appointment id
export const updateSchedule = async (req, res) => {
  const { schedule_id, appointment_id } = req.body;
  const { data: Schedule, error } = await supabase
    .from("Schedule")
    .update([
      {
        appointment_id: appointment_id,
      },
    ])
    .eq("id", schedule_id);

  if (error) {
    return res
      .json({
        code: "400",
        error,
      })
      .status(400);
  }
  return res.json({
    code: "200",
    message: "schedule updated successfully",
    Schedule,
  });
};

// get amount information from members table
// ! working with authorization
export const getAmount = async (req, res) => {
  const user = req.query.user; // please note that this is a query not a body
  const { data: Member, error } = await supabase
    .from("Members")
    .select("earnings, withdrawable_balance, link, photoUrl")
    .eq("id", user);

  if (error) {
    return res
      .json({
        code: "400",
        error,
      })
      .status(400);
  }

  return res.json({
    code: "200",
    Member,
  });
};

// get basic information from members table
export const getBasic = async (req, res) => {
  const user = req.query.user; // please note that this is a query not a body
  const { data: Member, error } = await supabase
    .from("Members")
    .select("*")
    .eq("id", user);

  if (error) {
    return res
      .json({
        code: "400",
        error,
      })
      .status(400);
  }

  return res.json({
    code: "200",
    Member,
  });
};

// create new schedule
// ! working with authorization
export const postSchedule = async (req, res) => {
  const link = req.body.link;
  const record = req.body.scheduled;

  // check if record exists and overrvide if it does
  const { data, error } = await supabase.from("Schedule").insert(record);

  if (error) {
    return res
      .json({
        code: "400",
        error,
      })
      .status(400);
  }

  return res
    .json({
      code: "200",
      message: "schedule added successfully",
      data,
    })
    .status(200);
};

// update user profile details
// ! working with authorization
export const updateProfile = async (req, res) => {
  const {
    id,
    display_name,
    short_description,
    long_description,
    appointment_duration,
    appointment_amount,
    filename,
  } = req.body;

  // create signed url
  let { data: publicUrl, err } = await supabase.storage
    .from("meetings")
    .getPublicUrl(`${filename}`);
  if (err) {
    res
      .json({
        code: "400",
        message: "error creating public url",
        err,
      })
      .status(400);
  }

  const { data: Member, error } = await supabase
    .from("Members")
    .update([
      {
        display_name: display_name,
        short_description: short_description,
        long_description: long_description,
        appointment_duration: appointment_duration,
        appointment_amount: appointment_amount,
        photoUrl: publicUrl?.publicUrl,
      },
    ])
    .eq("id", id);

  if (error) {
    return res
      .json({
        code: "400",
        error,
      })
      .status(400);
  }

  return res
    .json({
      code: "200",
      message: "member updated successfully",
      Member,
    })
    .status(200);
};
// lipa na mpesa STK push
export const lipaNaMpesaOnline = async (req, res) => {
  // remove after redeployment
  const { amount_paid, phone, account_ref, transaction_description } = req.body;

  const token = req.mpesaToken;
  const auth = "Bearer " + token;
  const dt = datetime.create();

  const timestamp = dt.format("YmdHMS"); // datetime
  const lipaNaMpesaUrl =
    "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
  const lipaNaMpesaSandbox =
    "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"; /// mpesa url sandbox
  const bs_short_code = process.env.MPESA_BUSINESS_SHORT_CODE;
  const passkey = process.env.MPESA_PASSKEY;

  const password = new Buffer.from(
    bs_short_code + passkey + timestamp
  ).toString("base64");
  const transaction_type = "CustomerPayBillOnline";
  const amount = `${amount_paid}`;
  const party_a = `${phone}`; // phone number making the payment
  const party_b = bs_short_code; // business short code
  const phone_number = party_a;
  const callback_url =
    "https://appointly-backend.vercel.app/api/lipaNaMpesaWebHook"; // callback url
  const account_reference = `${account_ref}`;
  const transaction_desc = `${transaction_description}`;

  const requestData = {
    BusinessShortCode: bs_short_code,
    Password: password,
    Timestamp: timestamp,
    TransactionType: transaction_type,
    Amount: amount,
    PartyA: party_a,
    PartyB: party_b,
    PhoneNumber: phone_number,
    CallBackURL: callback_url,
    AccountReference: account_reference,
    TransactionDesc: transaction_desc,
  };

  try {
    const response = await axios.post(lipaNaMpesaUrl, requestData, {
      insecureHTTPParser: true,
      headers: {
        Authorization: auth,
      },
    });
    const data = response.data;

    const details = {
      BusinessShortCode: bs_short_code,
      password: password,
      timestamp: timestamp,
      CheckoutRequestID: data.CheckoutRequestID,
      MerchantRequestID: data.MerchantRequestID,
      auth: auth,
    };

    return res
      .json({
        code: "200",
        message: "lipa na mpesa online initiated successfully",
        data,
        details,
      })
      .status(200);
  } catch (error) {
    return res
      .json({
        code: "400",
        error,
      })
      .status(400);
  }
};

// webhook for lipa na mpesa
export const lipaNaMpesaWebHook = async (req, res) => {
  console.log("........ lipa na mpesa webhook ........");
  const code = req.body?.Body?.stkCallback["ResultCode"]; // get the code

  if (code == 0) {
    const MerchantRequestID = req.body?.Body?.stkCallback["MerchantRequestID"];
    const CheckoutRequestID = req.body?.Body?.stkCallback["CheckoutRequestID"];
    const ResultCode = req.body?.Body?.stkCallback["ResultCode"];
    const Amount =
      req.body?.Body?.stkCallback["CallbackMetadata"]["Item"]["0"]["Value"];
    const MpesaReceiptNumber =
      req.body?.Body?.stkCallback["CallbackMetadata"]["Item"]["1"]["Value"];
    const TransactionDate =
      req.body?.Body?.stkCallback["CallbackMetadata"]["Item"]["3"]["Value"];
    const PhoneNumber =
      req.body?.Body?.stkCallback["CallbackMetadata"]["Item"]["4"]["Value"];

    const record = {
      MerchantRequestID: MerchantRequestID,
      CheckoutRequestID: CheckoutRequestID,
      ResultCode: ResultCode,
      PhoneNumber: PhoneNumber,
      TransactionDate: TransactionDate,
      MpesaReceiptNumber: MpesaReceiptNumber,
      Amount: Amount,
    };

    console.log(record);

    const { data: transactions, error } = await supabase
      .from("Transactions")
      .insert([record]);

    if (error) {
      console.log("error inserting record");
      return console.log(error);
    }

    return res.json({
      body: req.body,
    });
  }

  return res.json({
    body: req.body,
  });
};

// confirm payment
export const confirmPayment = async (req, res) => {
  const { checkoutrequestid } = req.body;
  const { data: record, error } = await supabase
    .from("Transactions")
    .select("*")
    .eq("CheckoutRequestID", checkoutrequestid);

  if (error) {
    return res
      .json({
        code: "400",
        message: "error fetching record",
        error,
      })
      .status(400);
  }

  return res
    .json({
      code: "200",
      message: "payment confirmed successfully",
      record,
    })
    .status(200);
};

// handle withdrawal requests
export const postWithdrawalRequest = async (req, res) => {
  const { owner_id, amount, phone_number } = req.body;
  const { data: Request, error } = await supabase.from("Withdrawal").insert([
    {
      owner_id: owner_id,
      amount: amount,
      phone_number: phone_number,
      status: "pending",
    },
  ]);
  if (error) {
    return res
      .json({
        code: "400",
        error,
      })
      .status(400);
  }
  return res
    .json({
      code: "200",
      message: "withdrawal request created successfully",
      Request,
    })
    .status(200);
};

// get review for meeting
export const getReviewForMeeting = async (req, res) => {
  const { meeting_id } = req.body;
  const { data: Review, error } = await supabase
    .from("Review")
    .select(
      `*,
        owner (
            first_name,
            last_name,
            photoUrl
        )
        `
    )
    .eq("meeting_id", meeting_id);

  if (error) {
    return res
      .json({
        code: "400",
        error,
      })
      .status(400);
  }

  return res
    .json({
      code: "200",
      message: "review fetched successfully",
      Review,
    })
    .status(200);
};

// create review for meeting
export const createReviewForMeeting = async (req, res) => {
  const { meeting_id, owner, rating, review } = req.body;
  const { data, error } = await supabase.from("Review").insert([
    {
      meeting_id,
      owner,
      rating,
      review,
    },
  ]);

  if (error) {
    return res
      .json({
        code: "400",
        error,
      })
      .status(400);
  }

  return res
    .json({
      code: "200",
      message: "review created successfully",
      data,
    })
    .status(200);
};

// generate pdf with puppeteer
export const generatePdf = async (req, res) => {
  const { url } = req.body;
  try{
    const browser = await puppeteer.launch({
      args: [...chromium.args, "--hide-scrollbars", "--disable-web-security"],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: true,
      ignoreHTTPSErrors: true,
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle0" });
    await page.emulateMediaType("screen");
    const pdf = await page.pdf({
      format: "letter",
      landscape: true,
      preferCSSPageSize: true,
      scale: 1.05,
      printBackground: true,
    });
    await browser.close();
    res.contentType("application/pdf");
    return res.send(pdf);
  } catch (err){
    console.log(err);
    return res.status(500).json({error: err});
  }
}