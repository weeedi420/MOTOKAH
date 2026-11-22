import { interpolate, useCurrentFrame, Easing } from "remotion";
import { Scene, Toast, fade } from "../kit";
import { SellScreen, SELL, toScreen } from "../sell";

const PHOTOS = [1, 2, 3, 4, 5].map((n) => `cars/hilux-white-2019-${n}.jpg`);
const F = { chooseTap: 26, photos: 36, scrollA: 82, scrollB: 104, submitTap: 116, toast: 124 };
const END_SCROLL = 1010 - 600 + 86 + 20;

export function Chapter4AddPhotos() {
  const frame = useCurrentFrame();
  const scroll = interpolate(frame, [F.scrollA, F.scrollB], [0, END_SCROLL], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.65, 0, 0.35, 1) });
  const choose = toScreen(SELL.chooseBtn, 0);
  const submit = toScreen(SELL.submit, END_SCROLL);
  const photos = frame >= F.photos ? PHOTOS : [];

  return (
    <Scene
      step={4}
      title="Add photos and submit"
      line="Add up to 10 photos. The first one is your cover. Then post it."
      shots={[
        { f: 0, x: 180, y: 240, z: 1.15 },
        { f: F.chooseTap - 6, x: 180, y: choose.y, z: 1.18 },
        { f: F.photos + 2, x: 180, y: choose.y, z: 1.18 },
        { f: F.photos + 18, x: 180, y: 240, z: 1.18 },
        { f: F.scrollA - 4, x: 180, y: 240, z: 1.18 },
        { f: F.scrollA + 6, x: 180, y: 300, z: 1 },
        { f: F.scrollB, x: 180, y: 300, z: 1 },
        { f: F.submitTap - 4, x: 180, y: submit.y - 40, z: 1.18 },
        { f: F.toast + 4, x: 180, y: 300, z: 1 },
      ]}
      taps={[{ frame: F.chooseTap, x: choose.x, y: choose.y }, { frame: F.submitTap, x: submit.x, y: submit.y }]}
    >
      <SellScreen
        scroll={scroll}
        make="Toyota"
        model="Hilux"
        year="2019"
        body="Pickup / Double Cab"
        price="78,500,000"
        photos={photos}
        photoIn={(i) => fade(frame, F.photos + i * 5, 10)}
        submitPressed={frame >= F.submitTap && frame < F.submitTap + 6}
      />
      <Toast frame={frame} at={F.toast} title="Listing submitted" body="Your vehicle is uploaded and ready for review. It will go live once verified." />
    </Scene>
  );
}

export const CHAPTER4_DURATION = 175;
