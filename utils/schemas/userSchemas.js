/*
 * -------------- JSON SCHEMAS ----------------
 */

const registerUserSchema = {
  type: 'object',
  required: ['email', 'password', 'name', 'rut', 'address', 'phone'],
  properties: {
    email: {
      type: 'string',
    },
    password: {
      type: 'string',
    },
    name: {
      type: 'string',
    },
    rut: {
      type: 'string',
    },
    address: {
      type: 'string',
    },
    phone: {
      type: 'string',
    }
  }
}

const loginUserSchema = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: {
      type: 'string',
    },
    password: {
      type: 'string',
    }
  }
}

module.exports = {
  registerUserSchema,
  loginUserSchema
}
