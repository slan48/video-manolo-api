const User = require('../../../../models/user');
const bcrypt = require('bcrypt');
const quantity = 10;

let users = [{
  email: 'admin@admin.com',
  password: bcrypt.hashSync('admin', 10),
  name: 'admin',
  rut: '12312312',
  address: 'Calle 123',
  phone: '93003003',
  isAdmin: true
}];

for (let i = 0; i < quantity; i++){
  const index = i + 1;
  const user = {
    email: 'email' + index + '@email.com',
    password: bcrypt.hashSync('123', 10),
    name: 'Joe Doe' + index,
    rut: '12312312' + index,
    address: 'Calle 12' + index,
    phone: '93003003' + index
  }

  users.push(user)
}

module.exports = users;


