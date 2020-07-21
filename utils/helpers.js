const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');

/**
 * -------------- HELPER FUNCTIONS ----------------
 */

async function validPassword(password, hash) {
  return await bcrypt.compare(password, hash)
}

async function genPassword(password) {
  return await bcrypt.hash(password, 10);
}

function issueJWT(user) {
  const _id = user._id;

  const expiresIn = '1d';

  const payload = {
    sub: _id,
    iat: Date.now()
  };

  const signedToken = jsonwebtoken.sign(payload, process.env.SECRET_KEY, { expiresIn: expiresIn });

  return {
    token: "Bearer " + signedToken,
    expires: expiresIn
  }
}

module.exports = {
  validPassword,
  genPassword,
  issueJWT
}
