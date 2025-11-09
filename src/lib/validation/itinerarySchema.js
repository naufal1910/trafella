const { z } = require('zod');

const payloadSchema = z.object({
  destination: z.string().trim().min(1),
  startDate: z.string().refine((v) => !isNaN(Date.parse(v)), 'Invalid startDate'),
  endDate: z.string().refine((v) => !isNaN(Date.parse(v)), 'Invalid endDate'),
  interests: z.array(z.string().min(1)).default([]),
  budget: z.enum(['low', 'medium', 'high']).optional(),
  partySize: z.enum(['solo', 'couple', 'family']).optional(),
});

function normalize(input) {
  const parsed = payloadSchema.parse(input);
  const start = new Date(parsed.startDate);
  const end = new Date(parsed.endDate);
  if (start > end) {
    throw new Error('startDate must be <= endDate');
  }
  const days = Math.ceil((end - start) / (24 * 60 * 60 * 1000)) + 1;
  if (days < 1 || days > 14) {
    throw new Error('Date range must be between 1 and 14 days');
  }
  return {
    destination: parsed.destination.trim(),
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
    interests: parsed.interests,
    budget: parsed.budget,
    partySize: parsed.partySize,
    daysCount: days,
  };
}

module.exports = {
  payloadSchema,
  normalize,
};
