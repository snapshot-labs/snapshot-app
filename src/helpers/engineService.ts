import { ENGINE_ACTIONS } from "context/engineContext";
import { ContextDispatch } from "types/context";
import Encryptor from "helpers/encryptor";
import {
  PreferencesController,
  KeyringController,
} from "@metamask/controllers";
import AppConstants from "constants/app";
const encryptor = new Encryptor();

function initializeEngine(engineDispatch: ContextDispatch) {
  try {
    const preferencesController = new PreferencesController(
      {},
      {
        ipfsGateway: AppConstants.IPFS_DEFAULT_GATEWAY_URL,
        useStaticTokenList: true,
        useCollectibleDetection: true,
        openSeaEnabled: true,
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
      {}
    );

    engineDispatch({
      type: ENGINE_ACTIONS.INIT_ENGINE,
      payload: {
        keyRingController,
        preferencesController,
      },
    });
  } catch (e) {}
}

export default initializeEngine;
