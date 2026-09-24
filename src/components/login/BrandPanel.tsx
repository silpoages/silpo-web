import { BrandMark } from './BrandMark';
import { BrandMessage } from './BrandMessage';
import { SoundWave } from './SoundWave';

export function BrandPanel() {
  return (
    <aside className="brand-panel">
      <BrandMark />
      <BrandMessage />
      <SoundWave />
    </aside>
  );
}
