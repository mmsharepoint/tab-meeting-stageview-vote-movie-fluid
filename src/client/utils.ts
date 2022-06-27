import { AzureClient, AzureClientProps, AzureFunctionTokenProvider } from "@fluidframework/azure-client";
import { InsecureTokenProvider } from "@fluidframework/test-client-utils";
import { ContainerSchema, IFluidContainer, SharedMap } from "fluid-framework";
//import { AzureFunctionTokenProviderSec } from "./AzureFunctionTokenProviderSec";

let userID = "";
const useAzure = false; // | true

export const containerIdQueryParamKey = "containerId";

export const connectionConfig: AzureClientProps = useAzure ? { connection: {
    tenantId: process.env.REACT_APP_TENANT_ID!,
    tokenProvider: new AzureFunctionTokenProvider(process.env.REACT_APP_AZURETOKENURL + "/api/FluidTokenProvider", { userId: userID, userName: "Test User" }),
    orderer: process.env.REACT_APP_ORDERER!,
    storage: process.env.REACT_APP_STORAGE!,
}} :
 { connection: {
    tenantId: process.env.REACT_APP_TENANT_ID!,
    tokenProvider: new InsecureTokenProvider("c51b27e2881cfc8d8101d0e1dfaea768", { id: userID }), // Problematic to have secret here in client-side code
    orderer: process.env.REACT_APP_ORDERER!,
    storage: process.env.REACT_APP_STORAGE!,
}} ;

const containerSchema: ContainerSchema = {
  initialObjects: { sharedVotes: SharedMap }
};

const createContainer = async (client: AzureClient): Promise<string> => {
  const { container } = await client.createContainer(containerSchema);
  
    // Initialize votes
  const sharedVotes = container.initialObjects.sharedVotes as SharedMap;
  sharedVotes.set("votes1", 0);
  sharedVotes.set("votes2", 0);
  sharedVotes.set("votes3", 0);
  sharedVotes.set("votedUsers", "");

  const containerId = await container.attach();
  return containerId;
};

const getContainer = async (client: AzureClient, id : string): Promise<IFluidContainer> => {
    const { container } = await client.getContainer(id, containerSchema);
    return container;
};

const getClient = (userId: string, authToken?: string): AzureClient => {
  userID = userId;
  if (authToken !== undefined) {
    // connectionConfig.connection.tokenProvider = new AzureFunctionTokenProviderSec(process.env.REACT_APP_AZURETOKENURL + "/api/FluidTokenProvider", authToken, { userId: userID, userName: "Test User" });
  }  
  const client = new AzureClient(connectionConfig);
  return client;
};

export async function getFluidContainer(userId: string, authToken?: string, containerId?: string): Promise<IFluidContainer> {
  const client = getClient(userId, authToken);
  if (!containerId || containerId === "") {
    containerId = await createContainer(client);
  }
  const container = await getContainer(client, containerId);

  return container;
};
export async function getFluidContainerId(userId: string, authToken?: string, containerId?: string): Promise<string> {  
  try {
    const client = getClient(userId, authToken);
    if (!containerId || containerId === "") {
      containerId = await createContainer(client);
    }
    const container = await getContainer(client, containerId);
    return containerId;
  }
  catch {
    return "";
  }  
};