import { DefaultState, Context } from 'koa';
import Router from 'koa-router';
import naver from './naver';

const router = new Router<DefaultState, Context>();

const Elem = ({ i, title, description }) => {
    return (
        <div
            style={{
                backgroundColor: '#fff',
                border: '1px solid black',
                width: '100%',
                margin: '8px 0',
            }}
        >
            <p
                style={{
                    margin: 0,
                }}
            >
                {title}-{i}
            </p>
            {description}
        </div>
    );
};

router.use('/naver', naver.routes());
router.get('/logout', async (ctx: Context) => {
    console.log('logout');
    ctx.cookies.set('access_token', '', {
        httpOnly: true,
    });

    ctx.cookies.set('refresh_token', '', {
        httpOnly: true,
    });
    ctx.redirect('/');
});

export default router;
