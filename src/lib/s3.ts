import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"

const globalForS3 = globalThis as unknown as {
	s3: S3Client | undefined
}

function createS3Client(): S3Client {
	const region = process.env.AWS_REGION
	const accessKeyId = process.env.AWS_ACCESS_KEY_ID
	const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

	if (!region || !accessKeyId || !secretAccessKey) {
		throw new Error(
			"AWS credentials are not configured. Please set AWS_REGION, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY environment variables.",
		)
	}

	return new S3Client({
		region,
		credentials: {
			accessKeyId,
			secretAccessKey,
		},
	})
}

export const s3 = globalForS3.s3 ?? createS3Client()

if (process.env.NODE_ENV !== "production") globalForS3.s3 = s3

export const S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME

if (!S3_BUCKET_NAME) {
	throw new Error("AWS_S3_BUCKET_NAME environment variable is not set.")
}

/**
 * S3にファイルをアップロードする
 * @param key S3キー（パス）
 * @param body ファイルの内容（BufferまたはUint8Array）
 * @param contentType MIMEタイプ
 * @returns アップロードされたオブジェクトのURL
 */
export async function uploadToS3(key: string, body: Buffer | Uint8Array, contentType: string): Promise<string> {
	const command = new PutObjectCommand({
		Bucket: S3_BUCKET_NAME,
		Key: key,
		Body: body,
		ContentType: contentType,
	})

	try {
		await s3.send(command)
	} catch (error) {
		if (error instanceof Error) {
			// より詳細なエラーメッセージ
			if (error.message.includes("NoSuchBucket")) {
				throw new Error(`S3バケット "${S3_BUCKET_NAME}" が見つかりません`)
			}
			if (error.message.includes("AccessDenied")) {
				throw new Error("S3へのアクセスが拒否されました。権限を確認してください")
			}
			if (error.message.includes("InvalidAccessKeyId")) {
				throw new Error("AWSアクセスキーが無効です")
			}
			if (error.message.includes("SignatureDoesNotMatch")) {
				throw new Error("AWSシークレットキーが無効です")
			}
		}
		throw error
	}

	// S3オブジェクトのURLを生成
	return `https://${S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
}

/**
 * S3からファイルを削除する
 * @param key S3キー（パス）
 */
export async function deleteFromS3(key: string): Promise<void> {
	const command = new DeleteObjectCommand({
		Bucket: S3_BUCKET_NAME,
		Key: key,
	})

	await s3.send(command)
}

/**
 * S3キーを生成する
 * @param reportId レポートID
 * @param filename ファイル名
 * @returns S3キー
 */
export function generateS3Key(reportId: string, filename: string): string {
	const timestamp = Date.now()
	const randomId = Math.random().toString(36).substring(2, 15)
	const ext = filename.split(".").pop()?.toLowerCase() || "jpg"
	return `reports/${reportId}/${timestamp}-${randomId}.${ext}`
}
