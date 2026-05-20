import { Car, Truck } from "lucide-react";
import { COLOR } from "../design";

interface CarPhotoProps {
  width?: number | string;
  height?: number;
  style?: React.CSSProperties;
  variant?: "car" | "truck" | "suv";
  bg?: string;
}

export function CarPhoto({ width = 200, height = 100, style, variant = "car", bg }: CarPhotoProps) {
  const iconSize = typeof height === "number" ? Math.round(height * 0.52) : 48;
  const background = bg ?? COLOR.brandSoft;
  const IconComp = variant === "truck" ? Truck : Car;

  return (
    <div style={{
      width, height,
      background,
      borderRadius: 10,
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden",
      flexShrink: 0,
      ...style,
    }}>
      <IconComp size={iconSize} color={COLOR.brand} strokeWidth={1.5} />
    </div>
  );
}
