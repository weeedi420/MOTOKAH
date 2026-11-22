import { interpolate, useCurrentFrame, Easing } from "remotion";
import { Scene, Push, Typed } from "../kit";
import { HomeScreen, NAV_SELL } from "../screens";
import { SellScreen, SELL, toScreen } from "../sell";

const F = { sellTap: 18, push: 24, scrollA: 44, scrollB: 64, makeTap: 74, model: 90, year: 118, scrollC: 136, scrollD: 154, bodyTap: 164, price: 180 };
const S1 = 290;
const S2 = 600;

export function Chapter3PostAd() {
  const frame = useCurrentFrame();
  const ease = Easing.bezier(0.65, 0, 0.35, 1);
  const scroll = frame < F.scrollC
    ? interpolate(frame, [F.scrollA, F.scrollB], [0, S1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease })
    : interpolate(frame, [F.scrollC, F.scrollD], [S1, S2], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });

  const make = toScreen(SELL.make(0), S1);
  const model = toScreen(SELL.model, S1);
  const year = toScreen(SELL.year, S1);
  const body = toScreen(SELL.body(3), S2);
  const price = toScreen(SELL.price, S2);
  const focus = frame >= F.price ? "price" : frame >= F.year && frame < F.scrollC ? "year" : frame >= F.model && frame < F.year ? "model" : undefined;

  return (
    <Scene
      step={3}
      title="Post your car for free"
      line="Tap Sell, pick the make, type the model, year and price."
      shots={[
        { f: 0, x: 180, y: 470, z: 1.18 },
        { f: F.sellTap + 6, x: 180, y: 470, z: 1.18 },
        { f: F.push + 14, x: 180, y: 300, z: 1 },
        { f: F.scrollB, x: 180, y: 300, z: 1 },
        { f: F.makeTap - 4, x: 180, y: make.y + 20, z: 1.18 },
        { f: F.model - 2, x: 180, y: model.y - 10, z: 1.18 },
        { f: F.year - 6, x: 180, y: model.y - 10, z: 1.18 },
        { f: F.year + 4, x: 180, y: year.y - 10, z: 1.18 },
        { f: F.scrollC, x: 180, y: 300, z: 1 },
        { f: F.scrollD + 4, x: 180, y: 300, z: 1 },
        { f: F.bodyTap - 2, x: 180, y: body.y, z: 1.18 },
        { f: F.price - 2, x: 180, y: price.y - 10, z: 1.18 },
        { f: 210, x: 180, y: price.y - 10, z: 1.18 },
      ]}
      taps={[
        { frame: F.sellTap, x: NAV_SELL.x, y: NAV_SELL.y },
        { frame: F.makeTap, x: make.x, y: make.y },
        { frame: F.model - 4, x: model.x, y: model.y },
        { frame: F.year - 4, x: year.x, y: year.y },
        { frame: F.bodyTap, x: body.x, y: body.y },
        { frame: F.price - 4, x: price.x, y: price.y },
      ]}
    >
      <Push
        frame={frame}
        a={F.push}
        b={F.push + 14}
        from={<HomeScreen />}
        to={
          <SellScreen
            scroll={scroll}
            focus={focus}
            make={frame >= F.makeTap + 2 ? "Toyota" : undefined}
            model={frame >= F.model ? <Typed text="Hilux" start={F.model} cps={0.3} caret={frame < F.year} /> : undefined}
            year={frame >= F.year ? <Typed text="2019" start={F.year} cps={0.3} caret={frame < F.scrollC} /> : undefined}
            body={frame >= F.bodyTap + 2 ? "Pickup / Double Cab" : undefined}
            price={frame >= F.price ? <Typed text="78,500,000" start={F.price} cps={0.45} /> : undefined}
          />
        }
      />
    </Scene>
  );
}

export const CHAPTER3_DURATION = 215;
