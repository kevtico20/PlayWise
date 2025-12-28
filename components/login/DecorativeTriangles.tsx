import { View } from "react-native";

export default function DecorativeTriangles() {
  return (
    <>
      {/* TRIÁNGULO IZQUIERDO */}
      <View className="absolute bottom-0 left-0 z-10">
        <View className="relative">
          {/* Exterior */}
          <View
            className="w-0 h-0 border-l-[80px] border-r-[80px] border-b-[140px]"
            style={{
              borderLeftColor: "transparent",
              borderRightColor: "transparent",
              borderBottomColor: "#2a3a8f",
              opacity: 0.3,
            }}
          />
          {/* Medio */}
          <View
            className="absolute bottom-0 left-[7px] w-0 h-0 border-l-[65px] border-r-[65px] border-b-[110px]"
            style={{
              borderLeftColor: "transparent",
              borderRightColor: "transparent",
              borderBottomColor: "#1a2f7f",
              opacity: 0.4,
            }}
          />
          {/* Interior */}
          <View
            className="absolute bottom-0 left-[15px] w-0 h-0 border-l-[50px] border-r-[50px] border-b-[85px]"
            style={{
              borderLeftColor: "transparent",
              borderRightColor: "transparent",
              borderBottomColor: "#3a4f9f",
              opacity: 0.5,
            }}
          />
        </View>
      </View>

      {/* TRIÁNGULO DERECHO */}
      <View className="absolute bottom-0 right-0 z-10">
        <View className="relative">
          {/* Exterior */}
          <View
            className="w-0 h-0 border-l-[80px] border-r-[80px] border-b-[140px]"
            style={{
              borderLeftColor: "transparent",
              borderRightColor: "transparent",
              borderBottomColor: "#2a3a8f",
              opacity: 0.3,
            }}
          />
          {/* Medio */}
          <View
            className="absolute bottom-0 right-[7px] w-0 h-0 border-l-[65px] border-r-[65px] border-b-[110px]"
            style={{
              borderLeftColor: "transparent",
              borderRightColor: "transparent",
              borderBottomColor: "#1a2f7f",
              opacity: 0.4,
            }}
          />
          {/* Interior */}
          <View
            className="absolute bottom-0 right-[15px] w-0 h-0 border-l-[50px] border-r-[50px] border-b-[85px]"
            style={{
              borderLeftColor: "transparent",
              borderRightColor: "transparent",
              borderBottomColor: "#3a4f9f",
              opacity: 0.5,
            }}
          />
        </View>
      </View>
    </>
  );
}
