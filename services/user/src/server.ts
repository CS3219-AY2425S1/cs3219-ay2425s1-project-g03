import http from "http";
import index from "./index";
import "dotenv/config";
import { connectToDB } from "./model/repository";

const port = process.env.PORT || 8082;

const server = http.createServer(index);

connectToDB().then(() => {
  console.log("MongoDB Connected!");

  server.listen(port);
  console.log("User service server listening on http://localhost:" + port);
}).catch((err) => {
  console.error("Failed to connect to DB");
  console.error(err);
});
