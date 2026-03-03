export function SevUrl() {
  //local
  const CallBack = "test";
  const allowUrl = "test";
  const url = "localhost";
  const vShotMain = "kon-bet.com";
  const vShotDealer = "test.com";
  const vShotPad = "test.com";
  const vShotPad_ctrl = "test.com";

  const server_port = 7771;
  const scanner_port = 8806;
  const express_port = 3000;

  const sql_host = "localhost";
  const sql_user = "root";
  const sql_password = "1234";

  return {
    CallBack: CallBack,
    url: url,
    server_port: server_port,
    scanner_port: scanner_port,
    express_port: express_port,
    sql_host: sql_host,
    sql_user: sql_user,
    sql_password: sql_password,
    allowUrl: allowUrl,

    vShotMain: vShotMain,
    vShotDealer: vShotDealer,
    vShotPad: vShotPad,
    vShotPad_ctrl: vShotPad_ctrl,
  };
}
