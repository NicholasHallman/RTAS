import Koa from 'koa';
import webSockify from 'koa-websocket';
import session from 'koa-session';
import { RTAS } from './rtas.js';

const koa = webSockify(new Koa());
koa.keys = ['rtaskeysupersecretverysneakywowowo'];
koa.use(session(koa));

// run a set of plugins depending on the arguments
const appIndex = process.argv.indexOf("--app");
const appPath = process.argv[appIndex + 1];

const rtas = new RTAS();
rtas.loadPlugin(appPath);


koa.ws.use(function(ctx, next) {
    // return `next` to pass the context (ctx) on to the next ws middleware
    return next(ctx);
});

koa.ws.use(rtas.middleware());

koa.listen(3000);