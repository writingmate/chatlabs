// Get an environment variable as an integer, with a default value
function getEnvInt(varName: string, def: number) {
  if (varName in process.env) {
    return parseInt(process.env[varName] + "")
  }

  return def
}
// Get an environment variable as a string, with a default value
function getEnvString(varName: string, def: string) {
  if (varName in process.env) {
    return process.env[varName] + ""
  }

  return def
}

// Get an environment variable as a boolean, with a default value
function getEnvBool(varName: string, def: boolean) {
  if (varName in process.env) {
    return process.env[varName] === "true"
  }

  return def
}

export { getEnvInt, getEnvString, getEnvBool }
