import * as React from "react"
import Svg, { Path } from "react-native-svg"

interface SavedIconProps {
  width?: number;
  height?: number;
  fill?: string;
  isFilled?: boolean; 
}

function SavedIcon({ width = 24, height = 24, fill = "#2957a5", isFilled = false, ...props }: SavedIconProps) {
  if (isFilled) {
    return (
      <Svg
        viewBox="0 0 512 512"
        width={width}
        height={height}
        {...props}
      >
        <Path
          d="M429.5 511.96c-15.9 0-31.2-6.5-42.4-17.8l-131.2-130.4-131.2 130.5c-17.2 17.5-43.4 22.6-66 13-22.8-9.2-37.7-31.4-37.4-56v-344.6C21.3 47.76 69.1-.04 128-.04h256c58.9 0 106.7 47.8 106.7 106.7v344.6c.2 24.6-14.6 46.8-37.4 56-7.5 3.1-15.6 4.8-23.7 4.7h-.1z"
          fill={fill}
        />
      </Svg>
    )
  }

  return (
    <Svg
      viewBox="0 0 512 512"
      width={width}
      height={height}
      {...props}
    >
      <Path
        d="M429.5 511.96c-15.9 0-31.2-6.5-42.4-17.8l-131.2-130.4-131.2 130.5c-17.2 17.5-43.4 22.6-66 13-22.8-9.2-37.7-31.4-37.4-56v-344.6C21.3 47.76 69.1-.04 128-.04h256c58.9 0 106.7 47.8 106.7 106.7v344.6c.2 24.6-14.6 46.8-37.4 56-7.5 3.1-15.6 4.8-23.7 4.7h-.1zM128 42.66c-35.3 0-64 28.7-64 64v344.6c0 9.9 8 18 17.9 18 4.8 0 9.3-1.9 12.7-5.2L241 318.56c8.3-8.3 21.8-8.3 30.1 0l146.2 145.5c7 7 18.4 7 25.4 0 3.4-3.4 5.2-7.9 5.2-12.7v-344.6c0-35.3-28.7-64-64-64h-256l.1-.1z"
        fill={fill}
      />
    </Svg>
  )
}

export default SavedIcon