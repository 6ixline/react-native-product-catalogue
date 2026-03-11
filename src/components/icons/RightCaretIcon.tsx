import * as React from "react"
import Svg, { Path } from "react-native-svg"

function RightCaretIcon(props : any) {
  return (
    <Svg
      id="Outline"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      {...props}
    >
      <Path
        d="M334.4 210.8l-97.9-97.9c-8.3-8.3-21.8-8.3-30.1 0-8.4 8.3-8.4 21.8-.1 30.2l.1.1 98.1 97.7c8.4 8.3 8.4 21.8.1 30.2l-.1.1-98.1 97.7c-8.4 8.3-8.4 21.8-.1 30.2 8.3 8.4 21.8 8.4 30.2.1l97.9-97.9c25-25 25-65.5 0-90.5z"
        fill="#2957a5"
      />
    </Svg>
  )
}

export default RightCaretIcon
