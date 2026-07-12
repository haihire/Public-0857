import { createRequire } from "module";

// Load variables from a local `.env` file if dotenv is installed.
// dotenv is optional here: in production you can inject env vars directly
// (PM2 / systemd / `node --env-file=.env`). If it's missing we silently
// fall back to process.env and the local-dev DEFAULTS below.
try {
  createRequire(import.meta.url)("dotenv").config();
} catch {
  // dotenv not installed — rely on real environment variables / DEFAULTS
}

// Local-development fallbacks ONLY.
// Never put real production credentials here — set them via environment
// variables (a .env file, which must stay out of git).
const DEFAULTS = {
  CallBack: "test",
  url: "localhost",
  allowUrl: "test",
  vShotMain: "kon-bet.com",
  vShotDealer: "test.com",
  vShotPad: "test.com",
  vShotPad_ctrl: "test.com",

  server_port: 7771,
  scanner_port: 8806,
  express_port: 3000,

  sql_host: "localhost",
  sql_user: "root",
  sql_password: "",
};

export function SevUrl() {
  const CallBack = process.env.CALLBACK || DEFAULTS.CallBack;
  const url = process.env.URL || DEFAULTS.url;
  const allowUrl = process.env.ALLOW_URL || DEFAULTS.allowUrl;
  const vShotMain = process.env.VSHOT_MAIN || DEFAULTS.vShotMain;
  const vShotDealer = process.env.VSHOT_DEALER || DEFAULTS.vShotDealer;
  const vShotPad = process.env.VSHOT_PAD || DEFAULTS.vShotPad;
  const vShotPad_ctrl = process.env.VSHOT_PAD_CTRL || DEFAULTS.vShotPad_ctrl;

  const server_port = Number(process.env.SERVER_PORT || DEFAULTS.server_port);
  const scanner_port = Number(process.env.SCANNER_PORT || DEFAULTS.scanner_port);
  const express_port = Number(process.env.EXPRESS_PORT || DEFAULTS.express_port);

  const sql_host = process.env.SQL_HOST || DEFAULTS.sql_host;
  const sql_user = process.env.SQL_USER || DEFAULTS.sql_user;
  const sql_password = process.env.SQL_PASSWORD ?? DEFAULTS.sql_password;

  return {
    CallBack,
    url,
    server_port,
    scanner_port,
    express_port,
    sql_host,
    sql_user,
    sql_password,
    allowUrl,
    vShotMain,
    vShotDealer,
    vShotPad,
    vShotPad_ctrl,
  };
}
