import { Server, newDefaultExpressApp } from '@maiara/core';
import { TelegramChannel, TelegramChannelConfig } from '../dist';


let app = newDefaultExpressApp();
let server = new Server({ port: 8080 }, app);

let telegramChat = new TelegramChannel({
    channelType: "telegram",
    credentials: { token: "607173489:AAGNCrFKhdC-ax4Pi88YGdWo_tXbvCFXAU0" },
    polling: true
});

telegramChat.setWebhooks(app, { https: true, publicDomain: "c9821bf7.ngrok.io", endpoint: "/telegram" });

telegramChat.message$.subscribe(message => {
    console.log(message);
    telegramChat.reply(message, { text: "Hello!" });
});

server.start();

// app.listen(8080, function () {
//   console.log('Example app listening on port 8080!');
// });
