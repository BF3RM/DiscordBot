import pino from "pino";

const loggerInstance = pino({
  level: process.env.LOGGER_LEVEL || "info",
  ...(process.env.LOGGER_PRETTY && {
    transport: {
      target: "pino-pretty",
      options: {
        messageFormat: "({service}) {msg}",
        ignore: "hostname,service",
      },
    },
  }),
});

export class LoggerFactory {
  static getLogger(name: string) {
    return loggerInstance.child({ service: name });
  }
}
