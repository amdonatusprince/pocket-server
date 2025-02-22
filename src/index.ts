import { DirectClient } from "@elizaos/client-direct";
import {
  AgentRuntime,
  elizaLogger,
  settings,
  stringToUuid,
  type Character,
} from "@elizaos/core";
import { bootstrapPlugin } from "@elizaos/plugin-bootstrap";
import { createNodePlugin } from "@elizaos/plugin-node";
import { pythDataPlugin } from "@elizaos/plugin-pyth-data";
import { PocketFinanceSonicPlugin } from "@pocketfinance/sonic-plugin";
import net from "net";
import { initializeDbCache } from "./cache/index.js";
import { character } from "./character.js";
import { initializeClients } from "./clients/index.js";
import {
  getTokenForProvider,
} from "./config/index.js";
import { initializeDatabase } from "./database/index.js";

export const wait = (minTime: number = 1000, maxTime: number = 3000) => {
  const waitTime =
    Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
  return new Promise((resolve) => setTimeout(resolve, waitTime));
};

let nodePlugin: any | undefined;

export function createAgent(
  character: Character,
  db: any,
  cache: any,
  token: string
) {
  elizaLogger.success(
    elizaLogger.successesTitle,
    "Creating runtime for character",
    character.name,
  );

  nodePlugin ??= createNodePlugin();

  return new AgentRuntime({
    databaseAdapter: db,
    token,
    modelProvider: character.modelProvider,
    evaluators: [],
    character,
    plugins: [
      bootstrapPlugin,
      nodePlugin,
      pythDataPlugin,
      PocketFinanceSonicPlugin
    ].filter(Boolean),
    providers: [],
    actions: [],
    services: [],
    managers: [],
    cacheManager: cache,
  });
}

async function startAgent(character: Character, directClient: DirectClient) {
  try {
    character.id ??= stringToUuid(character.name);
    character.username ??= character.name;

    const token = getTokenForProvider(character.modelProvider, character);
    if (!token) {
      throw new Error(`No token found for provider ${character.modelProvider}`);
    }
    console.log("Starting agent with ID:", character.id);
    
    const db = initializeDatabase();
    await db.init();

    const cache = initializeDbCache(character, db);
    const runtime = createAgent(character, db, cache, token);

    await runtime.initialize();
    runtime.clients = await initializeClients(character, runtime);

    directClient.registerAgent(runtime);
    console.log("Agent registered with ID:", runtime.agentId);

    elizaLogger.debug(`Started ${character.name} as ${runtime.agentId}`);

    return runtime;
  } catch (error) {
    elizaLogger.error(
      `Error starting agent for character ${character.name}:`,
      error,
    );
    console.error(error);
    throw error;
  }
}

const startAgents = async () => {
  const directClient = new DirectClient();
  const serverPort = process.env.PORT ? parseInt(process.env.PORT) : 4123; // Use Render PORT or fallback to 4123
  
  try {
    const runtime = await startAgent(character, directClient as DirectClient);
    console.log("Agent runtime created with ID:", runtime.agentId);
    
    directClient.start(serverPort);
    console.log(`Server running on port ${serverPort}`);
    
  } catch (error) {
    elizaLogger.error("Error starting agents:", error);
    process.exit(1);
  }
};

startAgents().catch((error) => {
  elizaLogger.error("Unhandled error in startAgents:", error);
  process.exit(1);
});
