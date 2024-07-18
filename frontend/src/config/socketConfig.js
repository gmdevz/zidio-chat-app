import io from "socket.io-client";

const ENDPOINT = ""; // Replace with your server URL
export const socket = io(ENDPOINT);
