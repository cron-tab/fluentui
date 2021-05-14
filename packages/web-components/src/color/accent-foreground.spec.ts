import { parseColorHexRGB } from '@microsoft/fast-colors';
import { expect } from 'chai';
import {
  accentPalette as getAccentPalette,
  DesignSystem,
  DesignSystemDefaults,
  neutralPalette as getNeutralPalette,
} from '../fluent-design-system';
import {
  accentForegroundActive,
  accentForegroundHover,
  accentForegroundLargeActive,
  accentForegroundLargeHover,
  accentForegroundLargeRest,
  accentForegroundRest,
  accentForeground
} from './accent-foreground';
import { Palette } from './palette';
import { contrast, Swatch } from './common';
import { accentBaseColor, neutralBaseColor } from "./color-constants";
import { PaletteRGB } from "../color-vNext/palette";
import { SwatchRGB } from "../color-vNext/swatch";
import { accentForeground as accentForegroundNew } from "../color-vNext/recipes/accent-foreground";

describe('accentForeground', (): void => {
  const neutralPalette: Palette = getNeutralPalette(DesignSystemDefaults);
  const accentPalette: Palette = getAccentPalette(DesignSystemDefaults);

  it('should operate on design system defaults', (): void => {
    expect(accentForegroundRest({} as DesignSystem)).to.equal(accentPalette[59]);
    expect(accentForegroundHover({} as DesignSystem)).to.equal(accentPalette[65]);
    expect(accentForegroundActive({} as DesignSystem)).to.equal(accentPalette[55]);
    expect(accentForegroundLargeRest({} as DesignSystem)).to.equal(accentPalette[59]);
    expect(accentForegroundLargeHover({} as DesignSystem)).to.equal(accentPalette[65]);
    expect(accentForegroundLargeActive({} as DesignSystem)).to.equal(accentPalette[55]);
  });

  it('should accept a function that resolves a background swatch', (): void => {
    expect(typeof accentForegroundRest(() => '#FFF')).to.equal('function');
    expect(accentForegroundRest(() => '#000')({} as DesignSystem)).to.equal(accentPalette[59]);
    expect(typeof accentForegroundRest(() => '#FFFFFF')).to.equal('function');
    expect(accentForegroundRest(() => '#000000')({} as DesignSystem)).to.equal(accentPalette[59]);
  });

  it('should increase contrast on hover state and decrease contrast on active state in either mode', (): void => {
    expect(accentPalette.indexOf(accentForegroundHover(DesignSystemDefaults))).to.be.greaterThan(
      accentPalette.indexOf(accentForegroundRest(DesignSystemDefaults)),
    );
    expect(accentPalette.indexOf(accentForegroundActive(DesignSystemDefaults))).to.be.lessThan(
      accentPalette.indexOf(accentForegroundRest(DesignSystemDefaults)),
    );

    const darkDesignSystem: DesignSystem = Object.assign({}, DesignSystemDefaults, {
      backgroundColor: '#000',
    });
    expect(accentPalette.indexOf(accentForegroundHover(darkDesignSystem))).to.be.lessThan(
      accentPalette.indexOf(accentForegroundRest(darkDesignSystem)),
    );
    expect(accentPalette.indexOf(accentForegroundActive(darkDesignSystem))).to.be.greaterThan(
      accentPalette.indexOf(accentForegroundRest(darkDesignSystem)),
    );
  });

  it('should have accessible rest and hover colors against the background color', (): void => {
    const accentColors: Swatch[] = ['#0078D4', '#107C10', '#5C2D91', '#D83B01', '#F2C812'];

    accentColors.forEach(
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
      (accent: Swatch): void => {
        neutralPalette.forEach((swatch: Swatch): void => {
          const designSystem: DesignSystem = Object.assign({}, DesignSystemDefaults, {
            backgroundColor: swatch,
            accentPaletteConfig: Object.assign(
              {},
              {
                steps: 94,
                clipLight: 0,
                clipDark: 0,
              },
              {
                baseColor: parseColorHexRGB(swatch),
              },
            ),
          });

          expect(
            contrast(swatch, accentForegroundRest(designSystem)),
            // There are a few states that are impossible to meet contrast on
          ).to.be.gte(4.47);
          expect(
            contrast(swatch, accentForegroundHover(designSystem)),
            // There are a few states that are impossible to meet contrast on
          ).to.be.gte(3.7);
          expect(contrast(swatch, accentForegroundLargeRest(designSystem))).to.be.gte(3);
          expect(contrast(swatch, accentForegroundLargeHover(designSystem))).to.be.gte(3);
        });
      },
    );
  });
});
describe("ensure parity between old and new recipe implementation", () => {
  const neutralBase = parseColorHexRGB(neutralBaseColor)!;
  const accentBase = parseColorHexRGB(accentBaseColor)!;

  const neutralPalette = PaletteRGB.create(SwatchRGB.create(neutralBase.r, neutralBase.g, neutralBase.b));
  const accentPalette = PaletteRGB.create(SwatchRGB.create(accentBase.r, accentBase.g, accentBase.b));

  neutralPalette.swatches.forEach((newSwatch, index) => {
      const {
          accentForegroundRestDelta,
          accentForegroundFocusDelta,
          accentForegroundActiveDelta,
          accentForegroundHoverDelta
      } = DesignSystemDefaults;
      const oldValues = accentForeground({
          ...DesignSystemDefaults,
          backgroundColor: DesignSystemDefaults.neutralPalette[index],
      });
      const newValues = accentForegroundNew(
          accentPalette,
          newSwatch,
          4.5,
          accentForegroundRestDelta,
          accentForegroundHoverDelta,
          accentForegroundActiveDelta,
          accentForegroundFocusDelta,
      );
      it(`should be the same for ${newSwatch}`, () => {
          for (let key in newValues) {
              expect(oldValues[key]).to.equal(
                  newValues[key].toColorString().toUpperCase()
              );
          }
      });
  });
});
