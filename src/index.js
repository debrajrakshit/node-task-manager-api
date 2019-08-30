const app = require('./app');
const port = process.env.PORT;

// listen to port
app.listen(port, () => {
    console.log('Server is up on port ' + port);
});
