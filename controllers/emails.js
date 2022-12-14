import nodemailer from "nodemailer";
import nodemailgun from "nodemailer-mailgun-transport";
import { supabase } from "../utils/supabaseClient.js";

const auth = {
  auth: {
    api_key: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
  },
};

const transporter = nodemailer.createTransport(nodemailgun(auth));

export const sendEmail = async (req, res) => {
  const { email, subject, text } = req.body;
  const mailOptions = {
    from: "festus from appointly <festus@email.appointly.co>",
    to: "murimifestus09@gmail.com",
    subject: "Testing email",
    text: "hello there",
    template: "signup",
    "h:X-Mailgun-Variables": JSON.stringify({
      firstname: "test",
    }),
  };
  transporter.sendMail(mailOptions, (err, data) => {
    if (err) {
      return console.log("error occured", err);
    } else {
      return console.log("email sent");
    }
  });
};

// thanks for signup
export const thanksForSignup = async (req, res) => {
  const { email } = req.email;

  const mailOptions = {
    from: "festus from appointly <festus@email.appointly.co>",
    to: email,
    subject: "welcome email",
    template: "signup",
    "h:X-Mailgun-Variables": JSON.stringify({
      firstname: "test",
    }),
  };
  transporter.sendMail(mailOptions, (err, data) => {
    if (err) {
      return console.log("error occured", err);
    } else {
      return console.log("signup email sent");
    }
  });
};
// appointment confirmation
// TODO : CREATE LINK TO MEETING
export const appointmentConfirmation = async (req, res, next) => {
  const { client_id, schedule_id, date } = req.body;

  const { data: email, error } = await supabase
    .from("Client")
    .select("email")
    .eq("id", client_id);

  const { data: schedule, error: err } = await supabase
    .from("Schedule")
    .select(
      `from, to,
    Members (
        email
    )
    `
    )
    .eq("id", schedule_id);

  const mailOptions = {
    from: "festus from appointly <festus@email.appointly.co>",
    to: email[0].email,
    subject: "Heres your appointment",
    template: "confirmappointment-01",
    "h:X-Mailgun-Variables": JSON.stringify({
      day: date,
      start: schedule[0].from,
      end: schedule[0].to,
      link: "www.test.com", // ! we need to generate dynamic
    }),
  };

  transporter.sendMail(mailOptions, (err, data) => {
    if (err) {
      return console.log("error occured", err);
    } else {
      req.body = {
        client_id: client_id,
        schedule_day: date,
        schedule_start: schedule[0].from,
        schedule_end: schedule[0].to,
        schedule_link: "www.test.com", // we need to generate dynamic
        owner_email: schedule[0].Members.email,
      };

      return next();
    }
  });
};

// client booked appointment
// TODO : GET EMAIL FROM FOREIGN KEY
export const clientBookedAppointment = async (req, res) => {
  const {
    client_id,
    schedule_day,
    schedule_start,
    schedule_end,
    schedule_link,
    owner_email,
  } = req.body;

  const { data: client, error } = await supabase
    .from("Client")
    .select("first_name, last_name, email")
    .eq("id", client_id);

  if (error) {
    return console.log("error occured", error);
  }

  const mailOptions = {
    from: "festus from appointly <festus@email.appointly.co>",
    to: owner_email,
    subject: "Someone just booked an appointment",
    template: "clientbookedappointment-01",
    "h:X-Mailgun-Variables": JSON.stringify({
      first_name: client[0].first_name,
      last_name: client[0].last_name,
      day: schedule_day,
      from: schedule_start,
      to: schedule_end,
      link: schedule_link, // ! we need to generate dynamic
    }),
  };

  transporter.sendMail(mailOptions, (err, data) => {
    if (err) {
      return console.log("error occured", err);
    } else {
      return console.log("appointment booked email sent");
    }
  });
};

// meeting confirmation
export const meetingConfirmation = async (req, res, next) => {
  const { meeting_id, email, first_name, amount_paid } = req.body;

  console.log("invite email sent");

  const { data: meeting, error } = await supabase
    .from("Meetings")
    .select("title, description, date_start, time, duration, external_link")
    .eq("id", meeting_id);

  if (error) {
    return res
      .json({
        code: 400,
        message: "error occured sending email",
      })
      .status(400);
  }

  // debug this code
  if (meeting.length === 0) {
    return res
      .json({
        code: 400,
        message: "meeting not found",
      })
      .status(400);
  }

  const mailOptions = {
    from: "festus from appointly <festus@email.appointly.co>",
    to: email,
    subject: "Thanks for joining the meeting",
    template: "confirmmeeting-01",
    "h:X-Mailgun-Variables": JSON.stringify({
      first_name: first_name,
      title: meeting[0].title,
      date_start: meeting[0].date_start,
      time: meeting[0].time,
      duration: meeting[0].duration,
      link: meeting[0].external_link,
    }),
  };
  transporter.sendMail(mailOptions, (err, data) => {
    if (err) {
      return console.log("error sending  email occured", err);
    } else {
      req.body = {
        meeting_id: meeting_id,
        first_name: first_name,
        amount_paid: amount_paid,
      };
      return next();
    }
  });
};

// invite signed up for meeting
export const inviteSignedUpForMeeting = async (req, res) => {
  const { meeting_id, first_name, amount_paid } = req.body;

  console.log("invite email sent");

  const { data: meeting, error } = await supabase
    .from("Meetings")
    .select(
      `title, description, date_start, time, duration, link,
    Members (
        email
    )
    `
    )
    .eq("id", meeting_id);

  const mailOptions = {
    from: "festus from appointly <festus@email.appointly.co>",
    to: meeting[0].Members.email,
    subject: "Someone registred for a meeting",
    template: "clientjoinedmeeting-01",
    "h:X-Mailgun-Variables": JSON.stringify({
      first_name: first_name,
      amount_paid: amount_paid,
      title: meeting[0].title,
      date_start: meeting[0].date_start,
      time: meeting[0].time,
      duration: meeting[0].duration,
    }),
  };
  transporter.sendMail(mailOptions, (err, data) => {
    if (err) {
      return console.log("error occured", err);
    } else {
      return console.log("signup email sent");
    }
  });
};
