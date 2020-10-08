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
    @Mutation(() => Boolean)
    imageUpload(
        @Arg('upload', () => GraphQLUpload as GraphQLScalarType, {
            nullable: true,
        })
        { createReadStream, mimetype }: Upload,
    ): Promise<boolean> {
        let ext: string;

        if (mimetype === 'image/jpeg') {
            ext = 'jpg';
        } else if (mimetype === 'image/png') {
            ext = 'png';
        } else {
            throw new Error('Not an image');
        }

        const randToken = generator({ chars: 'base32' });
        const name = randToken.generate(16);

        return new Promise((resolve, reject) => {
            createReadStream()
                .pipe(
                    createWriteStream(
                        __dirname + `/../../upload/${name}.${ext}`,
                    ),
                )
                .on('finish', () => resolve(true))
                .on('error', () => reject(false));
        });
    }
}
