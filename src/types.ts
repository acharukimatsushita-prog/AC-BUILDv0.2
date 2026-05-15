export type StepCheck = {
  id: string;
  text: string;
  required?: boolean;
};

export type Step = {
  title: string;
  memo: string;
  image: string;
  popupEnabled?: boolean;
  checks?: StepCheck[];
};

export type Device = {
  id: string;
  name: string;
  sourceType: string;
  drivePath: string;
  steps: Step[];
  updatedAt: string;
};

export type LegacyWindow = Window & {
  devices?: Device[];
  saveDevices?: () => void;
  renderDevices?: () => void;
  goToEditView?: (device: Device) => void;
};
