import apolloClient from "./apolloClient";
import { ALIASES_QUERY } from "./queries";
import { Wallet } from "@ethersproject/wallet";
import { ethers, getDefaultProvider } from "ethers";
import signClient from "./signClient";
import { AUTH_ACTIONS } from "../context/authContext";
import WalletConnect from "@walletconnect/client";
import { ContextDispatch } from "../types/context";
import "@ethersproject/shims";
import Toast from "react-native-toast-message";
import { parseErrorMessage } from "helpers/apiUtils";
import i18n from "i18n-js";

export function getAliasWallet(aliasWalletPrivateKey: string | undefined) {
  const provider = getDefaultProvider();
  return aliasWalletPrivateKey
    ? new Wallet(aliasWalletPrivateKey, provider)
    : null;
}

export async function getRandomAliasWallet() {
  return new Wallet(ethers.utils.randomBytes(32));
}

export async function checkAlias(
  wallet: Wallet,
  connectedAddress: string | null | undefined
) {
  if (wallet) {
    const response = await apolloClient.query({
      query: ALIASES_QUERY,
      variables: {
        address: connectedAddress,
        alias: wallet.address,
      },
    });
    const aliases = response.data.aliases;
    return (
      aliases[0]?.address === connectedAddress &&
      aliases[0]?.alias === wallet.address
    );
  }
  return false;
}

export async function setAlias(
  connectedAddress: string | null | undefined,
  connector: WalletConnect,
  authDispatch: ContextDispatch | undefined = undefined,
  setAliasWallet?: (wallet: Wallet) => void
) {
  if (connectedAddress) {
    const wallet = await getRandomAliasWallet();
    const alias = {
      [connectedAddress]: wallet.privateKey,
    };

    if (wallet.address) {
      let signClientAliasResponse;
      try {
        signClientAliasResponse = await signClient.alias(
          connector,
          connectedAddress,
          {
            alias: wallet.address,
          }
        );
      } catch (e) {
        throw new Error(e);
      }

      if (signClientAliasResponse && authDispatch) {
        authDispatch({
          type: AUTH_ACTIONS.SET_ALIAS,
          payload: alias,
        });
        authDispatch({
          type: AUTH_ACTIONS.SET_ALIAS_WALLET,
          payload: wallet,
        });
      }
    }

    if (setAliasWallet) {
      setAliasWallet(wallet);
    }

    return wallet;
  }

  return false;
}

export async function signWithAliasCheck(
  aliasWallet: Wallet | null,
  connectedAddress: string,
  connector: WalletConnect,
  authDispatch: ContextDispatch,
  signAction: (aliasWallet: Wallet) => void
): Promise<any> {
  try {
    if (aliasWallet) {
      const isValidAlias = await checkAlias(aliasWallet, connectedAddress);
      if (isValidAlias) {
        return await signAction(aliasWallet);
      } else {
        const aliasWallet = await setAlias(
          connectedAddress,
          connector,
          authDispatch
        );

        if (aliasWallet) {
          const isValidAlias = await checkAlias(aliasWallet, connectedAddress);

          if (isValidAlias) {
            return await signAction(aliasWallet);
          }
        }
      }
    } else {
      const aliasWallet = await setAlias(
        connectedAddress,
        connector,
        authDispatch
      );

      if (aliasWallet) {
        const isValidAlias = await checkAlias(aliasWallet, connectedAddress);

        if (isValidAlias) {
          return await signAction(aliasWallet);
        }
      }
    }
  } catch (e) {
    console.log(e);
    return null;
  }
}
