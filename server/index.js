const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const users = require("./users");

const app = express();

const JWT_SECRET = "dev-secret-change-this";

app.use(cors());
app.use(express.json());

const devicesFilePath = path.join(__dirname, "devices.json");

function readDevices() {
  return JSON.parse(
    fs.readFileSync(devicesFilePath, "utf8")
  );
}

function writeDevices(devices) {
  fs.writeFileSync(
    devicesFilePath,
    JSON.stringify(devices, null, 2)
  );
}

//Login API
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    (item) =>
      item.username === username &&
      item.password === password
  );

  if (!user) {
    return res.status(401).json({
      message: "Invalid username or password",
    });
  }

  const token = jwt.sign(
    {
      userId: user.id,
      username: user.username,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );

  res.json({
    token,
    user: {
      username: user.username,
      role: user.role,
    },
  });
});

//Authentication
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token =
    authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Token required",
    });
  }

  try {
    req.user = jwt.verify(
      token,
      JWT_SECRET
    );

    next();
  } catch {
    return res.status(403).json({
      message: "Invalid token",
    });
  }
}

//Authorization
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (
      !allowedRoles.includes(req.user.role)
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    next();
  };
}

app.get(
  "/api/devices/export",
  authenticateToken,
  authorizeRoles("admin"),
  (req, res) => {
    const devices = readDevices();

    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=devices-export.json"
    );
    res.json(devices);
  }
);

//Get all devices
app.get(
  "/api/devices",
  authenticateToken,
  (req, res) => {
    const devices = readDevices();
    res.json(devices);
  }
);

//Get all by ID
app.get(
  "/api/devices/:id",
  authenticateToken,
  (req, res) => {
    const devices = readDevices();

    const id = Number(req.params.id);

    const device = devices.find(
      (d) => d.id === id
    );

    if (!device) {
      return res.status(404).json({
        message: "Device not found",
      });
    }

    res.json(device);
  }
);

//Add Device
app.post(
  "/api/devices",
  authenticateToken,
  authorizeRoles("admin", "operator"),
  (req, res) => {
    const devices = readDevices();

    const newDevice = req.body;

    devices.push(newDevice);

    writeDevices(devices);

    res.status(201).json(newDevice);
  }
);

//Update Device
app.put(
  "/api/devices/:id",
  authenticateToken,
  authorizeRoles("admin", "operator"),
  (req, res) => {
    const devices = readDevices();

    const id = Number(req.params.id);

    const index = devices.findIndex(
      (device) => device.id === id
    );

    if (index === -1) {
      return res.status(404).json({
        message: "Device not found",
      });
    }

    devices[index] = {
      ...devices[index],
      ...req.body,
      id,
    };

    writeDevices(devices);

    res.json(devices[index]);
  }
);

//Delete Device
app.delete(
  "/api/devices/:id",
  authenticateToken,
  authorizeRoles("admin"),
  (req, res) => {
    const devices = readDevices();

    const id = Number(req.params.id);

    const updatedDevices = devices.filter(
      (device) => device.id !== id
    );

    writeDevices(updatedDevices);

    res.status(204).send();
  }
);

//Import devices
app.post(
  "/api/devices/import",
  authenticateToken,
  authorizeRoles("admin"),
  (req, res) => {
    const importedDevices = req.body;

    if (!Array.isArray(importedDevices)) {
      return res.status(400).json({
        message: "Invalid import file. Expected a JSON array.",
      });
    }

    const currentDevices = JSON.parse(
      fs.readFileSync("./devices.json", "utf8")
    );

    const updatedDevices = [
      ...currentDevices,
      ...importedDevices,
    ];

    fs.writeFileSync(
      "./devices.json",
      JSON.stringify(updatedDevices, null, 2),
      "utf8"
    );

    devices = updatedDevices;

    res.json({
      message: "Devices imported successfully.",
      devices: updatedDevices,
    });
  }
);

app.listen(5000, () => {
  console.log(
    "Server running on port 5000"
  );
});
