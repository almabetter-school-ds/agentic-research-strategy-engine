import mongoose from "mongoose";
import dns from "node:dns";

export async function connectMongo() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  configureDns();
  const uri = process.env.MONGODB_URI || process.env.MONGO_URL || (process.env.NODE_ENV === "production" ? "" : "mongodb://127.0.0.1:27017/market_research_engine");
  if (!uri) {
    throw new Error("MONGODB_URI is required in production. Set MONGODB_URI or MONGO_URL in backend/.env or your Render environment.");
  }
  if (!process.env.MONGODB_URI && !process.env.MONGO_URL) {
    console.warn("MONGODB_URI is not set; using local development MongoDB at mongodb://127.0.0.1:27017/market_research_engine");
  }
  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(uri, mongoOptions(uri));

    console.log("MongoDB connected successfully");
    console.log("Database host:", mongoose.connection.host);
    console.log("Database name:", mongoose.connection.name);

  } catch (err) {
    throw new Error(`Unable to connect to MongoDB at ${redactMongoUri(uri)}. ${mongoConnectionHint(uri, err)}`);
  }
  return mongoose.connection;
}

function mongoOptions(uri) {
  const options = {
    autoIndex: true,
    serverSelectionTimeoutMS: Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || 10000),
    connectTimeoutMS: Number(process.env.MONGODB_CONNECT_TIMEOUT_MS || 10000),
    socketTimeoutMS: Number(process.env.MONGODB_SOCKET_TIMEOUT_MS || 45000)
  };
  if (uri.startsWith("mongodb+srv://") || uri.includes("ssl=true") || uri.includes("tls=true")) {
    options.tls = true;
  }
  if (process.env.MONGODB_TLS_ALLOW_INVALID_CERTIFICATES === "true") {
    options.tlsAllowInvalidCertificates = true;
  }
  return options;
}

function configureDns() {
  const servers = (process.env.DNS_SERVERS || "").split(",").map(item => item.trim()).filter(Boolean);
  if (servers.length) dns.setServers(servers);
}

function redactMongoUri(uri) {
  return uri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:***@");
}

function mongoConnectionHint(uri, err) {
  const message = err?.message || "";
  if (uri.startsWith("mongodb+srv://") && /querySrv|ENOTFOUND|ECONNREFUSED|ETIMEOUT/i.test(message)) {
    return `Atlas SRV DNS lookup failed. Set DNS_SERVERS=8.8.8.8,1.1.1.1 in backend/.env, restart the terminal, and retry. If your network blocks SRV DNS, use the standard non-SRV Atlas connection string that lists shard hosts instead of mongodb+srv. Original error: ${message}`;
  }
  if (/authentication failed/i.test(message)) {
    return `MongoDB authentication failed. Check the database username/password in backend/.env. Original error: ${message}`;
  }
  if (/IP|whitelist|not authorized/i.test(message)) {
    return `MongoDB Atlas rejected the connection. Add your current IP address to Atlas Network Access. Original error: ${message}`;
  }
  if (/connection .* closed|connection closed|socket closed|ECONNRESET/i.test(message)) {
    return `The Atlas host was reached, but the MongoDB handshake was closed. Check Atlas Network Access and allow your current public IP address, confirm the database user/password are correct, and verify your network/firewall permits outbound TLS traffic to port 27017. If you are on a corporate network with TLS inspection, temporarily set MONGODB_TLS_ALLOW_INVALID_CERTIFICATES=true in backend/.env for local testing only. Original error: ${message}`;
  }
  return `Start local MongoDB or set MONGODB_URI/MONGO_URL in backend/.env to a reachable MongoDB Atlas URI. Original error: ${message}`;
}
