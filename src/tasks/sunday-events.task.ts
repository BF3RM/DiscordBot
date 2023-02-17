import dayjs from "dayjs";
import {
  GuildScheduledEventEntityType,
  GuildScheduledEventManager,
  GuildScheduledEventPrivacyLevel,
} from "discord.js";

import {
  getCommunityEventChannelId,
  getCommunityEventRoleId,
  getGuildId,
} from "../config";
import { getClientInstance } from "../core";
import { LoggerFactory } from "../logger.factory";
import { ScheduleJob } from "../services";
import { fetchTextChannel } from "../utils";

const logger = LoggerFactory.getLogger("ServerEventsScheduleJob");

const eventName = "Reality Mod Sundays";
const eventDescription =
  "UKF and BKY invite you to the weekly Sunday Reality Mod event to play with the rest of the community. Everyone is invited to join!";

export class SundayEventScheduleJob implements ScheduleJob {
  async execute() {
    const client = getClientInstance();

    const guild = client.guilds.cache.get(getGuildId());
    if (!guild) {
      logger.error(
        "Failed to find guild %s, can not create event",
        getGuildId()
      );
      return;
    }

    await this.createEvent(guild.scheduledEvents);
  }

  async createEvent(eventManager: GuildScheduledEventManager) {
    const existingEvent = eventManager.cache.find(
      (it) => it.creator === eventManager.client.user && it.name === eventName
    );
    if (existingEvent) {
      logger.info("Found existing sunday event %s", existingEvent.id);
      return;
    }

    // in dayjs Sunday is the first day of the week...weird, okay lets work around it
    // First we go to the next week
    // Then we set the day to 0 which is Sunday, not Monday ;)
    // And set the time to 19:00:00
    const sundayStartDate = dayjs()
      .add(1, "week")
      .day(0)
      .hour(19)
      .minute(0)
      .second(0);
    const sundayEndDate = sundayStartDate.add(4, "hour");

    const createdEvent = await eventManager.create({
      name: eventName,
      description: eventDescription,
      scheduledStartTime: sundayStartDate.toDate(),
      scheduledEndTime: sundayEndDate.toDate(),
      privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
      entityType: GuildScheduledEventEntityType.External,
      entityMetadata: {
        location: "UKF RealityMod Server",
      },
    });
    logger.info(
      "Created sunday event %s, which is scheduled at %s",
      createdEvent.id,
      sundayStartDate
    );

    const eventChannel = await fetchTextChannel(
      getClientInstance(),
      getCommunityEventChannelId()
    );
    await eventChannel.send({
      content: `<@&${getCommunityEventRoleId()}> ${createdEvent.url}`,
    });
  }
}
