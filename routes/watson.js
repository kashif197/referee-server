// 1. Import dependencies
const express = require("express");
const router = express.Router();
const AssistantV2 = require("ibm-watson/assistant/v2");
const { IamAuthenticator } = require("ibm-watson/auth");

// 2. Create Instance of Assistant

// 2.1 First authenticate
const authenticator = new IamAuthenticator({
  apikey: process.env.WATSON_ASSISTANT_APIKEY,
});

// 2.2 Connect to assistant
const assistant = new AssistantV2({
  version: "2019-06-14",
  authenticator: authenticator,
  url: process.env.WATSON_ASSISTANT_URL,
});

// 3. Route to Handle Session Tokens
// GET /api/watson/session
router.get("/session", async (req, res) => {
  // If successs
  try {
    const session = await assistant.createSession({
      assistantId: process.env.WATSON_ASSISTANT_ID,
    });
    res.json(session["result"]);

    // If fail
  } catch (err) {
    res.send("There was an error processing your request.");
    console.log(err);
  }
});

// 4. Handle Messages
// POST /api/watson/message
router.post("/message", async (req, res) => {
  // Construct payload
  payload = {
    assistantId: process.env.WATSON_ASSISTANT_ID,
    sessionId: req.headers.session_id,
    input: {
      message_type: "text",
      text: req.body.input,
    },
  };

  // If successs
  try {
    const message = await assistant.message(payload);
    // res.json(message["result"]);
    // res.json(message.result.output.generic[0].text)
    // console.log(message.result.output.generic[0].text)
    // Display the output from assistant, if any. Supports only a single
    // response.
    if (message.result.output.generic) {
      if (message.result.output.generic.length > 0) {
        switch (message.result.output.generic[0].response_type) {
          case 'text':
            // It's a text response, so we just display it.
            // console.log(message.result.output.generic[0].text);
            res.json(message.result.output.generic[0])
            break;
          case 'option':
            // It's an option response, so we'll need to show the user
            // a list of choices.
            // console.log(message.result.output.generic[0].title);
            res.json(message.result.output.generic[0])

            const options = message.result.output.generic[0].options;
            // List the options by label.
            for (let i = 0; i < options.length; i++) {
              // console.log((i+1).toString() + '. ' + options[i].label);
              res.json((i+1).toString() + '. ' + options[i])
            }
            break;
        }
      }
    }



    // If fail
  } catch (err) {
    res.send("There was an error processing your request.");
    console.log(err);
  }
});

// 5. Export routes
module.exports = router;
