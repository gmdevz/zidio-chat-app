import io from "socket.io-client";

const ENDPOINT = "http://192.168.100.2:5000";
export const socket = io(ENDPOINT);
