// keycloak.js - Define Keycloak instance only once
import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
    url: "http://localhost:8080/",
    realm: "kb-chat-demo",
    clientId: "kb-ui",
});

export default keycloak;
