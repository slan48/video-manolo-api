/*
 * -------------- JSON SCHEMAS ----------------
 */

const idSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: {
      type: 'string',
      minLength: 24,
      maxLength: 24
    }
  }
}

module.exports = idSchema;
