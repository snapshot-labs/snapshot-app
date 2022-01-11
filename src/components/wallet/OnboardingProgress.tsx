import React from "react";
import StepIndicator from "react-native-step-indicator";
import { useAuthState } from "context/authContext";

const strokeWidth = 2;

const createCustomStyles = (colors: any) => ({
  stepIndicatorSize: 20,
  currentStepIndicatorSize: 20,
  separatorStrokeWidth: strokeWidth,
  separatorFinishedColor: colors.textColor,
  separatorUnFinishedColor: colors.indicatorColor,
  currentStepStrokeWidth: strokeWidth,
  stepStrokeCurrentColor: colors.bgBlue,
  stepStrokeWidth: strokeWidth,
  stepStrokeFinishedColor: colors.bgBlue,
  stepStrokeUnFinishedColor: colors.indicatorColor,
  stepIndicatorFinishedColor: colors.bgBlue,
  stepIndicatorUnFinishedColor: colors.textColor,
  stepIndicatorCurrentColor: colors.white,
  stepIndicatorLabelFontSize: 9,
  currentStepIndicatorLabelFontSize: 9,
  stepIndicatorLabelCurrentColor: colors.bgBlue,
  stepIndicatorLabelFinishedColor: colors.textColor,
  stepIndicatorLabelUnFinishedColor: colors.indicatorColor,
  labelColor: colors.indicatorColor,
  stepIndicatorLabelFontFamily: "Calibre-Medium",
  labelFontFamily: "Calibre-Medium",
  labelSize: 10,
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
