import { supabase } from "../utils/supabaseClient.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

export const testUser = async (req, res) => {
  res
    .json({
      code: "200",
      message: "route works successfully",
    })
    .status(200);
};

// sign in a user with their password
export const login = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  console.log(email, password);
  const { user, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    return res
      .json({
        code: "400",
        error,
      })
      .status(400);
  }

  let { data: id, error1 } = await supabase
    .from("Members")
    .select("id")
    .eq("email", email)
    .single();

  if (error1) {
    return res
      .json({
        code: "400",
        error,
      })
      .status(400);
  }

  const details = { user: id };

  /// generate a token for the user query database for email and return id
  const token = jwt.sign(details, process.env.ACESS_TOKEN_SECRET);

  return res
    .send({
      code: "200",
      message: "user logged in",
      id,
    })
    .status(200);
};

//sign up a user
export const signUp = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const { user, error } = await supabase.auth.signUp({
    email: email,
    password: password,
  });

  if (error) {
    return res
      .json({
        code: "400",
        error,
      })
      .status(400);
  }

  return res.send(user).status(200);
};

// upload image to bucket and get public url
export const uploadImage = async (req, res) => {
  console.log("uploading image............");
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
export const createMeeting = async (req, res) => {
  console.log("uploading meeting............");
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
  const owner = req.body.owner;
  const filename = req.body.filename;

  console.log(
    title,
    description,
    payment,
    capacity,
    link,
    external_link,
    status,
    date,
    time,
    duration,
    owner
  );
  // create signed url
  const { data: publicUrl, err } = await supabase.storage
    .from("meetings")
    .getPublicUrl(`${filename}`);

  console.log(publicUrl);

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
      link: link,
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
    console.log(error1);
    return res
      .json({
        code: "400",
        error,
      })
      .status(400);
  }

  console.log("uploaded meeting............");

  return res
    .send({
      code: "200",
      message: "meeting created successfully",
      data,
    })
    .status(200);
};

//get all meetings that user created
export const getMeetings = async (req, res) => {
  const owner = req.query.owner;

  console.log(owner, "owner");
  const { data: meetings, error } = await supabase
    .from("Meetings")
    .select("*")
    .eq("owner", owner);

  if (error) {
    console.log("error occured", error);
    return res
      .json({
        code: "400",
        error,
      })
      .status(400);
  }
  console.log(meetings);
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
    .select("*")
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

//check if a specific meeting exists
//check if meeting has passed
export const getMeetingHomepage = async (req, res) => {
  const link = req.body.link;
  const date = Date.now();
  const { data, error } = await supabase
    .from("Meetings")
    .select("link, payment_amount, owner, id")
    .eq("link", link);
  if (Object.keys(data).length === 0) {
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

  return res.send({ data, date }).status(200);
};

// insert personal details to invites
export const insertPersonal = async (req, res) => {
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const email = req.body.email;
  const mpesaphone = req.body.mpesaphone;
  const status = req.body.status;
  const meeting_id = req.body.meeting_id;
  const amount_paid = req.body.amount_paid;
  const owner_meeting = req.body.owner_meeting;

  const { data, error } = await supabase.from("Invites").insert([
    {
      first_name: firstname,
      last_name: lastname,
      email: email,
      mpesa_number: mpesaphone,
      status: status,
      meeting_id: meeting_id,
      amount_paid: amount_paid,
      owner_meeting: owner_meeting,
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
      message: "personal details update successfully",
    })
    .status(200);
};

// get personal details dashboard //
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

//update user details
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

// get list of all schedules from a member
export const getSchedules = async (req, res) => {
  const owner = req.query.q; // please note that this is a query not a body
  const { data: Schedule, error } = await supabase
    .from("Schedule")
    .select("*")
    .eq("member_id", owner);

  const { data: Member, error: error1 } = await supabase
    .from("Members")
    .select(
      "first_name, last_name, photoUrl, long_description, short_description, appointment_duration, appointment_amount"
    )
    .eq("id", owner);

  if (error) {
    return res
      .json({
        code: "400",
        error,
      })
      .status(400);
  }

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
export const postAppointment = async (req, res) => {
  const { member_id, client_id, status, schedule_id } = req.body;
  //we create appointment
  const { data: appointment, error } = await supabase
    .from("Appointment")
    .insert([
      {
        member_id: member_id,
        status: status,
        client_id: client_id,
        schedule_id: schedule_id,
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
    .eq("member_id", member_id)
    .eq("client_id", client_id)
    .eq("schedule_id", schedule_id);

  if (error1) {
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
      message: "appointment added successfully",
      appointment_id,
    })
    .status(200);
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
    .select("first_name, last_name, photoUrl")
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
export const postSchedule = async (req, res) => {
  const link = req.body.link;
  const data = req.body.scheduled;

  const { data: Schedule, error } = await supabase
    .from("Schedule")
    .insert(data);

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
      Schedule,
    })
    .status(200);
};

// signup new member
export const postMember = async (req, res) => {
  console.log("creating user ..........");

  const { email, password } = req.body;

  const { data: user, error } = await supabase.auth.signUp({
    email: email,
    password: password,
  });

  if (error) {
    return res
      .json({
        code: "400",
        error,
      })
      .status(400);
  }

  console.log("user created successfully");

  return res.json({
    code: "200",
    message: "member added successfully",
    user,
  });
};

// upate created member with additional information
export const updateMember = async (req, res) => {
  console.log("updating user ..........");
  const { first_name, last_name, ip_address, id, email } = req.body;

  console.log(first_name, last_name, ip_address, id, email);

  const { data: Member, error } = await supabase
    .from("Members")
    .update([
      {
        first_name: first_name,
        last_name: last_name,
        ip_address: ip_address,
        email: email,
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

  console.log("updated user ..........");

  return res.json({
    code: "200",
    message: "member updated successfully",
    Member,
  });
};

// update user profile details
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

  console.log(filename);

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

  console.log(publicUrl);

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
