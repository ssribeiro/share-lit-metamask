import { GvnrState } from "../state/gvnr-state";

const connectMetamask = () => {
  GvnrState.metamaskConnection.isConnected.next(true);
};

export const GvnrActions = {
  connectMetamask,
};
