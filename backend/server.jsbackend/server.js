const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

let currentBattle = null;

io.on("connection", (socket) => {
  console.log("Usuário conectado:", socket.id);

  socket.on("joinArena", () => {
    socket.join("arena");
  });

  socket.on("startBattle", (data) => {
    currentBattle = {
      player1: data.player1,
      player2: data.player2,
      votes: {}
    };

    io.to("arena").emit("battleStarted", currentBattle);
  });

  socket.on("vote", ({ player }) => {
    if (!currentBattle) return;

    currentBattle.votes[player] = (currentBattle.votes[player] || 0) + 1;

    io.to("arena").emit("updateVotes", currentBattle.votes);
  });

  socket.on("endBattle", () => {
    if (!currentBattle) return;

    const winner =
      currentBattle.votes[currentBattle.player1] >
      currentBattle.votes[currentBattle.player2]
        ? currentBattle.player1
        : currentBattle.player2;

    io.to("arena").emit("battleEnded", { winner });

    currentBattle = null;
  });
});

server.listen(3000, () => {
  console.log("🔥 Sistema rodando na porta 3000");
});
