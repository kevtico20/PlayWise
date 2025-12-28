import { View, useWindowDimensions } from "react-native";
import Svg, {
  Defs,
  ClipPath,
  Image as SvgImage,
  Polygon,
} from "react-native-svg";
import { useState } from "react";

const getDeviceType = (width:number) => {
  if (width <= 360) return "small";
  if (width <= 390) return "medium";
  if (width <= 430) return "large";
  return "xlarge";
};

const DESIGN_CONFIG = {
  small: {
    headerHeightRatio: 1.05,
    cutAngle: 18,
    lineBottomRatio: 0.28,
    triangleWidthRatio: 0.30,
    triangleHeightRatio: 0.42,
  },
  medium: {
    headerHeightRatio: 0.95,
    cutAngle: 20,
    lineBottomRatio: 0.32,
    triangleWidthRatio: 0.28,
    triangleHeightRatio: 0.45,
  },
  large: {
    headerHeightRatio: 0.9,
    cutAngle: 22,
    lineBottomRatio: 0.34,
    triangleWidthRatio: 0.26,
    triangleHeightRatio: 0.48,
  },
  xlarge: {
    headerHeightRatio: 0.85,
    cutAngle: 24,
    lineBottomRatio: 0.42,
    triangleWidthRatio: 0.24,
    triangleHeightRatio: 0.5,
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
            width: layout.width * 3.69,
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
            right: -layout.width * 0.05,
            bottom: layout.height * 0.05,
            width: layout.width * config.triangleWidthRatio,
            height: layout.height * config.triangleHeightRatio,
            zIndex: 20,
          }}
          viewBox="0 0 100 100"
        >
          <Polygon
            points="100,100 35,0 100,0"
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
                    const angleRad = (config.cutAngle * Math.PI) / 180;
                    const cut = Math.tan(angleRad) * layout.width;

                    return (
                      <Polygon
                        points={`
                          0,0
                          ${layout.width},0
                          ${layout.width},${layout.height - cut * 1}
                          0,${layout.height * 1}
                        `}
                      />
                    );
                  })()}
                </ClipPath>
              </Defs>

              <SvgImage
                href={{
                  uri:
                    "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1600&q=80",
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
