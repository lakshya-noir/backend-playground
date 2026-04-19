const express = require('express');

const app = express();
const PORT = 3000;

// route
app.get('/', (req, res) => {
  res.send('Backend server is running');
});

// start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

