import { Response } from 'express'

export const handleExclusion = (
  res: Response
) => ({
  message = 'Bad request',
  error = {},
  status = 404
}) => {
  res.status(status).json({
    message,
    error,
    status
  })
}
