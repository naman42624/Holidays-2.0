import express from 'express';

const router = express.Router();

router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Fixed route working!' });
});

router.get('/', (req, res) => {
  res.json({ success: true, message: 'Root fixed route working!', data: [] });
});

export default router;
