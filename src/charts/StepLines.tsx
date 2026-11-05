import { LineWithBand, type LineWithBandProps } from './LineWithBand';

/**
 * Step-line chart, for example Kaplan–Meier survival curves. Each series
 * holds its value until the next observation, then steps.
 */
export function StepLines(props: Omit<LineWithBandProps, 'curve' | 'bands'>) {
  return <LineWithBand {...props} curve="step" />;
}
