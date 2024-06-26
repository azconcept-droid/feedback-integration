const express = require("express");
const { google } = require("googleapis");

const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/", async (req, res) => {
  const { feedback, suggestion } = req.body;

  const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });

  // Create client instance for auth
  const client = await auth.getClient();

  // Instance of Google Sheets API
  const googleSheets = google.sheets({ version: "v4", auth: client });

  const spreadsheetId = "1QEEAObRw1bFxrATbiNUzdq7j04vaEWnMKDHkWc2B88U";

  // Get metadata about spreadsheet
  const metaData = await googleSheets.spreadsheets.get({
    auth,
    spreadsheetId,
  });

  // Read rows from spreadsheet
  const getRows = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: "Form Responses 1",
  });

  // Generate timestamp
  const currentDate = new Date();
  // Extract the day, month, and year from the Date object
  const day = currentDate.getDate();
  const month = currentDate.getMonth() + 1; // Months are zero-based, so add 1
  const year = currentDate.getFullYear();
  // Format the date as day/month/year
  const timeStamp = `${day}/${month}/${year}`;

  // Write row(s) to spreadsheet
  await googleSheets.spreadsheets.values.append({
    auth,
    spreadsheetId,
    range: "'Form Responses 1'!B:D",
    valueInputOption: "USER_ENTERED",
    resource: {
      values: [
        [ timeStamp, "Feedback type", feedback, suggestion ]
      ],
    },
  });

  res.send("Successfully submitted! Thank you!");
  // res.send(getRows)
});

app.listen(1337, (req, res) => console.log("running on 1337"));
