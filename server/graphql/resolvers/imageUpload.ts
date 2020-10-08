import { Resolver, Mutation, Arg } from 'type-graphql';
import { GraphQLUpload } from 'apollo-server-koa';
import { GraphQLScalarType } from 'graphql';
import { createWriteStream } from 'fs';
import { Stream } from 'stream';

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
        { createReadStream, filename }: Upload,
    ): Promise<boolean> {
        return new Promise((resolve, reject) =>
            createReadStream()
                .pipe(
                    createWriteStream(__dirname + `/../../upload/${filename}`),
                )
                .on('finish', () => resolve(true))
                .on('error', () => reject(false)),
        );
    }
}
