import * as React from "react"
import Svg, { Path } from "react-native-svg"

function BackButtonIcon(props : any) {
  return (
    <Svg
      id="Outline"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      {...props}
    >
      <Path
        d="M24.6 308.3l82.6 83.4c8.3 8.4 21.8 8.4 30.2.1l.1-.1c8.4-8.3 8.4-21.8.1-30.2l-.1-.1L61.6 285h435c11.8 0 21.3-9.6 21.3-21.3 0-11.8-9.6-21.3-21.3-21.3H60.3l77.2-77.2c7.9-8.2 7.9-21.2 0-29.4-8.3-8.4-21.8-8.4-30.2-.1l-.1.1-82.6 82.1c-25 25-25 65.5 0 90.5v-.1z"
        fill="#2957a5"
      />
    </Svg>
  )
}

export default BackButtonIcon
