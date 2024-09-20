import React from "react"

export const AnimatedChatbotUISVG = ({ size = 200 }) => {
  return (
    <svg
      className="animated-chatbot-ui" // Added unique class
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        fillRule: "nonzero",
        clipRule: "evenodd",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }}
    >
      <style>
        {`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          .animated-chatbot-ui path {
            animation: pulse 2s infinite;
            transform-origin: center;
            animation-timing-function: ease-in-out;
          }
          .animated-chatbot-ui path:nth-child(1) { animation-delay: 0s; }
          .animated-chatbot-ui path:nth-child(2) { animation-delay: 0.3s; }
          .animated-chatbot-ui path:nth-child(3) { animation-delay: 0.6s; }
          .animated-chatbot-ui path:nth-child(4) { animation-delay: 0.9s; }
          .animated-chatbot-ui path:nth-child(5) { animation-delay: 1.2s; }
          .animated-chatbot-ui path:nth-child(6) { animation-delay: 1.5s; }
        `}
      </style>
      <g stroke="#595959" strokeLinecap="butt" strokeWidth="3.24">
        <path
          d="M120.582 108.612a10.001 10.001 0 0 1-4.857-8.504l-.379-52.828c-.056-7.756 8.357-12.62 15.051-8.702l25.124 14.707a9.999 9.999 0 0 1 4.948 8.612l.099 53.019c.014 7.781-8.471 12.596-15.144 8.595l-24.842-14.899Z"
          fill="#fff"
        />
        <path
          d="M105.697 142.805a9.998 9.998 0 0 1-4.856-8.504l-.38-52.828c-.056-7.756 8.358-12.62 15.052-8.702l25.123 14.707a9.999 9.999 0 0 1 4.948 8.612l.099 53.019c.014 7.781-8.471 12.596-15.143 8.595l-24.843-14.899Z"
          fill="#fff"
        />
        <path
          d="M90.143 112.549a10 10 0 0 1-4.856-8.504l-.38-52.828c-.056-7.757 8.357-12.62 15.052-8.702l25.123 14.706a9.999 9.999 0 0 1 4.948 8.612l.099 53.02c.014 7.78-8.471 12.596-15.143 8.594l-24.843-14.898Z"
          fill="#fff"
        />
        <path
          d="M75.28 156.242a9.998 9.998 0 0 1-4.856-8.504l-.38-52.828c-.055-7.756 8.358-12.62 15.052-8.702l25.123 14.707a10.002 10.002 0 0 1 4.949 8.611l.098 53.02c.015 7.78-8.471 12.596-15.143 8.595L75.28 156.242Z"
          fill="#fff"
        />
        <path
          d="M60.397 112.508a9.998 9.998 0 0 1-4.856-8.504l-.38-52.828c-.056-7.756 8.358-12.62 15.052-8.702l25.123 14.707a9.999 9.999 0 0 1 4.948 8.612l.099 53.019c.014 7.781-8.471 12.596-15.143 8.595l-24.843-14.899Z"
          fill="#ee86dc"
        />
        <path
          d="M44.762 146.701a9.998 9.998 0 0 1-4.857-8.504l-.38-52.828c-.055-7.756 8.358-12.62 15.052-8.702l25.124 14.707a10 10 0 0 1 4.948 8.612l.099 53.019c.014 7.781-8.471 12.596-15.144 8.595l-24.842-14.899Z"
          fill="#fff"
        />
      </g>
    </svg>
  )
}

export default AnimatedChatbotUISVG
