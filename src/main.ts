import { connect } from "./util/connection";
import WebSocket from "ws";

(async () => {
  const ws = await connect();
})();
