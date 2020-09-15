import { DefaultState, Context } from 'koa';
import Router from 'koa-router';
import auth from './auth';

const router = new Router<DefaultState, Context>();

router.use('/auth', auth.routes());

export default router;
