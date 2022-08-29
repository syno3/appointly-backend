import { supabase } from "../utils/supabaseClient.js";

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

  return res.send(user).status(200);
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

//create a new meeting
export const createMeeting = async (req, res) => {
  const title = req.body.title;
  const description = req.body.description;
  const payment = req.body.payment;
  const capacity = req.body.capacity;
  const type = req.body.type;
  const link = req.body.link;
  const status = req.body.status;
  const date_start = req.body.date_start;
  const time = req.body.time;
  const duration = req.body.duration;
  const cover = req.body.cover;

  const owner = req.body.owner;

  const { data, error } = await supabase.from("Meetings").insert([
    {
      title: title,
      description: description,
      payment_Amount: payment,
      capacity: capacity,
      type: type,
      link: link,
      status: status,
      date_start: date_start,
      time: time,
      duration: duration,
      coverPhoto: cover,
      owner: owner,
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
    .send({
      code: "200",
      message: "meeting created successfully",
    })
    .status(200);
};

//get all meetings that user created
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

  return res.send(meetings).status(200);
};

//get a specific meeting
export const getMeeting = async (req, res) => {
  const id = req.body.id; //id of meeting in query
  const owner = req.body.owner; //owner of meeting in body
  const { data: meeting, error } = await supabase
    .from("Meetings")
    .select("*")
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

  return res.send(meeting).status(200);
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

//////// create invite //////////

//check if a specific meeting exists
//check if meeting has passed
export const getMeetingHomepage = async (req, res) => {
  const link = req.body.link;
  const date = Date.now();
  const { data, error } = await supabase
    .from("Meetings")
    .select("link")
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
  const firstName = req.body.firstName;
  const lastName = req.body.lastname;
  const email = req.body.email;
  const phone = req.body.phone;
  const mpesaphone = req.body.mpesaphone;
  const status = req.body.status;

  const { data, error } = await supabase.from("Invites").insert([
    {
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone_number: phone,
      mpesa_number: mpesaphone,
      status: status,
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
    .select("first_name, last_name, photoUrl, long_description, short_description, appointment_duration, appointment_amount")
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
