import React, { useCallback, useState } from "react";
import { SafeAreaView, View } from "react-native";
import { useCreateProposalState } from "context/createProposalContext";
import { Space } from "types/explore";
import {
  AUTH_ACTIONS,
  useAuthDispatch,
  useAuthState,
} from "context/authContext";
import common from "styles/common";
import CreateProposalPreviewHeader from "components/createProposal/CreateProposalPreviewHeader";
import i18n from "i18n-js";
import { useScrollManager } from "../../hooks/useScrollManager";
import { TabRoute } from "components/tabBar/TabView";
import Scene from "components/tabBar/Scene";
import MarkdownBody from "components/proposal/MarkdownBody";
import BackButton from "components/BackButton";
import AnimatedHeader from "components/tabBar/AnimatedHeader";
import TabView from "components/tabBar/TabView";
import Device from "helpers/device";
import AnimatedTabBar from "components/tabBar/AnimatedTabBar";
import TabBarComponent from "components/tabBar/TabBar";
import CreateProposalPreviewResultsBlock from "components/createProposal/CreateProposalPreviewResultsBlock";
import CreateProposalPreviewInfoBlock from "components/createProposal/CreateProposalPreviewInfoBlock";
import CreateProposalFooter from "components/createProposal/CreateProposalFooter";
import { useNavigation } from "@react-navigation/native";
import { sendEIP712 } from "helpers/EIP712";
import { PROPOSAL_SCREEN, SPACE_SCREEN } from "constants/navigation";
import { parseErrorMessage } from "helpers/apiUtils";
import {
  BOTTOM_SHEET_MODAL_ACTIONS,
  useBottomSheetModalDispatch,
  useBottomSheetModalRef,
} from "context/bottomSheetModalContext";
import { ethers } from "ethers";
import { getSnapshotDataForSign } from "helpers/snapshotWalletUtils";
import signClient from "helpers/signClient";
import SubmitPasswordModal from "components/wallet/SubmitPasswordModal";
import { useToastShowConfig } from "constants/toast";
import { createBottomSheetParamsForWalletConnectError } from "constants/bottomSheet";
import { addressIsSnapshotWallet } from "helpers/address";
import { useEngineState } from "context/engineContext";
import proposal from "constants/proposal";
import Toast from "react-native-toast-message";

const baseHeaderHeight = Device.isIos() ? 280 : 240;

interface CreateProposalPreviewScreenProps {
  route: {
    params: {
      space: Space;
    };
  };
}

function CreateProposalPreviewScreen({
  route,
}: CreateProposalPreviewScreenProps) {
  const space = route.params.space;
  const {
    colors,
    snapshotWallets,
    savedWallets,
    aliases,
    connectedAddress,
    wcConnector,
  } = useAuthState();
  const authDispatch = useAuthDispatch();
  const { keyRingController, typedMessageManager } = useEngineState();
  const { title, body, start, end, choices, snapshot, votingType } =
    useCreateProposalState();
  const tabs = [
    { key: "about", title: i18n.t("about") },
    { key: "results", title: i18n.t("results") },
    { key: "info", title: i18n.t("info") },
  ];
  const proposalTitleLength = title?.length > 60 ? 30 : 0;
  const headerHeight = baseHeaderHeight + proposalTitleLength;
  const { scrollY, index, setIndex, getRefForKey, ...sceneProps } =
    useScrollManager(tabs, { header: headerHeight });
  const navigation: any = useNavigation();
  const toastShowConfig = useToastShowConfig();
  const bottomSheetModalRef = useBottomSheetModalRef();
  const bottomSheetModalDispatch = useBottomSheetModalDispatch();
  const bottomSheetWCErrorConfig = createBottomSheetParamsForWalletConnectError(
    colors,
    bottomSheetModalRef,
    authDispatch,
    navigation,
    savedWallets,
    aliases,
    connectedAddress ?? ""
  );
  const isSnapshotWallet = addressIsSnapshotWallet(
    connectedAddress ?? "",
    snapshotWallets
  );
  const [createProposalLoading, setCreateProposalLoading] = useState(false);

  const renderScene = useCallback(
    ({ route: tab }: { route: TabRoute }) => {
      if (tab.key === "about") {
        return (
          <Scene
            isActive={tabs[index].key === tab.key}
            routeKey={tab.key}
            scrollY={scrollY}
            headerHeight={headerHeight}
            data={[{ key: "body" }]}
            renderItem={() => {
              return (
                <View
                  style={[
                    common.containerHorizontalPadding,
                    { marginTop: 22, paddingBottom: 100 },
                  ]}
                >
                  <MarkdownBody body={body} />
                </View>
              );
            }}
            {...sceneProps}
          />
        );
      } else if (tab.key === "results") {
        return (
          <Scene
            isActive={tabs[index].key === tab.key}
            routeKey={tab.key}
            scrollY={scrollY}
            headerHeight={headerHeight}
            data={[{ key: "results" }]}
            renderItem={() => {
              return (
                <View
                  style={[
                    common.containerHorizontalPadding,
                    { marginTop: 22, paddingBottom: 100 },
                  ]}
                >
                  <CreateProposalPreviewResultsBlock space={space} />
                </View>
              );
            }}
            {...sceneProps}
          />
        );
      } else if (tab.key === "info") {
        return (
          <Scene
            isActive={tabs[index].key === tab.key}
            routeKey={tab.key}
            scrollY={scrollY}
            headerHeight={headerHeight}
            data={[{ key: "info" }]}
            renderItem={() => {
              return (
                <View
                  style={[
                    common.containerHorizontalPadding,
                    { marginTop: 28, paddingBottom: 100 },
                  ]}
                >
                  <CreateProposalPreviewInfoBlock space={space} />
                </View>
              );
            }}
            {...sceneProps}
          />
        );
      }
    },
    [getRefForKey, index, tabs, scrollY]
  );

  async function snapshotWalletProposalCreate(proposal: any) {
    if (keyRingController.isUnlocked()) {
      if (connectedAddress) {
        const formattedAddress = connectedAddress?.toLowerCase();
        const checksumAddress = ethers.utils.getAddress(formattedAddress);
        const { snapshotData, signData } = getSnapshotDataForSign(
          checksumAddress,
          "proposal",
          proposal,
          space
        );

        try {
          const messageId = await typedMessageManager.addUnapprovedMessage(
            {
              data: JSON.stringify(signData),
              from: checksumAddress,
            },
            { origin: "snapshot.org" }
          );
          const cleanMessageParams = await typedMessageManager.approveMessage({
            ...signData,
            metamaskId: messageId,
          });
          const rawSig = await keyRingController.signTypedMessage(
            {
              data: JSON.stringify(cleanMessageParams),
              from: checksumAddress,
            },
            "V4"
          );

          typedMessageManager.setMessageStatusSigned(messageId, rawSig);

          const sign: any = await signClient.send({
            address: checksumAddress,
            sig: rawSig,
            data: snapshotData,
          });

          if (sign) {
            navigation.reset({
              index: 1,
              routes: [
                {
                  name: SPACE_SCREEN,
                  params: {
                    space,
                  },
                },
                {
                  name: PROPOSAL_SCREEN,
                  params: {
                    proposalId: sign.id,
                    spaceId: space.id,
                  },
                },
              ],
            });
            Toast.show({
              type: "customSuccess",
              text1: i18n.t("proposalCreated"),
              ...toastShowConfig,
            });
            authDispatch({
              type: AUTH_ACTIONS.SET_REFRESH_FEED,
              payload: {
                spaceId: space.id,
              },
            });
            bottomSheetModalRef?.current?.close();
          } else {
            Toast.show({
              type: "customError",
              text1: i18n.t("unableToCreateProposal"),
              ...toastShowConfig,
            });
          }
        } catch (e) {
          console.log({ e });
          Toast.show({
            type: "customError",
            text1: parseErrorMessage(e, i18n.t("signature_request.error")),
            ...toastShowConfig,
          });
        }
      }
    } else {
      bottomSheetModalDispatch({
        type: BOTTOM_SHEET_MODAL_ACTIONS.SET_BOTTOM_SHEET_MODAL,
        payload: {
          snapPoints: [10, 450],
          initialIndex: 1,
          ModalContent: () => {
            return (
              <SubmitPasswordModal
                onClose={() => {
                  bottomSheetModalRef.current?.close();
                }}
                navigation={navigation}
              />
            );
          },
          show: true,
          key: `submit-password-modal-${proposal.id}`,
        },
      });
    }
  }

  return (
    <SafeAreaView
      style={[common.screen, { backgroundColor: colors.bgDefault }]}
    >
      <View
        style={[
          common.headerContainer,
          common.justifySpaceBetween,
          {
            borderBottomColor: "transparent",
            backgroundColor: colors.bgDefault,
            zIndex: 99,
          },
        ]}
      >
        <BackButton />
      </View>
      <AnimatedHeader scrollY={scrollY} headerHeight={headerHeight}>
        <CreateProposalPreviewHeader space={space} />
      </AnimatedHeader>
      <TabView
        index={index}
        setIndex={setIndex}
        width={Device.getDeviceWidth()}
        routes={tabs}
        renderTabBar={(p) => (
          <AnimatedTabBar scrollY={scrollY} headerHeight={headerHeight}>
            <TabBarComponent {...p} tabsLength={tabs.length} />
          </AnimatedTabBar>
        )}
        renderScene={renderScene}
      />
      <CreateProposalFooter
        backButtonTitle={i18n.t("back")}
        onPressBack={() => {
          navigation.goBack();
        }}
        actionButtonTitle={i18n.t("create")}
        actionButtonLoading={createProposalLoading}
        onPressAction={async () => {
          setCreateProposalLoading(true);
          const form = {
            name: title,
            body: body,
            start: start,
            end: end,
            type: votingType,
            snapshot: snapshot,
            choices,
            metadata: {
              network: space.network,
              strategies: space.strategies,
              plugins: {},
            },
          };

          try {
            if (isSnapshotWallet) {
              await snapshotWalletProposalCreate(form);
            } else {
              const sign: any = await sendEIP712(
                wcConnector,
                connectedAddress ?? "",
                space,
                "proposal",
                form
              );

              if (sign) {
                navigation.replace(PROPOSAL_SCREEN, {
                  proposalId: sign.id,
                  spaceId: space.id,
                });
                Toast.show({
                  type: "customSuccess",
                  text1: i18n.t("proposalCreated"),
                  ...toastShowConfig,
                });
                authDispatch({
                  type: AUTH_ACTIONS.SET_REFRESH_FEED,
                  payload: {
                    spaceId: space.id,
                  },
                });
              } else {
                Toast.show({
                  type: "customError",
                  text1: i18n.t("unableToCreateProposal"),
                  ...toastShowConfig,
                });
              }
            }
          } catch (e) {
            Toast.show({
              type: "customError",
              text1: parseErrorMessage(e, i18n.t("unableToCreateProposal")),
              ...toastShowConfig,
            });
            bottomSheetModalDispatch({
              type: BOTTOM_SHEET_MODAL_ACTIONS.SET_BOTTOM_SHEET_MODAL,
              payload: {
                ...bottomSheetWCErrorConfig,
              },
            });
          }

          setCreateProposalLoading(false);
        }}
      />
    </SafeAreaView>
  );
}

export default CreateProposalPreviewScreen;
