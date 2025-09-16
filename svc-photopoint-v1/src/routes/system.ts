import { Router, Request, Response } from 'express';
import { logger, LogLevel } from '../utils/logger';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Get current log level
router.get('/log-level', authenticateToken, (req: Request, res: Response): void => {
  try {
    const currentLevel = logger.getLogLevel();
    const levelName = LogLevel[currentLevel];
    
    res.json({
      success: true,
      data: {
        level: currentLevel,
        levelName: levelName,
        availableLevels: {
          ERROR: LogLevel.ERROR,
          WARN: LogLevel.WARN,
          INFO: LogLevel.INFO,
          DEBUG: LogLevel.DEBUG,
          TRACE: LogLevel.TRACE
        }
      }
    });
  } catch (error) {
    logger.error('Failed to get log level:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get log level'
    });
  }
});

// Set log level
router.post('/log-level', authenticateToken, (req: Request, res: Response): void => {
  try {
    const { level, levelName } = req.body;
    
    let newLevel: LogLevel;
    
    if (typeof level === 'number' && level >= 0 && level <= 4) {
      newLevel = level;
    } else if (typeof levelName === 'string') {
      const upperLevelName = levelName.toUpperCase();
      switch (upperLevelName) {
        case 'ERROR': newLevel = LogLevel.ERROR; break;
        case 'WARN': newLevel = LogLevel.WARN; break;
        case 'INFO': newLevel = LogLevel.INFO; break;
        case 'DEBUG': newLevel = LogLevel.DEBUG; break;
        case 'TRACE': newLevel = LogLevel.TRACE; break;
        default:
          res.status(400).json({
            success: false,
            error: 'Invalid log level name. Must be one of: ERROR, WARN, INFO, DEBUG, TRACE'
          });
          return;
      }
    } else {
      res.status(400).json({
        success: false,
        error: 'Must provide either "level" (number 0-4) or "levelName" (string)'
      });
      return;
    }
    
    logger.setLogLevel(newLevel);
    logger.info(`Log level changed to ${LogLevel[newLevel]} (${newLevel})`);
    
    res.json({
      success: true,
      data: {
        level: newLevel,
        levelName: LogLevel[newLevel],
        message: `Log level set to ${LogLevel[newLevel]}`
      }
    });
  } catch (error) {
    logger.error('Failed to set log level:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to set log level'
    });
  }
});

export default router;
