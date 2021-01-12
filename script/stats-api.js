//@ts-check

class APIError extends Error {}

/** Singleton class to manage Statistics from the API server. */
class StatsAPI {
  _apiURL = "https://jdapi.olllli.workers.dev/";
  constructor() {
    //this.ensureAllIsUpToDate()
    // fire ready event
  }

  /** Return UUID Cache.
   * @returns {string[]} */
  getUUIDList() {
    return JSON.parse(sessionStorage.getItem("uuid") ?? "[]");
  }

  /** Wrapper function to `GET` API endpoint data.
   * @param {string} endpoint
   * @returns {Promise<any | never>} */
  async _getDataFromAPI(endpoint) {
    // Fetch data from the API server.
    const response = await fetch(`${this._apiURL}${endpoint}`);
    // If successful, handle depending on endpoint.
    if (response.status == 200) {
      // Handle response Content-Type header accordingly.
//!!! CURRENTLY DISABLED AS SESSIONSTORAGE ONLY TAKES STRING
      //if (response.headers.get("Content-Type") === "application/json")
      //  return await response.json();
      //else
      return await response.text();
    }
    // If an API failure occured, throw an error up the chain using the response body.
    else {
      throw new APIError(await response.text());
    }
  }

  /** Checks if StatsAPI's sessionStorage is up to date.
   * Returns whether stats and uuid are up to date,
   * and includes the API Server's own update timestamp.
   * @returns {Promise<{stats: boolean, uuid: boolean, serverUpdateTimestamp: string}>} */
  async _checkIfLatestVersion() {
    const clientStatsUpdateTimestamp = sessionStorage.getItem("meta.lastupdated:stats");
    const clientUuidUpdateTimestamp = sessionStorage.getItem("meta.lastupdated:uuid");
    const serverUpdateTimestamp = await this._getDataFromAPI("meta/lastupdated");
    return {
      stats: clientStatsUpdateTimestamp === serverUpdateTimestamp,
      uuid: clientUuidUpdateTimestamp === serverUpdateTimestamp,
      serverUpdateTimestamp,
    };
  }

  /** Update the UUID Cache.
   * @param {string} serverUpdateTimestamp */
  async _updateUuidCache(serverUpdateTimestamp) {
    const uuids = await this._getDataFromAPI("uuid");
    sessionStorage.setItem("uuid", uuids);
    sessionStorage.setItem("meta.lastupdated:uuid", serverUpdateTimestamp);
  }

  /** Update the Stats Cache, storing a record per uuid.
   * @param {string} uuid
   * @param {string} serverUpdateTimestamp */
  async _updateTargetStatsCache(uuid, serverUpdateTimestamp) {
    const stats = await this._getDataFromAPI(`stats/${uuid}`);
    sessionStorage.setItem(`stats:${uuid}`, stats);
    sessionStorage.setItem(`meta.lastupdated:stats.${uuid}`, serverUpdateTimestamp);
  }

  /** Update the Stats Cache of ALL uuids.
   * @param {string} serverUpdateTimestamp */
  async _updateAllStatsCache(serverUpdateTimestamp) {
    const uuids = this.getUUIDList();
    for (const uuid of uuids)
      await this._updateTargetStatsCache(uuid, serverUpdateTimestamp);
    sessionStorage.setItem("meta.lastupdated:stats", serverUpdateTimestamp);
  }



  /** Ensure ALL Stats and UUIDs are up to date. */
  async ensureAllIsUpToDate() {
    const isUpdated = await this._checkIfLatestVersion();
    if (!isUpdated.uuid) {
      await this._updateUuidCache(isUpdated.serverUpdateTimestamp);
      console.log("UUIDs Updated");
    }
    if (!isUpdated.stats) {
      await this._updateAllStatsCache(String(isUpdated["onlineLastUpdate"]))
      console.log("Stats Updated");
    }
  }

  /** Return a Minecraft Stats Object for the given `uuid`.
   * @param {string} uuid
   * @returns {any} */
  getStats(uuid) {
    return JSON.parse(sessionStorage.getItem(`stats:${uuid}`) ?? "{}")["stats"] ?? {};
  }

  /** Return a Minecraft Stats Object for the given `uuid`.
   * @param {string} uuid
   * @param {string} namespace
   * @returns {number} */
  getNamespaceStat(namespace, uuid) {
    const stats = this.getStats(uuid);
    const namespaceKeys = namespace.split(":");
    return stats[`minecraft:${namespaceKeys[0]}`][`minecraft:${namespaceKeys[1]}`];
  }

  /** Return an ordered object of UUIDs and their score for the `namespace` statistic.
   * @param {string} namespace
   * @returns {{[key: string]: number}} */
  getUUIDScores(namespace) {
      const uuids = this.getUUIDList();
      /** @type {{[key: string]: number}} */
      const statsObject = {};
      for (const uuid of uuids) {
        statsObject[uuid] = this.getNamespaceStat(namespace, uuid);
      }
      return statsObject;
  }
}