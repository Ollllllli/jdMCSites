//@ts-check

class JDAPIError extends Error {}

class CacheManager {

  /** @private */
  #apiBaseUrl = "https://jdapi.olllli.workers.dev/";
  /** @type {Set<string>} */
  uuids = new Set();

  /** Ensure cache is up to date, and prepare properties. */
  async init() {
    const isUpdated = await this.versionCheck();
    if (!isUpdated.uuid) {
      await this.#updateUuidCache(isUpdated.serverUpdateTimestamp);
      console.log("UUIDs Updated");
    }
    /** @type {string[]} */
    const uuidsList = JSON.parse(sessionStorage.getItem("uuid") ?? "[]");
    for (const uuid of uuidsList)
      this.uuids.add(uuid);
    return isUpdated;
  }

  /** Wrapper function to `GET` API endpoint data.
   * @protected
   * @param {string} endpoint
   * @returns {Promise<string | never>} */
  async fetchAPI(endpoint) {
    // Fetch data from the API server.
    const response = await fetch(`${this.#apiBaseUrl}${endpoint}`);
    // If successful, return response body.
    if (response.status == 200)
      return await response.json();
    // If an API failure occured, throw an error up the chain using the response body.
    else {
      throw new JDAPIError(await response.text());
    }
  }

  /** Checks if StatsAPI's sessionStorage is up to date.
   * Returns whether stats and uuid are up to date,
   * and includes the API Server's own update timestamp.
   * @private
   * @returns {Promise<{advancements: boolean, player: boolean, stats: boolean, uuid: boolean, serverUpdateTimestamp: string}>} */
  async versionCheck() {
    const clientAdvancementsUpdateTimestamp = sessionStorage.getItem("meta.lastupdated:advancements");
    const clientPlayerUpdateTimestamp = sessionStorage.getItem("meta.lastupdated:player");
    const clientStatsUpdateTimestamp = sessionStorage.getItem("meta.lastupdated:stats");
    const clientUuidUpdateTimestamp = sessionStorage.getItem("meta.lastupdated:uuid");
    const serverUpdateTimestamp = await this.fetchAPI("meta/lastupdated");
    return {
      advancements: clientAdvancementsUpdateTimestamp === serverUpdateTimestamp,
      player: clientAdvancementsUpdateTimestamp === serverUpdateTimestamp,
      stats: clientStatsUpdateTimestamp === serverUpdateTimestamp,
      uuid: clientUuidUpdateTimestamp === serverUpdateTimestamp,
      serverUpdateTimestamp,
    };
  }

  /** Update the UUID Cache.
   * @private
   * @param {string} serverUpdateTimestamp */
  //@ts-ignore
  async #updateUuidCache(serverUpdateTimestamp) {
    const uuidsString = await this.fetchAPI("uuid");
    sessionStorage.setItem("uuid", uuidsString);
    sessionStorage.setItem("meta.lastupdated:uuid", serverUpdateTimestamp);
  }
}

/** Singleton class to manage Statistics from the API server. */
class StatsAPI extends CacheManager {

  /** @type {Map<string,any>} */
  stats = new Map();

  /** Ensure cache is up to date, and prepare properties. */
  async init() {
    const isUpdated = await super.init();
    if (!isUpdated.stats) {
      await this.#updateAllStatsCache(isUpdated.serverUpdateTimestamp)
      console.log("Stats Updated");
    }
    /** @type {string[]} */
    for (const uuid of this.uuids)
      this.stats.set(uuid, JSON.parse(sessionStorage.getItem(`stats:${uuid}`) ?? "{}")["stats"] ?? {});
    return isUpdated;
  }

  /** Return a Minecraft Stats Object for the given `uuid`.
   * @param {string} uuid
   * @param {string} namespace
   * @returns {number} */
  getNamespaceStat(namespace, uuid) {
    const uuidStats = this.stats.get(uuid);
    const namespaceKeys = namespace.split(":");
    return uuidStats[`minecraft:${namespaceKeys[0]}`][`minecraft:${namespaceKeys[1]}`];
  }

  /** Return an ordered object of UUIDs and their score for the `namespace` statistic.
   * @param {string} namespace
   * @returns {{[uuid: string]: number}} */
  getUUIDScores(namespace) {
      /** @type {{[uuid: string]: number}} */
      const statsObject = {};
      for (const uuid of this.uuids) {
        statsObject[uuid] = this.getNamespaceStat(namespace, uuid);
      }
      return statsObject;
  }

  /** Update the Stats Cache, storing a record per uuid.
   * @private
   * @param {string} serverUpdateTimestamp
   * @param {string} uuid */
  //@ts-ignore
  async #updateTargetStatsCache(serverUpdateTimestamp, uuid) {
    const stats = await this.fetchAPI(`stats/${uuid}`);
    sessionStorage.setItem(`stats:${uuid}`, stats);
    sessionStorage.setItem(`meta.lastupdated:stats.${uuid}`, serverUpdateTimestamp);
  }

  /** Update the Stats Cache of ALL uuids.
   * @private
   * @param {string} serverUpdateTimestamp */
  //@ts-ignore
  async #updateAllStatsCache(serverUpdateTimestamp) {
    for (const uuid of this.uuids)
      await this.#updateTargetStatsCache(serverUpdateTimestamp, uuid);
    sessionStorage.setItem("meta.lastupdated:stats", serverUpdateTimestamp);
  }

}