import dotenv from 'dotenv';
import {
  testS3Connection,
  getS3Info,
  uploadToS3,
  listS3Objects,
  deleteFromS3
} from '../config/s3';

dotenv.config();

async function run() {
  console.log('🌸 ====================================================');
  console.log('   Brijnidhi AWS S3 Bucket Connectivity Test');
  console.log('====================================================\n');

  const info = getS3Info();
  console.log('📋 Current S3 Configuration:');
  console.log(`   - Storage Mode:     ${info.storageMode}`);
  console.log(`   - Bucket Name:      ${info.bucket}`);
  console.log(`   - AWS Region:       ${info.region}`);
  console.log(`   - Custom Domain:    ${info.customDomain || '(none - using direct s3 url)'}`);
  console.log(`   - Has Credentials:  ${info.hasCredentials ? 'Yes (AWS_ACCESS_KEY_ID & AWS_SECRET_ACCESS_KEY present)' : 'No (using EC2 IAM role or local fallback)'}\n`);

  console.log('🔌 Testing S3 Bucket Access (HeadBucket)...');
  const testResult = await testS3Connection();

  if (testResult.connected) {
    console.log(`✅ S3 Bucket Connected Successfully!`);
    console.log(`   Bucket: ${testResult.bucket}`);
    console.log(`   Region: ${testResult.region}\n`);

    console.log('📤 Testing S3 PutObject (uploading test asset)...');
    const sampleBuffer = Buffer.from('Radhe Radhe! Brijnidhi AWS S3 integration test successful.');
    const uploadResult = await uploadToS3({
      buffer: sampleBuffer,
      fileName: 's3-connectivity-test.txt',
      mimeType: 'text/plain',
      folder: 'system-tests'
    });

    console.log(`✅ File uploaded successfully:`);
    console.log(`   URL:    ${uploadResult.url}`);
    console.log(`   Key:    ${uploadResult.key}`);
    console.log(`   Bucket: ${uploadResult.bucket}`);
    console.log(`   Size:   ${uploadResult.size} bytes`);
    console.log(`   isS3:   ${uploadResult.isS3}\n`);

    console.log('📋 Listing Objects in "system-tests/" prefix...');
    const objects = await listS3Objects('system-tests', 5);
    console.log(`   Found ${objects.length} objects.`);
    objects.forEach(obj => console.log(`   - ${obj.key} (${obj.size} bytes)`));

    console.log('\n🗑️ Cleaning up test file...');
    await deleteFromS3(uploadResult.key);
    console.log(`✅ Cleaned up test file '${uploadResult.key}'.`);

    console.log('\n✨ All AWS S3 operations passed! Your S3 bucket is ready for production hotel assets.');
  } else {
    console.log(`ℹ️ Result: ${testResult.message}`);
    if (testResult.error) {
      console.log(`   Error detail: ${testResult.error}`);
    }
    console.log('\n💡 To connect a live AWS S3 bucket:');
    console.log('   1. Open backend/.env');
    console.log('   2. Set AWS_S3_BUCKET_NAME=your-bucket-name');
    console.log('   3. Set AWS_REGION=ap-south-1 (or your bucket region)');
    console.log('   4. Set AWS_ACCESS_KEY_ID=your_iam_access_key');
    console.log('   5. Set AWS_SECRET_ACCESS_KEY=your_iam_secret_key');
    console.log('   6. Rerun: npm run test:s3');
  }

  console.log('\n====================================================');
}

run().catch(err => {
  console.error('Fatal error running S3 test:', err);
  process.exit(1);
});
