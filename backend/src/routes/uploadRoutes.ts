import { Router, Request, Response } from 'express';
import multer from 'multer';
import {
  uploadToS3,
  generatePresignedUploadUrl,
  deleteFromS3,
  getS3Info,
  testS3Connection,
  listS3Objects
} from '../config/s3';

const router = Router();

// Configure Multer with memory storage for zero-disk-overhead uploads
const storage = multer.memoryStorage();

// File filter for images and KYC documents
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    // Images (Property photos, room photos, Bhojan dish photos, Aarti photos)
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    // Documents (Trade license, FSSAI certificate, Aadhaar/PAN KYC)
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed types: JPG, PNG, WEBP, GIF, SVG, PDF, DOCX.`));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25 MB max
  },
  fileFilter
});

/**
 * GET /api/upload/status
 * Returns AWS S3 configuration details and tests bucket connectivity.
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const info = getS3Info();
    const connectionTest = await testS3Connection();

    res.json({
      success: true,
      service: 'AWS S3 Cloud Object Storage',
      info,
      connection: connectionTest
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve S3 status',
      error: error.message
    });
  }
});

/**
 * POST /api/upload
 * Single file upload to S3 (form-data: 'file', optional 'folder')
 */
router.post('/', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please provide a file in the "file" field.'
      });
    }

    const folder = (req.body.folder as string) || 'hotels';
    const originalName = req.file.originalname || `upload-${Date.now()}`;

    const result = await uploadToS3({
      buffer: req.file.buffer,
      fileName: originalName,
      mimeType: req.file.mimetype,
      folder
    });

    res.status(201).json({
      success: true,
      message: result.isS3
        ? 'Radhe Radhe! File uploaded successfully to AWS S3 bucket.'
        : 'File saved to local storage (AWS S3 not configured).',
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'File upload failed',
      error: error.message
    });
  }
});

/**
 * POST /api/upload/multiple
 * Upload up to 10 files in a single request (form-data: 'files', optional 'folder')
 */
router.post('/multiple', upload.array('files', 10), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded. Please provide files in the "files" field.'
      });
    }

    const folder = (req.body.folder as string) || 'gallery';

    const uploadPromises = files.map(file =>
      uploadToS3({
        buffer: file.buffer,
        fileName: file.originalname,
        mimeType: file.mimetype,
        folder
      })
    );

    const results = await Promise.all(uploadPromises);

    res.status(201).json({
      success: true,
      message: `Uploaded ${results.length} files successfully.`,
      data: results
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Multi-file upload failed',
      error: error.message
    });
  }
});

/**
 * POST /api/upload/presigned
 * Generates an AWS S3 Presigned URL for direct, secure browser-to-S3 uploads.
 * Body: { fileName: string, mimeType: string, folder?: string }
 */
router.post('/presigned', async (req: Request, res: Response) => {
  try {
    const { fileName, mimeType, folder = 'uploads' } = req.body;

    if (!fileName || !mimeType) {
      return res.status(400).json({
        success: false,
        message: 'Missing fileName or mimeType in request body.'
      });
    }

    const presignedData = await generatePresignedUploadUrl({
      fileName,
      mimeType,
      folder
    });

    res.json({
      success: true,
      message: 'Presigned upload URL generated successfully.',
      data: presignedData
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate presigned upload URL',
      error: error.message
    });
  }
});

/**
 * GET /api/upload/list
 * Lists recent files in an S3 folder. Query: ?folder=hotels&max=30
 */
router.get('/list', async (req: Request, res: Response) => {
  try {
    const folder = (req.query.folder as string) || '';
    const max = parseInt(req.query.max as string, 10) || 50;

    const files = await listS3Objects(folder, max);

    res.json({
      success: true,
      count: files.length,
      data: files
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to list S3 objects',
      error: error.message
    });
  }
});

/**
 * DELETE /api/upload
 * Deletes a file from S3 bucket. Query: ?key=hotels/123-image.jpg
 */
router.delete('/', async (req: Request, res: Response) => {
  try {
    const key = (req.query.key as string) || req.body?.key;

    if (!key) {
      return res.status(400).json({
        success: false,
        message: 'Missing "key" parameter to delete.'
      });
    }

    const deleted = await deleteFromS3(key);

    res.json({
      success: deleted,
      message: deleted ? `Object '${key}' deleted successfully.` : `Object '${key}' could not be deleted.`
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Delete failed',
      error: error.message
    });
  }
});

export default router;
