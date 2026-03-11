import * as React from "react"
import Svg, { Path } from "react-native-svg"

function SearchIcon(props: any) {
  return (
    <Svg
      id="Outline"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      {...props}
    >
      <Path
        d="M506.23 476.02l-127.3-127.3c74.7-91.4 61.2-226-30.2-300.7-91.4-74.7-226-61.2-300.7 30.2-74.7 91.4-61.2 226 30.2 300.7 78.7 64.3 191.8 64.3 270.5 0l127.3 127.3c8.5 8.2 22 8 30.2-.5 8-8.3 8-21.4 0-29.6v-.1zm-292.4-91.6c-94.3 0-170.7-76.4-170.7-170.7s76.4-170.7 170.7-170.7 170.7 76.4 170.7 170.7c-.1 94.2-76.5 170.6-170.7 170.7z"
        fill="#2957a5"
      />
    </Svg>
  )
}

export default SearchIcon
