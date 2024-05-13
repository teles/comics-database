import * as Sentry from '@sentry/node'
import dotenv from 'dotenv'
dotenv.config()

export const setupSentry = () => {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    // environment: Config.env,
    tracesSampleRate: 1.0
  })
}