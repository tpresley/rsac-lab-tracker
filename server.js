const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const crypto = require('crypto');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = 3000;

const LOGS = `
2025-03-25T02:30:00Z, INFO, Device=Printer1, Event=DriverSearch, Message="Searching for driver"
2025-03-25T02:31:00Z, INFO, Device=Router, Event=DHCPRequest, Message="DHCP request from 192.168.1.10"
2025-03-25T02:32:00Z, INFO, Device=Switch1, Event=PortStatus, Message="Port 3 status up"
2025-03-25T02:45:00Z, WARN, Device=AuthServer, Event=LoginAttempt, User=jdoe, Message="Failed login attempt"
2025-03-25T02:50:00Z, INFO, Device=VPNGateway, Event=Session, Message="VPN session failed"
2025-03-25T02:55:00Z, INFO, Device=BackupServer, Event=JobStart, Message="Backup job started"
2025-03-25T02:56:00Z, INFO, Device=Firewall, Event=Traffic, SourceIP=192.168.1.15, DestIP=8.8.8.8, Message="Allowed outbound traffic"
2025-03-25T03:00:00Z, WARN, Device=AuthServer, Event=AuthAttempt, User=script_user, Message="Repeated authentication attempts"
2025-03-25T03:05:00Z, INFO, Device=UpdateServer, Event=Update, Message="Software update executed"
2025-03-25T03:10:00Z, INFO, Device=IoTDevice1, Event=Reconnect, Message="Device reconnected"
2025-03-25T03:11:00Z, INFO, Device=Router, Event=DHCPRequest, Message="DHCP request from 192.168.1.20"
2025-03-25T03:12:00Z, INFO, Device=Switch2, Event=PortStatus, Message="Port 5 status down"
2025-03-25T03:15:00Z, WARN, Device=AuthServer, Event=LoginAttempt, User=jdoe, Message="Failed login attempt"
2025-03-25T03:16:00Z, INFO, Device=Firewall, Event=Traffic, SourceIP=192.168.1.25, DestIP=203.0.113.5, Message="Outbound traffic detected"
2025-03-25T03:17:00Z, INFO, Device=Laptop123, Event=FileDownload, URL=http://malicious.example.com/phish, Message="File downloaded"
2025-03-25T03:18:00Z, INFO, Device=Firewall, Event=Traffic, SourceIP=192.168.1.25, DestIP=203.0.113.5, Message="Outbound traffic detected"
2025-03-25T03:20:00Z, INFO, Device=Firewall, Event=Traffic, SourceIP=192.168.1.25, DestIP=203.0.113.5, Message="Outbound traffic detected"
2025-03-25T03:21:00Z, INFO, Device=Router, Event=DHCPRequest, Message="DHCP request from 192.168.1.30"
2025-03-25T03:22:00Z, INFO, Device=Switch3, Event=PortStatus, Message="Port 7 status up"
2025-03-25T03:25:00Z, INFO, Device=Firewall, Event=Traffic, SourceIP=192.168.1.25, DestIP=203.0.113.5, Message="Outbound traffic detected"
2025-03-25T03:30:00Z, INFO, Device=Firewall, Event=Traffic, SourceIP=192.168.1.25, DestIP=203.0.113.5, Message="Outbound traffic detected"
2025-03-25T03:35:00Z, INFO, Device=Firewall, Event=Traffic, SourceIP=192.168.1.25, DestIP=203.0.113.5, Message="Outbound traffic detected"
2025-03-25T03:40:00Z, INFO, Device=Firewall, Event=Traffic, SourceIP=192.168.1.25, DestIP=203.0.113.5, Message="Outbound traffic detected"
2025-03-25T03:45:00Z, INFO, Device=Firewall, Event=Traffic, SourceIP=192.168.1.25, DestIP=203.0.113.5, Message="Outbound traffic detected"
2025-03-25T03:50:00Z, INFO, Device=Firewall, Event=Traffic, SourceIP=192.168.1.25, DestIP=203.0.113.5, Message="Outbound traffic detected"
2025-03-25T03:55:00Z, INFO, Device=Firewall, Event=Traffic, SourceIP=192.168.1.25, DestIP=203.0.113.5, Message="Outbound traffic detected"
2025-03-25T04:00:00Z, INFO, Device=Firewall, Event=Traffic, SourceIP=192.168.1.25, DestIP=203.0.113.5, Message="Outbound traffic detected"
`

const teamHashes = {
  'R2D2': 'team1',
  'WALL-E': 'team2',
  'Rosie': 'team3',
  'Baymax': 'team4',
  'Data': 'team5',
  'Johnny5': 'team6',
  'Robbie': 'team7',
  'Iron Giant': 'team8',
  'Tachikoma': 'team9',
  'Paranoid Marvin': 'team10'
};

// for (let i = 1; i <= 10; i++) {
//   const teamName = `team${i}`;
//   const teamHash = crypto.createHash('md5').update(teamName).digest('hex');
//   console.log(teamName, teamHash);
//   teamHashes[teamHash] = teamName;
// }

app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/dist/index.html');
});

app.use('/assets', express.static(path.join(__dirname, 'dist', 'assets')));

app.get('/logs', (req, res) => {
  handleApiCall(req, res, 'logs');
})

app.post('/actions/reboot', (req, res) => {
  handleApiCall(req, res, 'action');
});

app.use((req, res) => {
  handleApiCall(req, res, 'incorrect');
});

function handleApiCall(req, res, type) {
  const authHeader = req.headers.authorization;
  if (authHeader.substr(0, 7) !== 'Bearer ') {
    let team = teamHashes[authHeader] || 'Unknown'
    const error = 'Bad Authorization Header';
    if (teamHashes[authHeader]) {
      io.emit('apiCall', { team, success: false, error });
    }
    return res.status(401).json({ error, team });
  }
  const team = teamHashes[authHeader.substr(7)] || 'none';
  const hasTeam = team !== 'none';

  if (type === 'incorrect') {
    const error = 'Incorrect API URL';
    io.emit('apiCall', { team, success: false, error });
    return res.status(404).json({ error, team });
  }

  if (!hasTeam) {
    const error = 'Unauthorized';
    io.emit('apiCall', { team, success: false, error });
    return res.status(401).json({ error, team });
  }

  io.emit('apiCall', { team, success: true, type });
  
  if (type === 'logs') {
    res.json({ message: 'Success', team, data: LOGS });
  } else {
    res.json({ message: 'Success', team });
  }
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
