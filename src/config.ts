export const getEnvVariable = (
  env: string,
  fallback?: string
): string | undefined => {
  const value = process.env[env];
  if (!value) {
    return fallback;
  }

  return value;
};

export const getRequiredEnvVariable = (
  env: string,
  fallback?: string
): string => {
  const value = getEnvVariable(env, fallback);
  if (!value) {
    throw new Error(`${env} was not defined!`);
  }

  return value;
};

/**
 * Gets the Discord Bot Token from the environment
 */
export const getBotToken = () => getRequiredEnvVariable("TOKEN");

export const getDatabaseHost = () =>
  getRequiredEnvVariable("DB_HOST", "localhost");
export const getDatabasePort = () =>
  parseInt(getRequiredEnvVariable("DB_PORT", "5432"));
export const getDatabaseName = () => getRequiredEnvVariable("DB_NAME");
export const getDatabaseUsername = () => getRequiredEnvVariable("DB_USERNAME");
export const getDatabasePassword = () => getRequiredEnvVariable("DB_PASSWORD");

export const getHeraEndpoint = () => getRequiredEnvVariable("HERA_ENDPOINT");

export const getGuildId = () => getRequiredEnvVariable("GUILD_ID");
export const getGeneralChannelId = () =>
  getRequiredEnvVariable("GENERAL_CHANNEL_ID");

export const getSuggestionChannelId = () =>
  getRequiredEnvVariable("SUGGESTION_CHANNEL_ID");
export const getSuggestionResultChannelId = () =>
  getRequiredEnvVariable("SUGGESTION_RESULT_CHANNEL_ID");
export const getManagementRoleId = () =>
  getRequiredEnvVariable("MANAGEMENT_ROLE_ID");
export const getSupportRoleId = () => getRequiredEnvVariable("SUPPORT_ROLE_ID");

export const getServerListChannelId = () =>
  getRequiredEnvVariable("SERVER_LIST_CHANNEL_ID");
export const getServerListScheduleRule = () =>
  getEnvVariable("SERVER_LIST_SCHEDULE_RULE");

export const getCommunityEventRoleId = () =>
  getRequiredEnvVariable("COMMUNITY_EVENT_ROLE_ID");
export const getCommunityEventChannelId = () =>
  getRequiredEnvVariable("COMMUNITY_EVENT_CHANNEL_ID");
export const getSundayEventScheduleRule = () =>
  getEnvVariable("SUNDAY_EVENT_SCHEDULE_RULE");
export const getFridayEventScheduleRule = () =>
  getEnvVariable("FRIDAY_EVENT_SCHEDULE_RULE");
