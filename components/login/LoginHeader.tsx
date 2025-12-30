import { useEffect, useRef, useState } from "react";
import { Animated, Easing, View, useWindowDimensions } from "react-native";
import Svg, {
  ClipPath,
  Defs,
  Polygon,
  Image as SvgImage,
} from "react-native-svg";

type DeviceType = "small" | "medium" | "large" | "xlarge";

const IMAGES = [
  require("../../assets/loginImages/img1.jpg"),
  require("../../assets/loginImages/img2.jpg"),
  require("../../assets/loginImages/img3.jpg"),
];

const IMAGE_LABELS = ["img1", "img2", "img3"];

const AnimatedSvgImage = Animated.createAnimatedComponent(SvgImage);

const getDeviceType = (width: number): DeviceType => {
  if (width <= 360) return "small";
  if (width <= 390) return "medium";
  if (width <= 430) return "large";
  return "xlarge";
};

const DESIGN_CONFIG: Record<
  DeviceType,
  {
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
  }
> = {
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
    headerHeightRatio: 0.9,
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

  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);

  // Index refs to avoid stale closures in animation callbacks
  const currentIndexRef = useRef(0);
  const nextIndexRef = useRef(1);

  // Mantener todas las imágenes montadas y animar sus opacidades individualmente
  const imageOpacitiesRef = useRef(
    IMAGES.map((_, i) => new Animated.Value(i === 0 ? 1 : 0))
  );
  const imageOpacities = imageOpacitiesRef.current;

  // Refs para limitar el spam de logs de opacidad (por ciclo)
  const lastCurrentOpacityLogRef = useRef(0);
  const lastNextOpacityLogRef = useRef(0);

  const deviceType = getDeviceType(width);
  const config = DESIGN_CONFIG[deviceType];
  const HEADER_HEIGHT = width * config.headerHeightRatio;

  // Debug básico de montaje/desmontaje
  useEffect(() => {
    console.log('[LoginHeader] montaje. índiceActual', currentIndexRef.current, 'índiceSiguiente', nextIndexRef.current);
    return () => {
      console.log('[LoginHeader] desmontaje');
    };
  }, []);

  // Logs de cambio de índices deshabilitados para evitar confusión de "recarga"

  useEffect(() => {
    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout>;

    const animate = () => {
      if (!isMounted) return;

      // Precompute next index (solo ref, sin setState para evitar re-render)
      const preNext = (currentIndexRef.current + 1) % IMAGES.length;
      console.log('[LoginHeader] ciclo de animación. índiceActualRef', currentIndexRef.current, 'índiceSiguienteRef', nextIndexRef.current, 'preNext', preNext);
      if (nextIndexRef.current !== preNext) {
        nextIndexRef.current = preNext;
        console.log('[LoginHeader] estableciendo índiceSiguiente a preNext', preNext, '->', IMAGE_LABELS[preNext]);
      }

      // Crossfade: actual 1->0, siguiente 0->1 with easing
      console.log('[LoginHeader] iniciando crossfade de', IMAGE_LABELS[currentIndexRef.current], 'a', IMAGE_LABELS[nextIndexRef.current]);

      // listeners temporales de opacidad para este ciclo
      const curIdx = currentIndexRef.current;
      const nxtIdx = nextIndexRef.current;
      const id1 = imageOpacities[curIdx].addListener(({ value }) => {
        const now = Date.now();
        if (now - lastCurrentOpacityLogRef.current > 120 || value === 0 || value === 1) {
          lastCurrentOpacityLogRef.current = now;
          console.log('[LoginHeader] opacidadActual', value);
        }
      });
      const id2 = imageOpacities[nxtIdx].addListener(({ value }) => {
        const now = Date.now();
        if (now - lastNextOpacityLogRef.current > 120 || value === 0 || value === 1) {
          lastNextOpacityLogRef.current = now;
          console.log('[LoginHeader] opacidadSiguiente', value);
        }
      });

      Animated.parallel([
        Animated.timing(imageOpacities[curIdx], {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(imageOpacities[nxtIdx], {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
      ]).start(() => {
        if (!isMounted) return;

        // limpiar listeners temporales de este ciclo
        imageOpacities[curIdx].removeListener(id1);
        imageOpacities[nxtIdx].removeListener(id2);

        // Promote next to current (solo refs, sin state updates para evitar re-render)
        const newCurrent = nextIndexRef.current;
        console.log('[LoginHeader] crossfade completo. nuevoActual', newCurrent, '->', IMAGE_LABELS[newCurrent]);
        currentIndexRef.current = newCurrent;

        // Prepare upcoming next
        const newNext = (newCurrent + 1) % IMAGES.length;
        console.log('[LoginHeader] preparar próximo siguiente', newNext, '->', IMAGE_LABELS[newNext]);
        nextIndexRef.current = newNext;

        // Asegurar que la próxima imagen esté oculta (debe estar ya en 0)
        imageOpacities[newNext].setValue(0);

        // Pause before next cycle
        console.log('[LoginHeader] programar próximo ciclo en 3500ms');
        timeoutId = setTimeout(animate, 3500);
      });
    };

    // Start after initial display
    timeoutId = setTimeout(animate, 3000);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <View
      style={{ height: HEADER_HEIGHT, width: "100%", position: "relative" }}
    >
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
          <Polygon points="100,100 50,0 100,45" fill="#FFFFFF" />
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
          <Polygon points="0,0 400,10 0,100" fill="#FFFFFF" />
        </Svg>
      )}

      {/* ================= IMAGEN CON CORTE + FADE ================= */}
      <View style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <View
          style={{ width: "100%", height: "100%" }}
          onLayout={(e) => {
            const w = e.nativeEvent.layout.width;
            const h = e.nativeEvent.layout.height;
            console.log('[LoginHeader] establecer layout', w, h);
            setLayout({ width: w, height: h });
          }}
        >
          {layout.width > 0 && (
            <Svg width={layout.width} height={layout.height}>
              <Defs>
                <ClipPath id="clip">
                  <Polygon
                    points={`
          0,0
          ${layout.width},0
          ${layout.width},
          ${
            layout.height -
            Math.tan((config.cutAngle * Math.PI) / 180) * layout.width
          }
          0,${layout.height}
        `}
                  />
                </ClipPath>
              </Defs>

              {/* Renderizar todas las imágenes en orden fijo - las opacidades controlan visibilidad */}
              {IMAGES.map((src, i) => (
                <AnimatedSvgImage
                  key={IMAGE_LABELS[i]}
                  href={src}
                  width={layout.width * 1.45}
                  height={layout.height * 1.35}
                  x={-layout.width * 0.2}
                  y={-layout.height * 0.15}
                  preserveAspectRatio="xMidYMid slice"
                  clipPath="url(#clip)"
                  opacity={imageOpacities[i]}
                />
              ))}
            </Svg>
          )}
        </View>
      </View>
    </View>
  );
}
