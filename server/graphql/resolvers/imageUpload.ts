import { Arg, Mutation, Resolver } from 'type-graphql';
import { createWriteStream, existsSync } from 'fs';
import { GraphQLScalarType } from 'graphql';
import { GraphQLUpload } from 'apollo-server-koa';
import { Stream } from 'stream';
import { generator } from 'rand-token';
import imagemin from 'imagemin';
import imageminWebp from 'imagemin-webp';
import path from 'path';
// import cloudinary from 'cloudinary';

export interface Upload {
    filename: string;
    mimetype: string;
    encoding: string;
    createReadStream: () => Stream;
}

// cloudinary.v2.config({
//     cloud_name: 'lastorigin',
//     api_key: '573186812215326',
//     api_secret: '7un0v5aRFlMLdXlMr_eDS8E2bUM',
// });

@Resolver()
export default class ImageUploadResolver {
    @Mutation(() => String)
    imageUpload(
        @Arg('upload', () => GraphQLUpload as GraphQLScalarType, {
            nullable: true,
        })
        { createReadStream, mimetype }: Upload,
    ): Promise<string> {
        if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
            throw new Error('Not an image');
        }

        let ext: string;
        let dir: string | undefined = undefined;
        let filename: string;

        if (mimetype === 'image/jpeg') {
            ext = 'jpg';
        } else if (mimetype === 'image/png') {
            ext = 'png';
        } else {
            throw new Error('Not an image');
        }

        while (!dir) {
            const randToken = generator({
                chars: '0123456789abcdefghijklmnopqrstuvwxyz',
            });
            const name = randToken.generate(20);
            filename = `${name}.${ext}`;
            dir = path.normalize(
                `${__dirname}/../../../assets/profile/${filename}`,
            );

            if (dir && existsSync(dir)) {
                dir = undefined;
            }
        }

        return new Promise((resolve, reject) => {
            createReadStream()
                .pipe(createWriteStream(dir as string))
                .on('finish', () => {
                    // cloudinary.v2.uploader.upload(
                    //     path,
                    //     {
                    //         use_filename: false,
                    //         unique_filename: true,
                    //     },
                    //     async (error, result) => {
                    //         if (error) {
                    //             throw new Error(error.message);
                    //         }
                    //         await unlinkSync(path);
                    //         return resolve(
                    //             result?.url.replace(
                    //                 'http://res.',
                    //                 'https://res-5.',
                    //             ),
                    //         );
                    //     },
                    // );

                    imagemin([(dir as string).replace(/\\/g, '/')], {
                        destination: path
                            .normalize(`${__dirname}/../../../assets/profile`)
                            .replace(/\\/g, '/'),
                        plugins: [imageminWebp({ quality: 90 })],
                    });

                    resolve(`/profile/${filename}`);
                })
                .on('error', () => {
                    reject('upload error');
                });
        });
    }
}
