import { FC } from "react"

interface ChatbotUISVGProps {
  theme: "dark" | "light"
  scale?: number
}

export const ChatbotUISVG: FC<ChatbotUISVGProps> = ({ theme, scale = 1 }) => {
  return (
    <svg
      width={141 * scale}
      height={140 * scale}
      viewBox="0 0 141 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M103.291 100.215C94.1386 106.893 82.8618 110.833 70.6647 110.833C58.4682 110.833 47.192 106.893 38.0394 100.217L32.7969 113.92C31.059 118.463 32.6337 123.68 36.9427 125.936C46.9681 131.185 58.4558 134.166 70.6656 134.166C82.8754 134.166 94.3631 131.185 104.389 125.936C108.697 123.68 110.272 118.463 108.534 113.92L103.291 100.215Z"
        fill={theme == "dark" ? "white" : "black"}
        fillOpacity="0.24"
      />
      <g filter="url(#filter0_ii_3335_7189)">
        <g clipPath="url(#clip0_3335_7189)">
          <rect
            x="21.0833"
            y="5.83333"
            width="99.1667"
            height="99.1667"
            rx="49.5833"
            fill={theme == "dark" ? "white" : "black"}
            fillOpacity="0.24"
          />
          <g opacity="0.8" filter="url(#filter1_f_3335_7189)">
            <ellipse
              cx="94.3615"
              cy="93.1897"
              rx="94.3615"
              ry="93.1897"
              transform="matrix(-0.288205 -0.957569 0.936518 -0.35062 0.613281 121.618)"
              fill={theme == "dark" ? "white" : "black"}
              fillOpacity="0.04"
            />
          </g>
          <g opacity="0.8" filter="url(#filter2_f_3335_7189)">
            <ellipse
              cx="80.0698"
              cy="77.5603"
              rx="80.0698"
              ry="77.5603"
              transform="matrix(-0.482888 -0.875682 0.798496 -0.602 9.14502 120.365)"
              fill={theme == "dark" ? "white" : "black"}
              fillOpacity="0.16"
            />
          </g>
          <g opacity="0.8" filter="url(#filter3_f_3335_7189)">
            <path
              d="M162.342 -48.1812C199.232 -7.62198 141.624 160.514 127.074 146.746C118.198 138.347 115.183 77.985 87.8189 48.2513C70.3259 29.2437 33.0061 35.6865 10.0976 33.9832C-48.6469 29.6157 125.145 -89.0788 162.342 -48.1812Z"
              fill={theme == "dark" ? "white" : "black"}
              fillOpacity="0.16"
            />
          </g>
        </g>
      </g>
      <path
        d="M100.485 9.17629C101.069 6.81083 104.431 6.81083 105.015 9.1763L108.187 22.0237C108.395 22.8651 109.052 23.522 109.893 23.7298L122.74 26.9013C125.106 27.4853 125.106 30.848 122.74 31.432L109.893 34.6036C109.052 34.8113 108.395 35.4683 108.187 36.3097L105.015 49.157C104.431 51.5225 101.069 51.5225 100.485 49.157L97.313 36.3097C97.1053 35.4683 96.4483 34.8113 95.6069 34.6036L82.7595 31.432C80.3941 30.848 80.3941 27.4853 82.7596 26.9013L95.6069 23.7298C96.4483 23.522 97.1053 22.8651 97.313 22.0237L100.485 9.17629Z"
        fill={theme == "dark" ? "white" : "black"}
      />
      <path
        d="M72.2241 46.3391C72.5744 44.9198 74.5921 44.9198 74.9424 46.3391L76.8454 54.0475C76.97 54.5524 77.3642 54.9466 77.8691 55.0712L85.5775 56.9742C86.9968 57.3245 86.9968 59.3422 85.5775 59.6925L77.8691 61.5955C77.3642 61.7201 76.97 62.1143 76.8454 62.6192L74.9424 70.3276C74.5921 71.7469 72.5744 71.7468 72.2241 70.3276L70.3211 62.6191C70.1965 62.1143 69.8023 61.7201 69.2974 61.5955L61.589 59.6925C60.1697 59.3422 60.1698 57.3245 61.589 56.9741L69.2974 55.0712C69.8023 54.9466 70.1965 54.5524 70.3211 54.0475L72.2241 46.3391Z"
        fill={theme == "dark" ? "white" : "black"}
      />
      <defs>
        <filter
          id="filter0_ii_3335_7189"
          x="21.0833"
          y="5.83333"
          width="99.1667"
          height="99.1667"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="8.26389" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.16 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect1_innerShadow_3335_7189"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="8.26389" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.24 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_innerShadow_3335_7189"
            result="effect2_innerShadow_3335_7189"
          />
        </filter>
        <filter
          id="filter1_f_3335_7189"
          x="-76.5745"
          y="-143.352"
          width="274.532"
          height="283.878"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="22.9145"
            result="effect1_foregroundBlur_3335_7189"
          />
        </filter>
        <filter
          id="filter2_f_3335_7189"
          x="-86.4371"
          y="-126.519"
          width="237.698"
          height="260.155"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="22.9145"
            result="effect1_foregroundBlur_3335_7189"
          />
        </filter>
        <filter
          id="filter3_f_3335_7189"
          x="-47.7469"
          y="-102.57"
          width="268.055"
          height="295.944"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="22.9145"
            result="effect1_foregroundBlur_3335_7189"
          />
        </filter>
        <clipPath id="clip0_3335_7189">
          <rect
            x="21.0833"
            y="5.83333"
            width="99.1667"
            height="99.1667"
            rx="49.5833"
            fill="white"
          />
        </clipPath>
      </defs>
    </svg>
  )

  return (
    <svg
      width={210 * scale}
      height={210 * scale}
      viewBox="0 0 210 210"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="210" height="210" rx="105" fill="#6C46FF" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M138.879 136.377C129.375 143.311 117.665 147.403 104.999 147.403C92.3329 147.403 80.6227 143.311 71.1181 136.377L65.6736 150.609C63.8688 155.326 65.5041 160.744 69.9788 163.087C80.3898 168.538 92.3193 171.634 104.999 171.634C117.678 171.634 129.608 168.538 140.019 163.087C144.493 160.744 146.129 155.326 144.324 150.609L138.879 136.377Z"
        fill="white"
        fillOpacity="0.5"
      />
      <circle
        cx="105.009"
        cy="89.8548"
        r="51.4904"
        fill="white"
        fillOpacity="0.5"
      />
      <path
        d="M135.974 41.8358C136.581 39.3794 140.073 39.3794 140.679 41.8358L143.973 55.1773C144.188 56.0511 144.871 56.7333 145.744 56.949L159.086 60.2426C161.542 60.849 161.542 64.3411 159.086 64.9475L145.744 68.2411C144.871 68.4568 144.188 69.139 143.973 70.0128L140.679 83.3543C140.073 85.8108 136.581 85.8108 135.974 83.3543L132.681 70.0128C132.465 69.139 131.783 68.4568 130.909 68.2411L117.567 64.9475C115.111 64.3411 115.111 60.849 117.567 60.2426L130.909 56.949C131.783 56.7333 132.465 56.0511 132.681 55.1773L135.974 41.8358Z"
        fill="white"
      />
      <path
        d="M106.627 80.4281C106.99 78.9542 109.086 78.9542 109.449 80.4281L111.426 88.433C111.555 88.9572 111.964 89.3666 112.489 89.496L120.494 91.4721C121.967 91.836 121.967 93.9312 120.494 94.2951L112.489 96.2712C111.964 96.4006 111.555 96.81 111.426 97.3342L109.449 105.339C109.086 106.813 106.99 106.813 106.627 105.339L104.65 97.3342C104.521 96.81 104.112 96.4006 103.587 96.2712L95.5825 94.2951C94.1086 93.9312 94.1086 91.836 95.5825 91.4721L103.587 89.496C104.112 89.3666 104.521 88.9572 104.65 88.433L106.627 80.4281Z"
        fill="white"
      />
    </svg>
  )
  return (
    <svg
      width={189 * scale}
      height={194 * scale}
      viewBox="0 0 189 194"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="12.5"
        y="12.5"
        width="164"
        height="127"
        rx="37.5"
        fill={`${theme === "dark" ? "#000" : "#fff"}`}
        stroke={`${theme === "dark" ? "#fff" : "#000"}`}
        strokeWidth="25"
      />
      <path
        d="M72.7643 143.457C77.2953 143.443 79.508 148.98 76.2146 152.092L42.7738 183.69C39.5361 186.749 34.2157 184.366 34.3419 179.914L35.2341 148.422C35.3106 145.723 37.5158 143.572 40.2158 143.564L72.7643 143.457Z"
        fill={`${theme === "dark" ? "#fff" : "#000"}`}
      />
      <path
        d="M59.6722 51.6H75.5122V84C75.5122 86.016 76.0162 87.672 77.0242 88.968C78.0802 90.216 79.6882 90.84 81.8482 90.84C84.0082 90.84 85.5922 90.216 86.6002 88.968C87.6562 87.672 88.1842 86.016 88.1842 84V51.6H104.024V85.44C104.024 89.04 103.424 92.088 102.224 94.584C101.072 97.032 99.4642 99.024 97.4002 100.56C95.3362 102.048 92.9602 103.128 90.2722 103.8C87.6322 104.52 84.8242 104.88 81.8482 104.88C78.8722 104.88 76.0402 104.52 73.3522 103.8C70.7122 103.128 68.3602 102.048 66.2962 100.56C64.2322 99.024 62.6002 97.032 61.4002 94.584C60.2482 92.088 59.6722 89.04 59.6722 85.44V51.6ZM113.751 51.6H129.951V102H113.751V51.6Z"
        fill={`${theme === "dark" ? "#fff" : "#000"}`}
      />
    </svg>
  )
}
