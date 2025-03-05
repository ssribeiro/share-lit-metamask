import { BehaviorSubject } from "rxjs";

const metamaskConnection = {
  isConnected: new BehaviorSubject<boolean>(false),
};

export const GvnrState = {
  metamaskConnection,
};
