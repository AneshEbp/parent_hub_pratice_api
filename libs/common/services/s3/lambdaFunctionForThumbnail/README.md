
# Lambda Function For Thumbnail Generation

This document helps to integrate S3 lambda function in projects.

## Uses

We have following folder in ebtheme ebthemes-api/libs/common/services/aws/lambdaFunctionForThumbnail

### Steps
Create layer in aws and upload node_modules.zip from ebthemes-api/libs/common/services/aws/lambdaFunctionForThumbnail. 

Create Lambda function and use the previous layer in it. Upload code.zip from ebthemes-api/libs/common/services/aws/lambdaFunctionForThumbnail from option "upload from zip file"


The configuration of AWS index.mjs and ebtheme-development/ebthemes-api/libs/common/services/aws/s3.service.ts should match.

If we need to convert thumbnail extension to other format then we will need to update.

```javascript
const convertOption = {
  convertFile: true,
  convertFileExt: '.webp',
};
```


```javascript
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

const fileSizes = {
  items: [
    { width: null, height: null },
    { width: 327, height: 200 },
    { width: 300, height: 120 },
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

fileSizes key eg: items, is size for items taken from image key public/items/girlwithglass.jpg where "public"  and "girlwithglass.jpg" is removed.

eg for public/users/profile/user.jpg we will define sizes in "users/profile"

const fileSizes = {
  "users/profile": [
    { width: null, height: null },
    { width: 50, height: 50 },
  ],
  items: [
    { width: null, height: null },
    { width: 327, height: 200 },
    { width: 300, height: 120 },
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


```

We have functions to retrive signurl in frontend ebthemes-api/libs/common/services/aws/s3.service.ts

### Function to use
```javascript
getOrginalSignedUrl return single original image

getConvertedOrginalSignedUrl return single converted original image

getCustomSizeSignedUrlThumbnail return single converted image with custom size provided

getAllSignedUrlThumbnail return all size thumbnails of image
```