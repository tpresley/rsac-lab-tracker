const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const crypto = require('crypto');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = 3000;

const teamHashes = {};
for (let i = 1; i <= 10; i++) {
  const teamName = `team${i}`;
  const teamHash = crypto.createHash('md5').update(teamName).digest('hex');
  console.log(teamName, teamHash);
  teamHashes[teamHash] = teamName;
}

app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/dist/index.html');
});

app.use('/assets', express.static(path.join(__dirname, 'dist', 'assets')));

app.post('/actions/reboot', (req, res) => {
  handleApiCall(req, res, true);
});

app.use((req, res) => {
  handleApiCall(req, res, false);
});

function handleApiCall(req, res, isCorrectUrl) {
  const authHeader = req.headers.authorization;
  const team = teamHashes[authHeader] || 'none';

  if (!isCorrectUrl) {
    const error = 'Incorrect API URL';
    io.emit('apiCall', { team, success: false, error });
    return res.status(404).json({ error, team });
  }

  if (!authHeader || !teamHashes[authHeader]) {
    const error = 'Unauthorized';
    io.emit('apiCall', { team, success: false, error });
    return res.status(401).json({ error, team });
  }

  io.emit('apiCall', { team, success: true });
  res.json({ message: 'Success', team });
}

io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
