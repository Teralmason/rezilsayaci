const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "data.json");

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// Helper: Dosyadan oku
function readData() {
  try {
    const raw = fs.readFileSync(DATA_FILE);
    return JSON.parse(raw);
  } catch (e) {
    return { users: {} };
  }
}

// Helper: Dosyaya yaz
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// GET veriyi al
app.get("/api/data", (req, res) => {
  res.json(readData());
});

// POST bir kullanıcıyı artır
app.post("/api/increment", (req, res) => {
  const { userId, date } = req.body;
  const data = readData();
  if (!data.users[userId]) return res.status(400).json({ error: "User yok" });

  const day = date || new Date().toISOString().slice(0, 10);
  data.users[userId].byDate[day] = (data.users[userId].byDate[day] || 0) + 1;
  data.users[userId].total = Object.values(data.users[userId].byDate).reduce((a,b)=>a+b,0);

  writeData(data);
  res.json(data);
});

// POST reset
app.post("/api/reset", (req, res) => {
  const data = readData();
  for (const userId in data.users) {
    data.users[userId].byDate = {};
    data.users[userId].total = 0;
  }
  writeData(data);
  res.json(data);
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
