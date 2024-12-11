const sha1 = require('sha1');

const pwdHashed = (pwd) => sha1(pwd);
const getAuthzHeader = (req) => {
  const header = req.headers.authorization;
  if (!header) {
    return null;
  }
  console.log(header);
  return header;
};

const getToken = (authzHeader) => {
  const tokenType = authzHeader.substring(0, 6);
  if (tokenType !== 'Basic ') {
    return null;
  }
  console.log(authzHeader);
  return authzHeader.substring(6);
};

const decodeToken = (token) => {
  const decodedToken = Buffer.from(token, 'base64').toString('utf8');
  if (!decodedToken.includes(':')) {
    return null;
  }
  console.log(decodedToken);
  return decodedToken;
};

const getCredentials = (decodedToken) => {
  const [email, password] = decodedToken.split(':');
  if (!email || !password) {
    return null;
  }
  console.log(email);
  console.log(password)
  return { email, password };
};

module.exports = { pwdHashed, getAuthzHeader, getToken, decodeToken, getCredentials };