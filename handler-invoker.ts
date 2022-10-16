import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { S3 } from "aws-sdk";
import Lambda from "aws-sdk/clients/lambda";
import crypto from "crypto";

export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
    const reportFile = crypto.randomUUID() + ".html";
    console.log("Running load test", reportFile);
    const payload = {
        url: event.queryStringParameters?.url,
        uploadPath: reportFile,
    };
    const functionName = process.env.FUNCTION_NAME;
    if (!functionName) {
        throw new Error("Function name not specified (in environment variables");
    }
    const lambda = new Lambda();
    const invokationParams = {
        FunctionName: functionName,
        // Don't wait for it to finish.
        InvocationType: "Event",
        Payload: JSON.stringify(payload),
    };
    console.log("Invoking...");
    await lambda.invoke(invokationParams).promise();
    console.log("Invoked");
    const bucket = process.env.BUCKET_NAME;
    if (!bucket) {
        throw new Error("Bucket name not specified (in environment variables");
    }
    const s3 = new S3();
    const presignedURLParams = {
        Bucket: bucket,
        Key: reportFile,
        Expires: 600,
    };
    const url = s3.getSignedUrl('getObject', presignedURLParams);
    console.log(url);
    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, expectedDuration: 180 }), // The load test takes just under three minutes.
    };
}
