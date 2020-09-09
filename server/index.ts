import Koa from "koa";
import morgan from "koa-morgan";
import mount from "koa-mount";
import Router from "koa-router";
import next from "next";

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

function renderNext(route: string) {
  return (ctx: any) => {
    ctx.res.statusCode = 200;
    ctx.respond = false;

    app.render(ctx.req, ctx.res, route, {
      ...((ctx.request && ctx.request.body) || {}),
      ...ctx.params,
      ...ctx.query,
    });
  };
}

app.prepare().then(() => {
  const server = new Koa()
  const router = new Router()

  router.get("/", renderNext("/"));

  server
    .use(morgan("combined"))
    .use(
      mount("/", (ctx: Koa.Context) => {
        ctx.respond = false;
        handle(ctx.req, ctx.res);
      })
    );

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })
})