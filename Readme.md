# Knowledge Hub with Chatwoot Integration
CHATWOOT INTEGRATION WITH THE  OUTLINE KNOWLEDGE BASE 

- **Keycloak Authentication:** Secure user authentication.
- **Outline Knowledge-Base UI:** A self‑hosted, searchable documentation/knowledge base.
- **Chatwoot AI Bot:** A live chat integration that listens for `/ask` queries and responds with relevant information from the Outline KB.
- **Bot Workflow:** A backend bot  that intercepts Chatwoot webhook events, queries OutlineKB based on the content title provided by the user in their request and then the bot posts the relevant content with the link to the document back into Chatwoot UI.

This README details the setup, configuration, and workflow for local development and demo.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
  - [Keycloak Configuration](#keycloak-configuration)
  - [Outline Knowledge-Base](#outline-knowledge-base)
  - [Chatwoot Installation](#chatwoot-installation)
  - [Bot Setup](#bot-setup)
  - [React Frontend](#react-frontend)
- [Bot Flow and Webhook Handling](#bot-flow-and-webhook-handling)
- [Running the Application](#running-the-application)

---

## Overview

This application demonstrates the following workflow:

1. **Authentication:** Users are authenticated via Keycloak SSO.  
   - A realm (e.g., `kb-chat-demo`) is created with client:
     - `kb-ui` (public) for the React UI.
     - And then add user and credentials  which you need to use while logging into the  KB app.
curl http://localhost:4000/api/documents.search \
  --request POST \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer ol_api_O8q6PuZrrKgWq7rpMc7LwqcvDPUE7h0rGfr5p8' \
  --data '{
  "offset": 0,
  "limit": 25,
  "query": "hi",
  "userId": "",
  "collectionId": "",
  "documentId": "",
  "statusFilter": "published",
  "dateFilter": "month"
}'

curl -X GET http://localhost:4000/api/collections.list \
  --header "Authorization: Bearer ol_api_c45T4WckMjZdPjKlaGKxL43x4haNtrAKsB0jyk"


curl https://app.getoutline.com/api/documents.search \
  --request POST \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer ol_api_O8q6PuZrrKgWq7rpMc7LwqcvDPUE7h0rGfr5p8' \
  --data '{
    "offset": 0,
    "limit": 25,
    "query": "med",
    "statusFilter": "published",
    "dateFilter": "month"
  }'

  curl -X POST https://app.getoutline.com/api/users.info \
  --header "Authorization: Bearer ol_api_O8q6PuZrrKgWq7rpMc7LwqcvDPUE7h0rGfr5p8"


   
2. **Knowledge Base:**  
   - Outline is all set and running inside the docker app.

3. **Chat Integration:**  
   - Chatwoot is integrated into the React frontend.
   - Users can type queries starting with `/ask` in the chat widget.
   - The backend bot listens to Chatwoot incoming webhook events, intercepts `/ask` commands, and sends the post request search to the Outline KNOWLEDGE BASE
   - The bot then sends a reply with relevant KB content back to the Chatwoot conversation.

---

## Architecture

- **Frontend:** Built with React.  
  - Integrates Keycloak for authentication.
  - Renders the Chatwoot widget, which can be accessed and provides the relevant document being asked for
  
- **Backend Bot:** A Node.js/Express server that:
  - Receives webhooks from Chatwoot.
  - Processes messages starting with `/ask`.
  - Queries search  API in Outline KB
  - Sends responses via the Chatwoot API.
  
- **Component Integration:**  
  - **Keycloak** secures access to the KB app .
  - **Outline** provides the KnowledgeBase articles.
  - **Chatwoot** serves as the interactive chat interface.
  
All components are brought together using Docker Compose for streamlined local development.

---

## Prerequisites

Please ensure you have the following installed:

- Docker and Docker Compose  
- Node.js (v14+ recommended) and npm
- A modern web browser

---

## Installation and Setup

### Keycloak Configuration

1. **Realm and Clients:**
   - Create a Keycloak realm (e.g., `kb-chat-demo`).
   - Create a clients:
     - **kb-ui**: Public client with valid redirect URIs like `http://localhost:4000/*`(primarily the url where the frontend is hosted on )
     - **chatwoot-oidc**: Confidential client with redirect URI: `http://localhost:4000`.

2. **Setup Instructions:**  
    for this just run this docker command below 
    docker run -p 8080:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:24.0.2 start-dev

### Outline Knowledge-Base:


1. **Installation:**  
   - Followed the installation steps for the self hosted app on local from thsi guide

2. **Sample Data:**  
   - Import or create a sample KB with a few articles.

### Chatwoot Installation

1. **Deployment:**  
   - Set up Chatwoot locally using Docker or follow the [Chatwoot installation guide](https://www.chatwoot.com/docs/deployment/overview).

2. **Configuration:**  
   - For creating the webhook and self hosting it ti run locally and integrate with the backend apis we will need ngrok.
   - So , after installing ngrok just type ngrok PORT..for example ngrok 3200( the port where the backend is running)
   - Now, there is a forward url seen on ngrok copy that and paste it in webhook section of the CHATWOOT application. 
   - Get your website token from Chatwoot or from rails console searching for the user and then query to get user.access_token.token
### Bot Setup

1. **Bot Code:**  
   - The bot is implemented as a Node.js/Express server (see `server.js` in the repo).
   - It listens for webhook events from Chatwoot and processes `/ask` commands.
2. **API Integrations:**  
   - Configure the bot to use the Outline GraphQL API (set the ` OUTLINE_BASE_URL` &  OUTLINE_API_KEY) and Chatwoot API (set `CHATWOOT_API_URL`, `CHATWOOT_API_TOKEN`, and `CHATWOOT_ACCOUNT_ID`).


### React Frontend

1. **Authentication:**  
   - The React frontend leverages Keycloak for SSO.
2. **Chatwoot Widget:**  
   - The Chatwoot widget is loaded via the `ChatwootWidget` component.  
   -    styling and the chatwootwidget  are applied (see `App.js` and `ChatwootWidget.js`).
3. **Welcome Message:**  
   - A styled welcome banner is displayed after login with instructions for interacting via `/ask <query>`.

---
## Running the Application
1. **Run the keycloak docker container which will be running on 8080 PORT using the below command.

  docker run -p 8080:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:24.0.2 start-dev

2. ** inside the outlinelnowledgebase folder just give this  below command to make sure the container is up and running  
      docker-compose up --build

3.Install the chatwoot locally and configure the port accordingly for example 3001 and check the docker container corresponding to the chatwoot and ensure all the containers are up and working .

4.using PORT=4000 npm start  inside client directory, START THE FRONTEND application

5.using node server.js in the server directory start the BACKEND application


