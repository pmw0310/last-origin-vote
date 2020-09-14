import jwt from 'jsonwebtoken';
import { Profile } from 'passport-naver';

export function generateToken(payload: Profile): Promise<string> {
    return new Promise((resolve, reject) => {
        const { id } = payload;
        jwt.sign(
            { id },
            process.env.JWT_SECRET as string,
            {
                expiresIn: '12h',
            },
            (error, token) => {
                if (error) reject(error);
                resolve(token);
            },
        );
    });
}
