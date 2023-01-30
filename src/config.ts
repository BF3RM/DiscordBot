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

export const getSuggestionChannelId = () =>
  getEnvVariable("SUGGESTION_CHANNEL_ID");
export const getSuggestionResultChannelId = () =>
  getEnvVariable("SUGGESTION_RESULT_CHANNEL_ID");
export const getManagementRoleId = () => getEnvVariable("MANAGEMENT_ROLE_ID");
export const getSupportRoleId = () => getEnvVariable("SUPPORT_ROLE_ID");

export const getServerListChannelId = () =>
  getEnvVariable("SERVER_LIST_CHANNEL_ID");
export const getServerListScheduleRule = () =>
  getEnvVariable("SERVER_LIST_SCHEDULE_RULE", "*/5 * * * *");
