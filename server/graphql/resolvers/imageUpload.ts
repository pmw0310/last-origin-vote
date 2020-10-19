import { Resolver, Mutation, Arg } from 'type-graphql';
import { GraphQLUpload } from 'apollo-server-koa';
import { GraphQLScalarType } from 'graphql';
import { createWriteStream } from 'fs';
import { Stream } from 'stream';
import { generator } from 'rand-token';

export interface Upload {
    filename: string;
    mimetype: string;
    encoding: string;
    createReadStream: () => Stream;
}

@Resolver()
export default class ImageUploadResolver {
    @Mutation(() => String)
    imageUpload(
        @Arg('upload', () => GraphQLUpload as GraphQLScalarType, {
            nullable: true,
        })
        { createReadStream, mimetype }: Upload,
    ): Promise<string> {
        let ext: string;

        if (mimetype === 'image/jpeg') {
            ext = 'jpg';
        } else if (mimetype === 'image/png') {
            ext = 'png';
        } else {
            throw new Error('Not an image');
        }

        const randToken = generator({ chars: 'base32' });
        const name = randToken.generate(12);
        const now = Math.floor(
            (Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) *
                0.001,
        );

        const filename = `${name.toLowerCase()}_${now}.${ext}`;

        return new Promise((resolve) => {
            createReadStream()
                .pipe(
                    createWriteStream(__dirname + `/../../upload/${filename}`),
                )
                .on('finish', () =>
                    resolve(`http://localhost:4000/${filename}`),
                )
                .on('error', () => {
                    throw new Error('upload error');
                });
        });
    }
}
