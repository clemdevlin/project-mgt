import { logger } from '#config/logger.js';

export const protect = async (req, res, next) => {
  try {
    const { userId } = await req.auth();

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    return next();
  } catch (error) {
    logger.error('Error in auth middleware', error);
    res.status(500).json({ message: error.code || error.message });
  }
};
