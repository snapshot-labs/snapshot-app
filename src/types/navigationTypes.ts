import * as navigationConstants from "constants/navigation";
import { Proposal } from "types/proposal";
import { Space } from "types/explore";

export type RootStackParamsList = {
  [navigationConstants.PROPOSAL_SCREEN]: {
    proposal: Proposal;
    spaceId?: string;
    proposalId?: string;
  };
  [navigationConstants.SPACE_SCREEN]: {
    space: Space;
    showHeader?: boolean;
  };
  [navigationConstants.LANDING_SCREEN]: undefined;
  [navigationConstants.HOME_SCREEN]: undefined;
  [navigationConstants.WALLET_CONNECT_SCREEN]: undefined;
  [navigationConstants.QR_CODE_SCANNER_SCREEN]: undefined;
  [navigationConstants.CUSTOM_WALLET_SCREEN]: undefined;
  [navigationConstants.NETWORK_SCREEN]: undefined;
  [navigationConstants.STRATEGY_SCREEN]: undefined;
  [navigationConstants.SETTINGS_SCREEN]: undefined;
  [navigationConstants.CONNECT_ACCOUNT_SCREEN]: undefined;
  [navigationConstants.PROPOSAL_VOTES_SCREEN]: {
    space: Space;
    votes: any[];
    proposal: Proposal;
    choicesTextWidth: { title: string; width: number }[];
  };
  [navigationConstants.CREATE_PROPOSAL_SCREEN]: {
    space: Space;
  };
  [navigationConstants.CREATE_PROPOSAL_SCREEN_STEP_TWO]: {
    space: Space;
  };
  [navigationConstants.CREATE_PROPOSAL_SCREEN_STEP_THREE]: {
    space: Space;
  };
  [navigationConstants.CREATE_PROPOSAL_PREVIEW_SCREEN]: {
    space: Space;
  };
  [navigationConstants.ADVANCED_SETTINGS_SCREEN]: undefined;
  [navigationConstants.ABOUT_SCREEN]: undefined;
  [navigationConstants.SPACE_SETTINGS_SCREEN]: undefined;
  [navigationConstants.ONBOARDING]: undefined;
  [navigationConstants.WALLET_SETUP_SCREEN]: undefined;
  [navigationConstants.CHOOSE_PASSWORD_SCREEN]: { previousScreen: string };
  [navigationConstants.CHANGE_PASSWORD_SCREEN]: undefined;
  [navigationConstants.SEED_PHRASE_BACKUP_STEP1_SCREEN]: undefined;
  [navigationConstants.SEED_PHRASE_BACKUP_STEP2_SCREEN]: undefined;
  [navigationConstants.SEED_PHRASE_BACKUP_COMPLETE_SCREEN]: undefined;
  [navigationConstants.IMPORT_FROM_SEED_SCREEN]: undefined;
  [navigationConstants.QR_CODE_SCREEN]: undefined;
  [navigationConstants.IMPORT_FROM_PRIVATE_KEY_SCREEN]: undefined;
  [navigationConstants.ACCOUNT_DETAILS_SCREEN]: undefined;
  [navigationConstants.SHOW_PRIVATE_KEY_SCREEN]: undefined;
  [navigationConstants.VOTE_SCREEN]: {
    proposal: Proposal;
    space: Space;
    getProposal: () => void;
  };
  [navigationConstants.VOTE_CONFIRM_SCREEN]: {
    proposal: Proposal;
    space: Space;
    selectedChoices: number[];
    totalScore: number;
    getProposal: () => void;
  };
  [navigationConstants.USER_PROFILE]: {
    address: string;
  };
  [navigationConstants.FOLLOWING_SCREEN]: {
    address: string;
  };
  [navigationConstants.FOLLOWERS_SCREEN]: {
    address: string;
  };
  [navigationConstants.ADD_NEW_ACCOUNT_SCREEN]: undefined;
};
