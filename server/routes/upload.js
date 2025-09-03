const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Simple disk storage for dev
const uploadPath = process.env.UPLOAD_PATH || path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '');
    const base = path.basename(file.originalname || 'file', ext).replace(/[^a-z0-9_-]/gi, '_');
    cb(null, `${Date.now()}_${base}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || String(25 * 1024 * 1024), 10) },
});

// Generic upload route (images/audio/video/docs)
router.post('/', authenticateToken, upload.array('files', 10), async (req, res) => {
  try {
    const files = (req.files || []).map((f) => ({
      filename: f.filename,
      originalName: f.originalname,
      size: f.size,
      mimeType: f.mimetype,
      url: `/uploads/${f.filename}`
    }));
    res.json({ success: true, files });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload files' });
  }
});

// Public upload endpoint (used during signup before authentication)
router.post('/public', upload.array('files', 10), async (req, res) => {
  try {
    const files = (req.files || []).map((f) => ({
      filename: f.filename,
      originalName: f.originalname,
      size: f.size,
      mimeType: f.mimetype,
      url: `/uploads/${f.filename}`
    }));
    res.json({ success: true, files });
  } catch (error) {
    console.error('Public upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload files' });
  }
});

module.exports = router;

// Optional: S3 presigned URL generator
router.get('/presign', authenticateToken, async (req, res) => {
  try {
    const { filename, type } = req.query;
    const bucket = process.env.S3_BUCKET;
    const region = process.env.S3_REGION;
    const accessKeyId = process.env.S3_ACCESS_KEY_ID;
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

    if (!bucket || !region || !accessKeyId || !secretAccessKey) {
      return res.json({ success: true, fallback: true });
    }

    // Lazy import AWS SDK v3 to avoid dependency unless configured
    const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
    const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

    const client = new S3Client({ region, credentials: { accessKeyId, secretAccessKey } });
    const keyBase = `users/${req.user.id}/avatars/`;
    const objectKey = keyBase + `${Date.now()}_${(filename || 'file').replace(/[^a-z0-9._-]/gi, '_')}`;
    const command = new PutObjectCommand({ Bucket: bucket, Key: objectKey, ContentType: type });
    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 60 });
    const fileUrl = `https://${bucket}.s3.${region}.amazonaws.com/${objectKey}`;
    return res.json({ success: true, uploadUrl, fileUrl });
  } catch (error) {
    console.error('S3 presign error:', error.message);
    return res.json({ success: true, fallback: true });
  }
});
