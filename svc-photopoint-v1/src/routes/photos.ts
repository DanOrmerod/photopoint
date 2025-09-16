import { Router, Request, Response } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger';

const router = Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter to only allow images
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Configure multer with size limits and file filtering
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Maximum 10 files at once
  }
});

// Photo interface matching the frontend
interface Photo {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl: string;
  uploadedAt: Date;
  userId: string;
  metadata?: {
    width: number;
    height: number;
    camera?: string;
    location?: string;
    tags?: string[];
  };
}

interface UploadResponse {
  success: boolean;
  photo?: Photo;
  error?: string;
}

// Upload single photo endpoint
router.post('/upload', upload.single('photo'), (req: Request, res: Response): void => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'No file uploaded'
      } as UploadResponse);
      return;
    }

    // Create photo object
    const photo: Photo = {
      id: uuidv4(),
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`,
      thumbnailUrl: `/uploads/thumbnails/${req.file.filename}`, // TODO: Generate thumbnail
      uploadedAt: new Date(),
      userId: 'anonymous', // TODO: Get from authentication
      metadata: {
        width: 0, // TODO: Extract from image
        height: 0, // TODO: Extract from image
        tags: []
      }
    };

    logger.info(`✅ Photo uploaded successfully: ${req.file.originalname} (${req.file.size} bytes)`);

    res.json({
      success: true,
      photo
    } as UploadResponse);

  } catch (error) {
    logger.error('❌ Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload photo'
    } as UploadResponse);
  }
});

// Upload multiple photos endpoint
router.post('/upload-multiple', upload.array('photos', 10), (req: Request, res: Response): void => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
      return;
    }

    const responses: UploadResponse[] = files.map(file => {
      const photo: Photo = {
        id: uuidv4(),
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: `/uploads/${file.filename}`,
        thumbnailUrl: `/uploads/thumbnails/${file.filename}`,
        uploadedAt: new Date(),
        userId: 'anonymous',
        metadata: {
          width: 0,
          height: 0,
          tags: []
        }
      };

      return {
        success: true,
        photo
      } as UploadResponse;
    });

    logger.info(`✅ ${files.length} photos uploaded successfully`);

    res.json(responses);

  } catch (error) {
    logger.error('❌ Multiple upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload photos'
    });
  }
});

// Get all photos endpoint (placeholder)
router.get('/', (req: Request, res: Response) => {
  // TODO: Implement database query to get user's photos
  res.json({
    photos: [],
    total: 0,
    page: 1,
    limit: 50
  });
});

// Get single photo endpoint (placeholder)
router.get('/:id', (req: Request, res: Response) => {
  // TODO: Implement database query to get specific photo
  res.json({
    success: false,
    error: 'Photo not found'
  });
});

// Delete photo endpoint (placeholder)
router.delete('/:id', (req: Request, res: Response) => {
  // TODO: Implement photo deletion
  res.json({
    success: false,
    error: 'Delete not implemented yet'
  });
});

// Search photos endpoint (placeholder)
router.get('/search/:query', (req: Request, res: Response) => {
  // TODO: Implement photo search
  res.json({
    photos: [],
    total: 0,
    query: req.params.query
  });
});

export default router;
