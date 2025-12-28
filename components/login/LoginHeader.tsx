import { useState } from "react";
import { View, useWindowDimensions } from "react-native";
import Svg, {
  ClipPath,
  Defs,
  Polygon,
  Image as SvgImage,
} from "react-native-svg";

type DeviceType = "small" | "medium" | "large" | "xlarge";

const getDeviceType = (width: number): DeviceType => {
  if (width <= 360) return "small";
  if (width <= 390) return "medium";
  if (width <= 430) return "large";
  return "xlarge";
};

const DESIGN_CONFIG: Record<DeviceType, {
  headerHeightRatio: number;
  cutAngle: number;
  lineBottomRatio: number;
  longTriangle: {
    widthRatio: number;
    heightRatio: number;
    bottomRatio: number;
    rotate: number;
  };
  rightTriangle: {
    widthRatio: number;
    heightRatio: number;
    bottomRatio: number;
  };
}> = {
  small: {
    headerHeightRatio: 1.05,
    cutAngle: 18,
    lineBottomRatio: 0.13,
    longTriangle: {
      widthRatio: 2.1,
      heightRatio: 0.2,
      bottomRatio: 0.3,
      rotate: -20,
    },
    rightTriangle: {
      widthRatio: 0.48,
      heightRatio: 0.52,
      bottomRatio: 0.3,
    },
  },
  medium: {
    headerHeightRatio: 0.95,
    cutAngle: 20,
    lineBottomRatio: 0.17,
    longTriangle: {
      widthRatio: 2.29,
      heightRatio: 0.2,
      bottomRatio: 0.26,
      rotate: -22,
    },
    rightTriangle: {
      widthRatio: 0.53,
      heightRatio: 0.45,
      bottomRatio: 0.22,
    },
  },
  large: {
    headerHeightRatio: .9,
    cutAngle: 22,
    lineBottomRatio: 0.19,
    longTriangle: {
      widthRatio: 2.4,
      heightRatio: 0.18,
      bottomRatio: 0.24,
      rotate: -24,
    },
    rightTriangle: {
      widthRatio: 0.54,
      heightRatio: 0.48,
      bottomRatio: 0.2,
    },
  },
  xlarge: {
    headerHeightRatio: 0.85,
    cutAngle: 24,
    lineBottomRatio: 0.23,
    longTriangle: {
      widthRatio: 2.39,
      heightRatio: 0.17,
      bottomRatio: 0.22,
      rotate: -26,
    },
    rightTriangle: {
      widthRatio: 0.2,
      heightRatio: 0.6,
      bottomRatio: 0.24,
    },
  },
};

export default function LoginHeader() {
  const { width } = useWindowDimensions();
  const [layout, setLayout] = useState({ width: 0, height: 0 });

  const deviceType = getDeviceType(width);
  const config = DESIGN_CONFIG[deviceType];

  const HEADER_HEIGHT = width * config.headerHeightRatio;

  return (
    <View style={{ height: HEADER_HEIGHT, width: "100%", position: "relative" }}>
      {/* ================= LÍNEA BLANCA ================= */}
      {layout.height > 0 && (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: -layout.width,
            bottom: layout.height * config.lineBottomRatio,
            width: layout.width * 3,
            height: layout.height * 0.015,
            backgroundColor: "#FFFFFF",
            transform: [{ rotate: `-${config.cutAngle}deg` }],
            zIndex: 20,
          }}
        />
      )}

      {/* ================= TRIÁNGULO DERECHO ================= */}
      {layout.height > 0 && (
        <Svg
          pointerEvents="none"
          style={{
            position: "absolute",
            right: -width * 0.05,
            bottom: -layout.height * config.rightTriangle.bottomRatio,
            width: width * config.rightTriangle.widthRatio,
            height: layout.height * config.rightTriangle.heightRatio,
            zIndex: 20,
          }}
          viewBox="0 0 100 100"
        >
          <Polygon
            points="
              100,100
              50,0
              100,45
            "
            fill="#FFFFFF"
          />
        </Svg>
      )}

      {/* ================= TRIÁNGULO LARGO ================= */}
      {layout.height > 0 && (
        <Svg
          pointerEvents="none"
          style={{
            position: "absolute",
            left: -width * 1.2,
            bottom: -layout.height * config.longTriangle.bottomRatio,
            width: width * config.longTriangle.widthRatio,
            height: layout.height * config.longTriangle.heightRatio,
            zIndex: 20,
            transform: [{ rotate: `${config.longTriangle.rotate}deg` }],
          }}
          viewBox="0 0 100 100"
        >
          <Polygon
            points="
              0,0
              400,10
              0,100
            "
            fill="#FFFFFF"
          />
        </Svg>
      )}

      {/* ================= IMAGEN CON CORTE ================= */}
      <View style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <View
          style={{ width: "100%", height: "100%" }}
          onLayout={(e) =>
            setLayout({
              width: e.nativeEvent.layout.width,
              height: e.nativeEvent.layout.height,
            })
          }
        >
          {layout.width > 0 && layout.height > 0 && (
            <Svg
              width={layout.width}
              height={layout.height}
              viewBox={`0 0 ${layout.width} ${layout.height}`}
            >
              <Defs>
                <ClipPath id="clip">
                  {(() => {
                    const angleRad =
                      (config.cutAngle * Math.PI) / 180;
                    const cut =
                      Math.tan(angleRad) * layout.width;

                    return (
                      <Polygon
                        points={`
                          0,0
                          ${layout.width},0
                          ${layout.width},${layout.height - cut}
                          0,${layout.height}
                        `}
                      />
                    );
                  })()}
                </ClipPath>
              </Defs>

              <SvgImage
                href={{
                  uri: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1600&q=80",
                }}
                x={-layout.width * 0.2}
                y={-layout.height * 0.15}
                width={layout.width * 1.45}
                height={layout.height * 1.35}
                preserveAspectRatio="xMidYMid slice"
                clipPath="url(#clip)"
              />
            </Svg>
          )}
        </View>
      </View>
    </View>
  );
}
