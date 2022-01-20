import React, {
  createContext,
  useReducer,
  useContext,
  ReactNode,
  useState,
  useRef,
  useEffect,
} from "react";
import { ContextAction, ContextDispatch } from "types/context";

import BottomSheetModal from "components/BottomSheetModal";

type BottomSheetModalState = {
  onPressOption: (index: number) => void;
  options: string[];
  snapPoints: any[];
  show: boolean;
  scroll: boolean;
  ModalContent: any;
  icons: string[];
};

const BottomSheetModalContext = createContext<
  BottomSheetModalState | undefined
>(undefined);
const BottomSheetModalDispatchContext = createContext<
  ContextDispatch | undefined
>(undefined);
const BottomSheetModalRefContext = createContext<any>(undefined);

const BOTTOM_SHEET_MODAL_ACTIONS = {
  SET_BOTTOM_SHEET_MODAL: "@bottomSheetModal/SET_BOTTOM_SHEET_MODAL",
};

const initialState = {
  onPressOption: () => {},
  options: [],
  snapPoints: [],
  initialIndex: 1,
  ModalContent: undefined,
  show: false,
  scroll: false,
  icons: [],
};

function bottomSheetModalReducer(
  state: BottomSheetModalState,
  action: ContextAction
) {
  switch (action.type) {
    case BOTTOM_SHEET_MODAL_ACTIONS.SET_BOTTOM_SHEET_MODAL:
      return {
        ...state,
        ...action.payload,
        ModalContent: action?.payload?.ModalContent ?? undefined,
        icons: action?.payload.icons ?? [],
        scroll: action?.payload?.scroll ?? false,
      };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

type BottomSheetModalProviderProps = {
  children: ReactNode;
};

function BottomSheetModalProvider({ children }: BottomSheetModalProviderProps) {
  const [bottomSheetModal, setBottomSheetModal] = useReducer(
    bottomSheetModalReducer,
    initialState
  );
  const [showBottomSheetModal, setShowBottomSheetModal] = useState(false);
  const bottomSheetModalRef: any = useRef();

  useEffect(() => {
    setShowBottomSheetModal(bottomSheetModal.show);
    if (bottomSheetModal.show) {
      //@ts-ignore
      bottomSheetModalRef?.current?.snapToIndex(1);
    }
  }, [bottomSheetModal]);

  return (
    <BottomSheetModalRefContext.Provider value={bottomSheetModalRef}>
      <BottomSheetModalContext.Provider value={bottomSheetModal}>
        <BottomSheetModalDispatchContext.Provider value={setBottomSheetModal}>
          {children}
          {showBottomSheetModal && (
            <BottomSheetModal
              key={bottomSheetModal.key}
              bottomSheetRef={bottomSheetModalRef}
              onPressOption={bottomSheetModal.onPressOption}
              options={bottomSheetModal.options}
              snapPoints={bottomSheetModal.snapPoints}
              initialIndex={bottomSheetModal.initialIndex}
              ModalContent={bottomSheetModal.ModalContent}
              scroll={!!bottomSheetModal.scroll}
              icons={bottomSheetModal.icons ?? []}
              {...bottomSheetModal}
            />
          )}
        </BottomSheetModalDispatchContext.Provider>
      </BottomSheetModalContext.Provider>
    </BottomSheetModalRefContext.Provider>
  );
}

function useBottomSheetModalState() {
  const context = useContext(BottomSheetModalContext);
  if (context === undefined) {
    throw new Error("Unable to find BottomSheetModalState");
  }

  return context;
}

function useBottomSheetModalDispatch() {
  const context = useContext(BottomSheetModalDispatchContext);

  if (context === undefined) {
    throw new Error("Unable to find BottomSheetModalDispatchProvider");
  }

  return context;
}

function useBottomSheetModalRef() {
  const context = useContext(BottomSheetModalRefContext);
  if (context === undefined) {
    throw new Error("Unable to find BottomSheetModalRefContext");
  }

  return context;
}

export {
  BottomSheetModalProvider,
  useBottomSheetModalState,
  useBottomSheetModalDispatch,
  useBottomSheetModalRef,
  BottomSheetModalState,
  BOTTOM_SHEET_MODAL_ACTIONS,
};
