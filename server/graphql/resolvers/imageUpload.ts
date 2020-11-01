import { Resolver, Mutation, Arg } from 'type-graphql';
import { GraphQLUpload } from 'apollo-server-koa';
import { GraphQLScalarType } from 'graphql';
import { createWriteStream, unlinkSync } from 'fs';
import { Stream } from 'stream';
import cloudinary from 'cloudinary';

export interface Upload {
    filename: string;
    mimetype: string;
    encoding: string;
    createReadStream: () => Stream;
}

cloudinary.v2.config({
    cloud_name: 'lastorigin',
    api_key: '573186812215326',
    api_secret: '7un0v5aRFlMLdXlMr_eDS8E2bUM',
});

@Resolver()
export default class ImageUploadResolver {
    @Mutation(() => String)
    imageUpload(
        @Arg('upload', () => GraphQLUpload as GraphQLScalarType, {
            nullable: true,
        })
        { createReadStream, mimetype, filename }: Upload,
    ): Promise<string> {
        if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
            throw new Error('Not an image');
        }

        const path = `${__dirname}/${filename}`;

        return new Promise((resolve) => {
            createReadStream()
                .pipe(createWriteStream(path))
                .on('finish', () => {
                    cloudinary.v2.uploader.upload(
                        path,
                        {
                            use_filename: false,
                            unique_filename: true,
                        },
                        async (error, result) => {
                            if (error) {
                                throw new Error(error.message);
                            }

                            await unlinkSync(path);

                            return resolve(
                                result?.url.replace(
                                    'http://res.',
                                    'https://res-5.',
                                ),
                            );
                        },
                    );
                })
                .on('error', () => {
                    throw new Error('upload error');
                });
        });
    }
}
