import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import sharp from 'sharp';

// Create S3 client
const s3 = new S3Client({ region: 'ap-southeast-2' });

// Configuration options
const convertOption = {
  convertFile: true,
  convertFileExt: '.webp',
};

const ALLOWED_IMAGE_FILETYPES = [
  'png',
  'jpg',
  'jpeg',
  'bmp',
  'gif',
  'PNG',
  'JPG',
  'JPEG',
  'BMP',
  'GIF',
];

// Thumbnail sizes
// when provided height is null it will adjust height according to width in proportion
const fileSizes = {
  items: [
    { width: null, height: null },
    { width: 327, height: 200 },
    { width: 300, height: null }, 
    { width: 80, height: 80 },
    { width: 375, height: 230 },
  ],
  default: [
    { width: null, height: null },
    { width: 100, height: 200 },
    { width: 200, height: 300 },
    { width: 300, height: 400 },
  ],
};

export const handler = async (event, context) => {
  try {
    const srcBucket = event.Records[0].s3.bucket.name;

    // Object key may have spaces or unicode non-ASCII characters.
    const srcKey = decodeURIComponent(
      event.Records[0].s3.object.key.replace(/\+/g, ' '),
    );

    const typeMatch = srcKey.match(/\.([^.]*)$/);
    if (!typeMatch) {
      return;
    }
    const imageType = typeMatch[1];
    if (!ALLOWED_IMAGE_FILETYPES.includes(imageType)) {
      console.error(
        `Filetype ${imageType} not valid for thumbnail, exiting`,
      );
      return;
    }

    const keyParts = srcKey.split('/');
    keyParts.shift();
    keyParts.pop();

    const fileSizeKey = keyParts.join('/');
    let sizes = fileSizes[fileSizeKey] || fileSizes.default;

    const params = {
      Bucket: srcBucket,
      Key: srcKey,
    };
    const response = await s3.send(new GetObjectCommand(params));
    const stream = response.Body;

    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const contentBuffer = Buffer.concat(chunks);

    const metadata = await sharp(contentBuffer).metadata();
    const originalAspectRatio = metadata.width / metadata.height;

    for (const imageSize of sizes) {
      const parts = srcKey.split('/');
      parts.shift();

      const originalImagePath = parts.join('/');
      let thumbnailKey = `public/${originalImagePath}`;
      let width = imageSize.width;
      let height = imageSize.height;

      if (width && !height) {
        // Adjust height based on the original aspect ratio
        height = Math.round(width / originalAspectRatio);
      }

      if (width && height) {
        const size = `${width}x${height}`;
        const fileName = parts.pop();
        parts.push(size);
        parts.push(fileName);
        const thumbnailPath = parts.join('/');
        thumbnailKey = `thumbnails/${thumbnailPath}`;
      }

      let outputBuffer;
      if (convertOption.convertFile) {
        thumbnailKey = thumbnailKey.replace(
          new RegExp(`\\.(${ALLOWED_IMAGE_FILETYPES.join('|')})$`, 'i'),
          convertOption.convertFileExt,
        );

        outputBuffer = await sharp(contentBuffer)
          .resize(width, height, { fit: 'cover' })
          .webp()
          .toBuffer();
      } else {
        outputBuffer = await sharp(contentBuffer)
          .resize(width, height, { fit: 'cover' })
          .toBuffer();
      }

      const destParams = {
        Bucket: srcBucket,
        Key: thumbnailKey,
        Body: outputBuffer,
        ContentType: 'image/webp',
      };
      await s3.send(new PutObjectCommand(destParams));
      console.log(`Thumbnail created and uploaded to ${thumbnailKey}`);
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
