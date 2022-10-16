import { Context } from 'aws-lambda';
import { S3 } from 'aws-sdk';
import { execFile } from 'child_process';
import { fstat, readFileSync } from 'fs';

interface Options {
    url: string;
    uploadPath: string;
}

export async function handler(options: Options, context: Context) {
    try {
        console.log("Running load test");
        if (!options.url) {
            throw new Error('URL not specified');
        }
        if (!options.uploadPath) {
            throw new Error('Upload path not specified');
        }
        console.log("Input is valid");
        const s3 = new S3();
        const key = options.uploadPath;
        const bucket = process.env.BUCKET_NAME;
        if (!bucket) {
            throw new Error('Bucket name not specified');
        }
        console.log("Running k6 now!");
        const child = execFile('k6', ['run', '-e', `URL=${options.url}`, '-e', `FILE=/tmp/${key}`, 'k6.js'], (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
        });
        await new Promise<void>((resolve) => {
            child.on('exit', () => {
                resolve();
            });
        });
        console.log("Uploading");
        const uploadParams: S3.Types.PutObjectRequest = {
            Bucket: bucket,
            Key: key,
            Body: readFileSync(`/tmp/${key}`),
            ContentType: 'text/html',
        };

        const upload = await s3.upload(uploadParams).promise();
        console.log(`Upload complete: ${upload.Location}`);
    } catch (err) {
        console.error(err);
        // Pretend all is well so we don't get retried.
    }
}
