export const getEnvVariable = (env: string, fallback?: string): string => {
  const value = process.env[env];
  if (!value) {
    if (!fallback) throw new Error(`${env} was not defined!`);
    return fallback;
  }

  return value;
};

/**
 * Gets the Discord Bot Token from the environment
 */
export const getBotToken = () => getEnvVariable("TOKEN");

export const getDatabaseHost = () => getEnvVariable("DB_HOST", "localhost");
export const getDatabasePort = () =>
  parseInt(getEnvVariable("DB_PORT", "5432"));
export const getDatabaseName = () => getEnvVariable("DB_NAME");
export const getDatabaseUsername = () => getEnvVariable("DB_USERNAME");
export const getDatabasePassword = () => getEnvVariable("DB_PASSWORD");

export const getHeraEndpoint = () => getEnvVariable("HERA_ENDPOINT");
