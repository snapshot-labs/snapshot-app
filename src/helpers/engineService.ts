import { ENGINE_ACTIONS } from "context/engineContext";
import { ContextDispatch } from "types/context";
import Encryptor from "helpers/encryptor";
import {
  PreferencesController,
  KeyringController,
  AccountTrackerController,
  TypedMessageManager,
} from "@metamask/controllers";
import AppConstants from "constants/app";
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

    engineDispatch({
      type: ENGINE_ACTIONS.INIT_ENGINE,
      payload: {
        keyRingController,
        preferencesController,
        accountTrackerController,
        typedMessageManager: new TypedMessageManager(),
      },
    });
  } catch (e) {}
}

export default initializeEngine;
