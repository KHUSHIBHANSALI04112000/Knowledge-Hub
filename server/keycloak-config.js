// server/keycloak-config.js
module.exports = {
    realm: "kb-chat-demo",
    "auth-server-url": "http://keycloak:8080/auth",
    "ssl-required": "external",
    resource: "kb-ui",
    "public-client": true,
    "confidential-port": 0
};
  