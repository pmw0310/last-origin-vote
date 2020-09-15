import { DefaultState, Context } from 'koa';
import Router from 'koa-router';
import naver from './naver';

const router = new Router<DefaultState, Context>();

router.use('/naver', naver.routes());

export default router;
