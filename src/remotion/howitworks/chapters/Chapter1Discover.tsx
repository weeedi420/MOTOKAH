import { useCurrentFrame } from "remotion";
import { Scene, Push, ListingCard, fade, rise } from "../kit";
import { HomeScreen, SearchScreen, HOME_TILE } from "../screens";

const TAP = 58;
const NAV = 72;
const tile = HOME_TILE(1);

export function Chapter1Discover() {
  const frame = useCurrentFrame();
  const cardIn = fade(frame, NAV + 18, 14);
  const cardY = rise(frame, NAV + 18, 24, 18);

  return (
    <Scene
      step={1}
      title="Browse by category"
      line="Tap a vehicle type on the home screen to see every one for sale."
      shots={[
        { f: 0, x: 180, y: 300, z: 1 },
        { f: 14, x: 180, y: 300, z: 1 },
        { f: 46, x: 180, y: tile.y - 30, z: 1.18 },
        { f: TAP + 10, x: 180, y: tile.y - 30, z: 1.18 },
        { f: NAV + 16, x: 180, y: 300, z: 1 },
        { f: 120, x: 180, y: 300, z: 1 },
        { f: 150, x: 180, y: 330, z: 1.12 },
      ]}
      taps={[{ frame: TAP, x: tile.x, y: tile.y }]}
    >
      <Push
        frame={frame}
        a={NAV}
        b={NAV + 16}
        from={<HomeScreen picked={frame >= TAP + 2 ? 1 : -1} />}
        to={
          <SearchScreen title="SUVs for Sale in East Africa" count="135 vehicles found" chips={["SUV"]}>
            <div style={{ opacity: cardIn, transform: `translateY(${cardY}px)` }}>
              <ListingCard title="2019 Toyota Fortuner" price="TZS 145,000,000" city="Dar es Salaam" km="62,000 km" year="2019" photo="cars/fortuner-white-2019-1.jpg" views={48} />
            </div>
          </SearchScreen>
        }
      />
    </Scene>
  );
}

export const CHAPTER1_DURATION = 165;
