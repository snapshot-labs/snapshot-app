import { ENGINE_ACTIONS } from "context/engineContext";
import { ContextDispatch } from "types/context";
import Encryptor from "helpers/encryptor";
import {
  PreferencesController,
  KeyringController,
  AccountTrackerController,
  NetworkController,
  WalletDevice,
  PersonalMessageManager,
  MessageManager,
} from "@metamask/controllers";
import AppConstants from "constants/app";
import env from "constants/env";
const encryptor = new Encryptor();

function initializeEngine(
  engineDispatch: ContextDispatch,
  keyRingControllerState: any,
  preferencesControllerState: any
) {
  try {
    const preferencesController = new PreferencesController(
      {},
      {
        ipfsGateway: AppConstants.IPFS_DEFAULT_GATEWAY_URL,
        useStaticTokenList: true,
        useCollectibleDetection: true,
        openSeaEnabled: true,
        ...preferencesControllerState,
      }
    );
    const keyRingController = new KeyringController(
      {
        removeIdentity: preferencesController.removeIdentity.bind(
          preferencesController
        ),
        syncIdentities: preferencesController.syncIdentities.bind(
          preferencesController
        ),
        updateIdentities: preferencesController.updateIdentities.bind(
          preferencesController
        ),
        setSelectedAddress: preferencesController.setSelectedAddress.bind(
          preferencesController
        ),
      },
      { encryptor },
      keyRingControllerState
    );
    const accountTrackerController = new AccountTrackerController({
      onPreferencesStateChange: (listener) =>
        preferencesController.subscribe(listener),
      getIdentities: () => preferencesController.state.identities,
    });

    const networkController = new NetworkController({
      infuraProjectId: env.INFURA_PROJECT_ID || "NON_EMPTY",
      providerConfig: {
        static: {
          eth_sendTransaction: async (
            payload: { params: any[]; origin: any },
            next: any,
            end: (arg0: undefined, arg1: undefined) => void
          ) => {
            const { TransactionController } = this.context;
            try {
              const hash = await (
                await TransactionController.addTransaction(
                  payload.params[0],
                  payload.origin,
                  WalletDevice.MM_MOBILE
                )
              ).result;
              end(undefined, hash);
            } catch (error) {
              end(error);
            }
          },
        },
        getAccounts: (
          end: (arg0: null, arg1: any[]) => void,
          payload: { hostname: string | number }
        ) => {
          // const { approvedHosts, privacyMode } = store.getState();
          const approvedHosts: any = [];
          const privacyMode = true;
          const isEnabled = !privacyMode || approvedHosts[payload.hostname];
          const isUnlocked = keyRingController.isUnlocked();
          const selectedAddress = preferencesController.state.selectedAddress;
          end(
            null,
            isUnlocked && isEnabled && selectedAddress ? [selectedAddress] : []
          );
        },
      },
    });

    //
    // const update_bg_state_cb = () => {
    //   console.log("UPDATE KEY RING STATE", keyRingController.state);
    // };
    // keyRingController.subscribe(update_bg_state_cb);

    engineDispatch({
      type: ENGINE_ACTIONS.INIT_ENGINE,
      payload: {
        keyRingController,
        preferencesController,
        accountTrackerController,
        networkController,
        personalMessageManager: new PersonalMessageManager(),
        messageManager: new MessageManager(),
      },
    });
  } catch (e) {}
}

export default initializeEngine;
