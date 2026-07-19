import WeatherIcon from "./WeatherIcon";
import { LucideProps } from "lucide-react";

interface AnimatedWeatherIconProps extends LucideProps {
  name: string;
}

/**
 * True path-morphing between arbitrary icon shapes isn't practical
 * with a standard icon set (each icon is an unrelated path). This
 * gets the same "the icon changes as if it's alive" feel cheaply:
 * keying the element on `name` makes React remount it whenever the
 * condition changes, and the remount plays a quick scale+rotate+fade
 * entrance (icon-morph-in, globals.css) instead of just popping in.
 */
export default function AnimatedWeatherIcon({ name, className, ...rest }: AnimatedWeatherIconProps) {
  return (
    <WeatherIcon
      key={name}
      name={name}
      className={`animate-[icon-morph-in_420ms_ease-out] ${className ?? ""}`}
      {...rest}
    />
  );
}