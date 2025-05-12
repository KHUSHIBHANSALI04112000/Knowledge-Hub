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


const WIKIJS_BASE_URL = "http://localhost:3001"
const CHATWOOT_API_URL = "http://localhost:3000/api/v1";
const CHATWOOT_ACCOUNT_ID=1;
const CHATWOOT_API_TOKEN = "v3y6chXwHbWzhzkqLQjL9dgD"

app.post("/webhook", async (req, res) => {
    console.log("Webhook received with payload:", JSON.stringify(req.body, null, 2));
  
    try {
      const payload = req.body;
  
      const messageText =
        (payload.payload && payload.payload.content) || payload.content || "";
      const conversationID = payload.conversation?.id;
  
      console.log("Received Message Text:", JSON.stringify(messageText));
  
      if (messageText.trim().toLowerCase().startsWith("/ask")) {
        const queryText = messageText.trim().substring(4).trim();
        console.log("Extracted Query Text:", queryText);
  
        if (queryText.length > 0) {
          const graphqlQuery = {
            query: `query ($query: String!) {
              pages {
                search(query: $query) {
                  results {
                    id
                    title
                    path
                  }
                }
              }
            }`,
            variables: { query: queryText },
          };
  
          // Execute the Wiki.js query
          const wikiResponse = await axios.post(
            `${WIKIJS_BASE_URL}/graphql`,
            graphqlQuery,
            {
              headers: { "Content-Type": "application/json" },
            }
          );
  
          console.log("Wiki.js Response:", JSON.stringify(wikiResponse.data, null, 2));
  
          // If matching results are returned, build the reply
          const results = wikiResponse.data?.data?.pages?.search?.results;
          if (results?.length > 0) {
            const linksList = results.map((doc) => {
              const docLink = `${WIKIJS_BASE_URL}${
                doc.path.startsWith("/") ? doc.path : "/" + doc.path
              }`;
              return `- **${doc.title}**: [View](${docLink})`;
            });
  
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
            console.log("No Wiki.js results found for query:", queryText);
          }
        } else {
          console.log("Query text after '/ask' is empty.");
        }
      } else {
        console.log("Message does not start with '/ask'. Ignoring Wiki.js query.");
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
