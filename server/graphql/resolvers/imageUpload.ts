import { Resolver, Mutation, Arg } from 'type-graphql';
import { GraphQLUpload } from 'graphql-upload';
// import { statSync, createWriteStream } from 'fs';
import { Stream } from 'stream';
// import { generator } from 'rand-token';

export interface Upload {
    filename: string;
    mimetype: string;
    encoding: string;
    createReadStream: () => Stream;
}

@Resolver()
export default class ImageUploadResolver {
    @Mutation(() => String)
    async imageUpload(
        @Arg('picture', () => GraphQLUpload)
        upload: Upload,
    ): Promise<string> {
        console.log('upload', upload);
        return 'test';
        // const randToken = generator({ chars: 'default' });

        // const token = randToken.generate(16);
        // await statSync();

        // return new Promise(async (resolve, reject) =>
        //     createReadStream()
        //         .pipe(
        //             createWriteStream(
        //                 __dirname + `/../../../upload/${filename}`,
        //             ),
        //         )
        //         .on('finish', () => resolve(true))
        //         .on('error', () => reject(false)),
        // );
    }
}
