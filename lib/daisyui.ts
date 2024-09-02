// This code is a TypeScript port of the original DaisyUI theme generator.
// The original code is written in JavaScript and can be found at https://github.com/saadeghi/daisyui

const { oklch, interpolate, wcagContrast } = require("culori/require")

const colorNames = {
  primary: "--p",
  "primary-content": "--pc",

  secondary: "--s",
  "secondary-content": "--sc",

  accent: "--a",
  "accent-content": "--ac",

  neutral: "--n",
  "neutral-content": "--nc",

  "base-100": "--b1",
  "base-200": "--b2",
  "base-300": "--b3",
  "base-content": "--bc",

  info: "--in",
  "info-content": "--inc",

  success: "--su",
  "success-content": "--suc",

  warning: "--wa",
  "warning-content": "--wac",

  error: "--er",
  "error-content": "--erc"
}

const fontFamily = {
  fontFamily: "font-family",
  fontSize: "font-size",
  lineHeight: "line-height"
}

const themeDefaults = {
  variables: {
    "--rounded-box": "1rem",
    "--rounded-btn": "0.5rem",
    "--rounded-badge": "1.9rem",
    "--animation-btn": "0.25s",
    "--animation-input": ".2s",
    "--btn-focus-scale": "0.95",
    "--border-btn": "1px",
    "--tab-border": "1px",
    "--tab-radius": "0.5rem"
  }
}

const cutNumber = (number: number): number | false => {
  try {
    if (number) {
      return +number.toFixed(6)
    }
    return 0
  } catch (e) {
    // colorIsInvalid(number)
    return false
  }
}

export const daisyui = {
  isDark: (color: string): boolean => {
    try {
      if (wcagContrast(color, "black") < wcagContrast(color, "white")) {
        return true
      }
      return false
    } catch (e) {
      // colorIsInvalid(color)
      return false
    }
  },

  colorObjToString: (input: { l: number; c: number; h: number }): string => {
    const { l, c, h } = input
    // @ts-ignore
    return `${Number.parseFloat((cutNumber(l) * 100).toFixed(6))}% ${cutNumber(c)} ${cutNumber(h)}`
  },

  generateForegroundColorFrom: function (
    input: string,
    percentage: number = 0.8
  ): string | false {
    try {
      const result = interpolate(
        [input, this.isDark(input) ? "white" : "black"],
        "oklch"
      )(percentage)
      return this.colorObjToString(result)
    } catch (e) {
      // colorIsInvalid(input)
      return false
    }
  },

  generateDarkenColorFrom: function (
    input: string,
    percentage: number = 0.07
  ): string | false {
    try {
      const result = interpolate([input, "black"], "oklch")(percentage)
      return this.colorObjToString(result)
    } catch (e) {
      // colorIsInvalid(input)
      return false
    }
  },

  convertColorFormat: function (
    input: Record<string, any>
  ): Record<string, any> | string | false {
    if (typeof input !== "object" || input === null) {
      return input
    }

    const resultObj: Record<string, any> = {}

    for (const [rule, value] of Object.entries(input)) {
      if (Object.hasOwn(colorNames, rule)) {
        try {
          const colorObj = oklch(value)
          resultObj[colorNames[rule as keyof typeof colorNames]] =
            this.colorObjToString(colorObj)
        } catch (e) {
          // colorIsInvalid(value)
          return false
        }
      } else {
        resultObj[rule] = value
      }

      // auto generate base colors
      if (!Object.hasOwn(input, "base-100")) {
        resultObj["--b1"] = "100% 0 0"
      }
      if (!Object.hasOwn(input, "base-200")) {
        resultObj["--b2"] = this.generateDarkenColorFrom(
          input["base-100"],
          0.07
        )
      }
      if (!Object.hasOwn(input, "base-300")) {
        if (Object.hasOwn(input, "base-200")) {
          resultObj["--b3"] = this.generateDarkenColorFrom(
            input["base-200"],
            0.07
          )
        } else {
          resultObj["--b3"] = this.generateDarkenColorFrom(
            input["base-100"],
            0.14
          )
        }
      }

      // auto generate state colors

      if (!Object.hasOwn(input, "info")) {
        resultObj["--in"] = "72.06% 0.191 231.6"
      }
      if (!Object.hasOwn(input, "success")) {
        resultObj["--su"] = "64.8% 0.150 160"
      }
      if (!Object.hasOwn(input, "warning")) {
        resultObj["--wa"] = "84.71% 0.199 83.87"
      }
      if (!Object.hasOwn(input, "error")) {
        resultObj["--er"] = "71.76% 0.221 22.18"
      }

      // auto generate content colors
      if (!Object.hasOwn(input, "base-content")) {
        resultObj["--bc"] = this.generateForegroundColorFrom(
          input["base-100"],
          0.8
        )
      }
      if (!Object.hasOwn(input, "primary-content")) {
        resultObj["--pc"] = this.generateForegroundColorFrom(input.primary, 0.8)
      }
      if (!Object.hasOwn(input, "secondary-content")) {
        resultObj["--sc"] = this.generateForegroundColorFrom(
          input.secondary,
          0.8
        )
      }
      if (!Object.hasOwn(input, "accent-content")) {
        resultObj["--ac"] = this.generateForegroundColorFrom(input.accent, 0.8)
      }
      if (!Object.hasOwn(input, "neutral-content")) {
        resultObj["--nc"] = this.generateForegroundColorFrom(input.neutral, 0.8)
      }
      if (!Object.hasOwn(input, "info-content")) {
        if (Object.hasOwn(input, "info")) {
          resultObj["--inc"] = this.generateForegroundColorFrom(input.info, 0.8)
        } else {
          resultObj["--inc"] = "0% 0 0"
        }
      }
      if (!Object.hasOwn(input, "success-content")) {
        if (Object.hasOwn(input, "success")) {
          resultObj["--suc"] = this.generateForegroundColorFrom(
            input.success,
            0.8
          )
        } else {
          resultObj["--suc"] = "0% 0 0"
        }
      }
      if (!Object.hasOwn(input, "warning-content")) {
        if (Object.hasOwn(input, "warning")) {
          resultObj["--wac"] = this.generateForegroundColorFrom(
            input.warning,
            0.8
          )
        } else {
          resultObj["--wac"] = "0% 0 0"
        }
      }
      if (!Object.hasOwn(input, "error-content")) {
        if (Object.hasOwn(input, "error")) {
          resultObj["--erc"] = this.generateForegroundColorFrom(
            input.error,
            0.8
          )
        } else {
          resultObj["--erc"] = "0% 0 0"
        }
      }

      // add css variables if not exist
      for (const item of Object.entries(themeDefaults.variables)) {
        const [variable, value] = item
        if (!Object.hasOwn(input, variable)) {
          resultObj[variable] = value
        }
      }

      // add other custom styles
      if (!Object.hasOwn(colorNames, rule)) {
        resultObj[rule] = value
      }

      if (rule in fontFamily) {
        resultObj[fontFamily[rule as keyof typeof fontFamily]] =
          value + "!important"
      }
    }

    return resultObj
  },

  convertThemeToCSS: (input: Record<string, any>): string => {
    const colors = daisyui.convertColorFormat(input)
    return Object.entries(colors)
      .map(([key, value]) => `${key}: ${value}`)
      .join("; ")
  }
}
