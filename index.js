/**
 * -------------- START SERVER ----------------
 */
const app = require('./server');

app.listen(process.env.PORT, () => {
  console.log(`Server up and listening at port ${process.env.PORT}`);
});
