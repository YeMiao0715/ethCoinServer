export default {
  appenders: {
    console: {
      type: 'console'
    },
    run: {
      type: 'dateFile',
      filename: `${__dirname}/../logs/run`,
      alwaysIncludePattern: true,
      pattern: 'yyyy-MM-dd.log'
    },
    error: {
      type: 'dateFile',
      filename: `${__dirname}/../logs/error`,
      alwaysIncludePattern: true,
      pattern: 'yyyy-MM-dd.log'
    }
  },
  categories: {
    default: {
      appenders: ['console', 'run'],
      level: 'ALL'
    },
    error: {
      appenders: ['console', 'error'],
      level: 'ALL'
    }
  },
  pm2: true
}