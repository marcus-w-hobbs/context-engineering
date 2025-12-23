/**
 * CDP Port Management for Parallel Agents
 * 
 * THE KEY INNOVATION: Multiple AI agents can run separate Chrome instances
 * on different ports, enabling true parallel autonomous debugging.
 * 
 * Usage:
 *   Agent 1: CDP_PORT=9222 ./start.js  (default)
 *   Agent 2: CDP_PORT=9223 ./start.js
 *   Agent 3: CDP_PORT=9224 ./start.js
 * 
 * All tools respect the CDP_PORT environment variable.
 */

export const DEFAULT_PORT = 9222;

let cachedPort = null;
let portLogged = false;

export function getCDPPort() {
  if (cachedPort !== null) {
    return cachedPort;
  }

  const port = process.env.CDP_PORT ? parseInt(process.env.CDP_PORT, 10) : DEFAULT_PORT;

  if (!portLogged) {
    if (!process.env.CDP_PORT) {
      console.log(`CDP_PORT not set, using default port ${DEFAULT_PORT}`);
    } else {
      console.log(`Using CDP port ${port} from CDP_PORT environment variable`);
    }
    portLogged = true;
  }

  if (isNaN(port) || port < 1 || port > 65535) {
    if (!portLogged || cachedPort === null) {
      console.error(`Invalid CDP_PORT value: ${process.env.CDP_PORT}, falling back to ${DEFAULT_PORT}`);
    }
    cachedPort = DEFAULT_PORT;
    return DEFAULT_PORT;
  }

  cachedPort = port;
  return port;
}

export function getCDPUrl() {
  const port = getCDPPort();
  return `http://localhost:${port}`;
}
