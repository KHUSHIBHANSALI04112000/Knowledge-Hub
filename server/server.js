// server/server.js
const express = require('express');
const session = require('express-session');
const Keycloak = require('keycloak-connect');
const keycloakConfig = require('./keycloak-config');
const cors = require('cors');
const app = express();
const axios = require('axios');
app.use(cors());
// Create session store
const memoryStore = new session.MemoryStore();
app.use(express.json()); 
app.use(session({
  secret: 'a very secret key',
  resave: false,
  saveUninitialized: true,
  store: memoryStore
}));

const keycloak = new Keycloak({ store: memoryStore }, keycloakConfig);

app.use(keycloak.middleware());

const OUTLINE_BASE_URL = "http://localhost:4000";
const OUTLINE_API_KEY = "ol_api_4spqdLHM0Gc20H7YzdEc5uINgHS56qAQe8RdER"; // Your Outline API key
const CHATWOOT_API_URL = "http://localhost:3000/api/v1";
const CHATWOOT_ACCOUNT_ID = 1;
const CHATWOOT_API_TOKEN = "v3y6chXwHbWzhzkqLQjL9dgD";

// This webhook endpoint listens for Chatwoot messages
app.post("/webhook", async (req, res) => {
  console.log("Webhook received with payload:", JSON.stringify(req.body, null, 2));

  try {
    const payload = req.body;
    // Extract message text from the payload
    const messageText = (payload.payload && payload.payload.content) || payload.content || "";
    const conversationID = payload.conversation?.id;

    console.log("Received Message Text:", messageText);

    // Only process messages that start with "/ask"
    if (messageText.trim().toLowerCase().startsWith("/ask")) {
      // Remove the "/ask" prefix and trim the remaining query text
      const queryText = messageText.trim().substring(4).trim();
      console.log("Extracted Query Text:", queryText);

      if (queryText.length > 0) {
        // Build the Outline API search request payload
        const outlineSearchPayload = {
          offset: 0,
          limit: 25,
          query: queryText,
          statusFilter: ["published"],
          dateFilter: "month"
        };

        // Execute the Outline search API call
        const outlineResponse = await axios.post(
          `${OUTLINE_BASE_URL}/api/documents.search`,
          outlineSearchPayload,
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${OUTLINE_API_KEY}`
            }
          }
        );

        console.log("Outline API Response:", JSON.stringify(outlineResponse.data, null, 2));

        // Process the returned results (the sample response shows results inside the `data` array)
        const results = outlineResponse.data?.data;
        if (results && results.length > 0) {
          // Map through the results to create a list of links for each document found
          const linksList = results.map(result => {
            const doc = result.document;
            // Construct the full URL to view the document by concatenating the Outline base URL and doc.url
            const docLink = `${OUTLINE_BASE_URL}${doc.url}`;
            return `- **${doc.title}**: [View](${docLink})`;
          });

          // Build the reply content string listing all found documents
          const replyContent = `Here are the documents I found:\n\n${linksList.join("\n")}`;
          console.log("Reply Content to send:", replyContent);

          // Post the reply message to the Chatwoot conversation
          const chatwootResponse = await axios.post(
            `${CHATWOOT_API_URL}/accounts/${CHATWOOT_ACCOUNT_ID}/conversations/${conversationID}/messages`,
            { content: replyContent },
            { headers: { api_access_token: CHATWOOT_API_TOKEN } }
          );

          console.log("Chatwoot API Response:", chatwootResponse.data);
        } else {
          // If no results are found, let the user know
          console.log("No Outline results found for query:", queryText);
          const replyContent = `No documents found for query "${queryText}".`;
          await axios.post(
            `${CHATWOOT_API_URL}/accounts/${CHATWOOT_ACCOUNT_ID}/conversations/${conversationID}/messages`,
            { content: replyContent },
            { headers: { api_access_token: CHATWOOT_API_TOKEN } }
          );
        }
      } else {
        console.log("Query text after '/ask' is empty.");
      }
    } else {
      console.log("Message does not start with '/ask'. Ignoring Outline query.");
    }
  } catch (error) {
    console.error("Webhook Error:", error.response?.data || error.message);
  }

  res.sendStatus(200);
});
const port = 3200;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
