import { MetaMaskInpageProvider } from "@metamask/providers";
import "./App.css";
const { getPrice } = require("./browser");

const THIS_DOMAIN = window.location.hostname;

declare global {
  interface Window {
    ethereum: MetaMaskInpageProvider | undefined;
  }
}

const App = () => {
  const runPricingWithoutDomain = async () => {
    const price = await getPrice();
    alert("Price: " + JSON.stringify(price));
  };

  const runPricingWithDomain = async () => {
    const price = await getPrice(THIS_DOMAIN);
    alert("Price: " + JSON.stringify(price));
  };

  return (
    <div
      style={{
        marginLeft: "1em",
      }}
    >
      <br></br>
      <button onClick={runPricingWithoutDomain}>
        Run Pricing Without Domain
      </button>
      <br></br>
      <button onClick={runPricingWithDomain}>
        Run Pricing With Domain {THIS_DOMAIN}
      </button>
    </div>
  );
};

export default App;
