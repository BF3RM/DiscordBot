const getEnvVariable = (env: string): string => {
  const value = process.env[env];
  if (!value) {
    throw new Error(`${env} was not defined!`);
  }
  return value;
};

/**
 * Gets the Discord Bot Token from the environment
 */
export const getBotToken = () => getEnvVariable("TOKEN");
