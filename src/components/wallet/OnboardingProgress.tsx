import React from "react";
import StepIndicator from "react-native-step-indicator";
import { useAuthState } from "context/authContext";

const strokeWidth = 2;

const createCustomStyles = (colors: any) => ({
  stepIndicatorSize: 20,
  currentStepIndicatorSize: 20,
  separatorStrokeWidth: strokeWidth,
  separatorFinishedColor: colors.bgBlue,
  separatorUnFinishedColor: colors.darkGray,
  currentStepStrokeWidth: strokeWidth,
  stepStrokeCurrentColor: colors.bgBlue,
  stepStrokeWidth: strokeWidth,
  stepStrokeFinishedColor: colors.bgBlue,
  stepStrokeUnFinishedColor: colors.darkGray,
  stepIndicatorFinishedColor: colors.bgBlue,
  stepIndicatorUnFinishedColor: colors.white,
  stepIndicatorCurrentColor: colors.white,
  stepIndicatorLabelFontSize: 11,
  currentStepIndicatorLabelFontSize: 11,
  stepIndicatorLabelCurrentColor: colors.bgBlue,
  stepIndicatorLabelFinishedColor: colors.white,
  stepIndicatorLabelUnFinishedColor: colors.darkGray,
  labelColor: colors.darkGray,
  stepIndicatorLabelFontFamily: "Calibre-Medium",
  labelFontFamily: "Calibre-Medium",
  labelSize: 11,
  currentStepLabelColor: colors.bgBlue,
  finishedStepLabelColor: colors.bgBlue,
});

interface OnboardingProgressProps {
  currentStep?: number;
  steps: any[];
}

function OnboardingProgress({ currentStep, steps }: OnboardingProgressProps) {
  const { colors } = useAuthState();
  const customStyles = createCustomStyles(colors);

  return (
    <StepIndicator
      customStyles={customStyles}
      currentPosition={currentStep}
      labels={steps}
      stepCount={steps.length}
    />
  );
}

export default OnboardingProgress;
