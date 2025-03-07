import { getGvnrLitClient } from "@gvnrdao/gvnr-lit-client";
import {
  LitActionResource,
  LitPKPResource,
  createSiweMessageWithRecaps,
  generateAuthSig,
} from "@lit-protocol/auth-helpers";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import {
  AuthCallback,
  ExecuteJsResponse,
  LitAbility,
  WithRecap,
} from "@lit-protocol/types";
import { MetaMaskInpageProvider } from "@metamask/providers";
import { ethers } from "ethers-6.13.5";
import { CRYPTO_COMPARE_KEY } from "./constants";

declare global {
  interface Window {
    ethereum: MetaMaskInpageProvider | undefined;
  }
}

const gvnrLitClient = getGvnrLitClient({
  wsPort: "443",
  wsUrl: "wss://gvnr-lit-server-8ea4ddeb21f3.herokuapp.com",
});

const litNetwork: "datil-test" | "datil" = "datil-test";

const pricing = {
  "datil-test": {
    ipfsId: "QmdEwfxEABaCZjPSBE3MfdefSSeWTQJ3Gzvyh1WKmU5oGn",
    publicKey:
      "0x040b8214f1d3b1141821b6df36de98773484b3f4c1fddc3ad47418bff698e3c2860809b44b358ba4d0133322411c0945f062cfc9d9047b865e34cbc90d3fb86bc2",
    keyEthAddress: "0x6Cb02B64fe6fA5f01b58086BDe846Da29F19C870",
    pkpId: "f449dce411d421c8f90b82437676a09aff127a571efa5b44967974dfcaa9d590",
  },
  datil: {
    ipfsId: "QmNrPWkbjMRfaBEeG893DrLEaa9ELVtzJzuTnwZ2x9BThH",
    publicKey:
      "0x045dea8eee421e92ea47c5f5c14840b646250e74ff36f9de677a992e1aaba189e417ac5b1c09974bd180ff24504c4963476f62c486e10dfa17ce8ff3553fc301a6",
    keyEthAddress: "0x15c72cDa9F0B05e952aD420201Ff2b8b206bC86d",
    pkpId: "95037bac19e43d1c416e640b7226af54c771f9dfa7b2925e28a90d7570bacefa",
  },
};

const PRICING_STATEMENT =
  "Call Lit Action for pricing the asset exchange rate.";

const getSignerMetamask = async () => {
  const provider = new ethers.BrowserProvider(window.ethereum!);
  const signer = provider.getSigner();
  return signer;
};

const getSessionSigs_LitActionExecution_AuthSig = async (
  signer: ethers.Signer,
  litClient: LitNodeClient,
  withDomain?: string
) => {
  const signerPublicAddress = await signer.getAddress();
  const capacityCreditsDelegationAuth =
    await gvnrLitClient.getCapacityCreditsDelegation4Client(
      litNetwork,
      signerPublicAddress
    );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // const client = new LitNodeClient({
  //   alertWhenUnauthorized: false,
  //   litNetwork: litNetwork,
  //   debug: true,
  // });
  const client = litClient!;

  // console.log("capacityCreditsDelegationAuth", capacityCreditsDelegationAuth);

  const sessionSigs = await client.getSessionSigs({
    chain: "ethereum",
    expiration: new Date(Date.now() + 1000 * 60 * 60).toISOString(), // 1 hour
    capabilityAuthSigs: [capacityCreditsDelegationAuth],
    resourceAbilityRequests: [
      {
        resource: new LitPKPResource("*"),
        ability: LitAbility.PKPSigning,
      },
      {
        resource: new LitActionResource("*"),
        ability: LitAbility.LitActionExecution,
      },
    ],
    authNeededCallback: (async (data) => {
      // highlightLog(10);
      // console.log("uri", data.uri);
      // console.log("state.standaloneDomain", state.standaloneDomain);
      // console.log("data");
      // console.log(data);
      const requestParams: WithRecap = {
        uri: data.uri!,
        statement: PRICING_STATEMENT,
        expiration: data.expiration!,
        resources: data.resourceAbilityRequests!,
        walletAddress: signerPublicAddress,
        nonce: await client.getLatestBlockhash(),
        litNodeClient: client,
      };
      if (withDomain !== undefined) {
        requestParams.domain = withDomain;
      }

      const toSign = await createSiweMessageWithRecaps(requestParams);

      return await generateAuthSig({
        signer: signer,
        toSign,
      });
    }) as AuthCallback,
  });
  // console.log("Generated Session Signatures");

  // console.log("Session Signatures:", sessionSigs);

  return sessionSigs;
};

export const getPrice = async (withDomain?: string) => {
  const litClient = new LitNodeClient({
    alertWhenUnauthorized: false,
    litNetwork,
    debug: false,
  });
  await litClient.connect();

  const assetToken = {
    id: {
      chain: {
        chainId: 0,
        chainName: "ETHEREUM",
        subchainId: 137,
        subchainName: "POLYGON",
      },
      kind: "ERC20",
      contractAddress: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
      explorerUrl:
        "https://polygonscan.com/token/0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
    },
    name: "USDT-POLYGON",
    displayName: "Tether USD",
    decimals: "6",
    symbol: "USDT",
  };
  const currencyToken = {
    id: {
      chain: {
        chainId: 0,
        chainName: "ETHEREUM",
        subchainId: 137,
        subchainName: "POLYGON",
      },
      kind: "NATIVE",
      // contractAddress: "0x0000000000000000000000000000000000001010",
      explorerUrl:
        "https://polygonscan.com/token/0x0000000000000000000000000000000000001010",
    },
    name: "POL-POLYGON",
    displayName: "POL Token",
    decimals: "18",
    symbol: "POL",
  };

  const jsParams: Record<string, unknown> = {
    assetToken,
    currencyToken,
  };

  const litAction = pricing[litNetwork];

  jsParams["publicKey"] = litAction.publicKey;
  jsParams["apiKey"] = CRYPTO_COMPARE_KEY;

  // common procedure
  const signer = await getSignerMetamask();

  console.log("signer");
  console.log(signer);

  const sessionSigs = await getSessionSigs_LitActionExecution_AuthSig(
    signer,
    litClient,
    withDomain
  );

  const client = litClient;
  // const client = new LitNodeClient({
  //   alertWhenUnauthorized: false,
  //   litNetwork: litNetwork,
  //   debug: true,
  // });

  const response = (await client!.executeJs({
    sessionSigs,
    jsParams,
    ipfsId: litAction.ipfsId,
  })) as ExecuteJsResponse;
  console.log("response", response);
  return response;
  /*
    
    const validPriceInfo = getPriceInfoFromLitPriceResultV2(response);
    const priceError = validPriceInfo as IPriceErrorV1;
    assert(
      priceError.isError !== true,
      "GVNR: Pricing: Error fetching price: " +
        (priceError.knownError || priceError.unknownError)
    );
    const validation = await checkPriceInfoSignature(
      validPriceInfo as IPriceInfoV2,
      signerAddress
    );
    assert(validation, "GVNR: Pricing: Invalid signature");

    return validPriceInfo as IPriceInfoV2;
    */
};
