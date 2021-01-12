//@ts-check

class JDAPIError extends Error {}

class CacheManager {

  /** @private */
  #apiBaseUrl = "https://jdapi.olllli.workers.dev/";
  /** @protected */
  storage = localStorage;
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
    const uuidsList = JSON.parse(this.storage.getItem("uuid") ?? "[]");
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
      return response.text();
    // If an API failure occured, throw an error up the chain using the response body.
    else {
      throw new JDAPIError(await response.text());
    }
  }

  /** Checks if StatsAPI's this.storage is up to date.
   * Returns whether stats and uuid are up to date,
   * and includes the API Server's own update timestamp.
   * @private
   * @returns {Promise<{advancements: boolean, player: boolean, stats: boolean, uuid: boolean, serverUpdateTimestamp: string}>} */
  async versionCheck() {
    const clientAdvancementsUpdateTimestamp = this.storage.getItem("meta.lastupdated:advancements");
    const clientPlayerUpdateTimestamp = this.storage.getItem("meta.lastupdated:player");
    const clientStatsUpdateTimestamp = this.storage.getItem("meta.lastupdated:stats");
    const clientUuidUpdateTimestamp = this.storage.getItem("meta.lastupdated:uuid");
    const serverUpdateTimestamp = await this.fetchAPI("meta/lastupdated");
    return {
      advancements: clientAdvancementsUpdateTimestamp === serverUpdateTimestamp,
      player: clientPlayerUpdateTimestamp === serverUpdateTimestamp,
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
    this.storage.setItem("uuid", uuidsString);
    this.storage.setItem("meta.lastupdated:uuid", serverUpdateTimestamp);
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
      this.stats.set(uuid, JSON.parse(this.storage.getItem(`stats:${uuid}`))["stats"]);
    return isUpdated;
  }

  /** Returns the value of stat `namespace` for `uuid`.
   * @param {string} uuid
   * @param {string} namespace
   * @returns {number} */
  getNamespaceStat(namespace, uuid) {
    const uuidStats = this.stats.get(uuid);
    const namespaceKeys = namespace.split(":");
    return (uuidStats[`minecraft:${namespaceKeys[0]}`] ?? {})[`minecraft:${namespaceKeys[1]}`] ?? 0;
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
    this.storage.setItem(`stats:${uuid}`, stats);
    this.storage.setItem(`meta.lastupdated:stats.${uuid}`, serverUpdateTimestamp);
  }

  /** Update the Stats Cache of ALL uuids.
   * @private
   * @param {string} serverUpdateTimestamp */
  //@ts-ignore
  async #updateAllStatsCache(serverUpdateTimestamp) {
    for (const uuid of this.uuids)
      await this.#updateTargetStatsCache(serverUpdateTimestamp, uuid);
    this.storage.setItem("meta.lastupdated:stats", serverUpdateTimestamp);
  }
}

class PlayerAPI extends CacheManager {
  /** @type {Map<string,{username:string,skin:string,offline:boolean,advancementCount:number}>} */
  players = new Map();

  /** Ensure cache is up to date, and prepare properties. */
  async init() {
    const isUpdated = await super.init();
    if (!isUpdated.player) {
      await this.#updateAllPlayersCache(isUpdated.serverUpdateTimestamp)
      console.log("Players Updated");
    }
    /** @type {string[]} */
    for (const uuid of this.uuids)
      this.players.set(uuid, JSON.parse(this.storage.getItem(`player:${uuid}`)));
    return isUpdated;
  }

  /** Update the Player Cache, storing a record per uuid.
   * @private
   * @param {string} serverUpdateTimestamp
   * @param {string} uuid */
  //@ts-ignore
  async #updateTargetPlayerCache(serverUpdateTimestamp, uuid) {
    const player = await this.fetchAPI(`player/${uuid}`);
    this.storage.setItem(`player:${uuid}`, player);
    this.storage.setItem(`meta.lastupdated:player.${uuid}`, serverUpdateTimestamp);
  }

  /** Update the Player Cache of ALL uuids.
   * @private
   * @param {string} serverUpdateTimestamp */
  //@ts-ignore
  async #updateAllPlayersCache(serverUpdateTimestamp) {
    for (const uuid of this.uuids)
      await this.#updateTargetPlayerCache(serverUpdateTimestamp, uuid);
    this.storage.setItem("meta.lastupdated:player", serverUpdateTimestamp);
  }

  /** Get a data URI of the Player's head without hat.
   * @param {string} uuid
   * @param {"merge"|"face"|"hat"} mode */
  getHeadCanvas(uuid, mode="merge") {
    const player = this.players.get(uuid);
    const cnv = document.createElement("canvas");
    cnv.width = 8;
    cnv.height = 8;
    const ctx = cnv.getContext("2d");
    const img = document.createElement("img");
    img.src = player.offline ? "./img/steve-head.png" : player.skin.replace("http:","https:");
    img.decode().then(()=>{
      if (mode === "merge" || mode === "face")
        ctx.drawImage(img, -8, -8);
      if (mode === "merge" || mode === "hat")
        ctx.drawImage(img, -40, -8);
    });
    return cnv;
  }
}

class AdvancementsAPI {
  #apiURL = "https://jdapi.olllli.workers.dev/";

  //Gets the data from the API
  //@ts-ignore
  async #getDataFromAPI(entrypoint) {
    /** @type {RequestInit} */
    const options = {
      method: "GET",
      mode: "cors"
    }
    const response = await fetch(this.#apiURL + String(entrypoint), options)
    if (response.status == 200) {
      const responseJSON = await response.json()
      return responseJSON
    } else {
      throw new Error("some error from getDataFromAPI")
      //better error handling
    }
  }

  //Checks if the this.storage data is the latest version
  //@ts-ignore
  async #checkIfLatestVersion() {
    const localAdvancementsUpdate = sessionStorage.getItem("advancements_lastupdated")
    const localMetadataUpdate = sessionStorage.getItem("metadata_lastupdated")
    const response = await this.#getDataFromAPI("meta/lastupdated")
    const onlineLastUpdate = response["data"]
    return { "metadata": localMetadataUpdate == onlineLastUpdate, "advancements": localAdvancementsUpdate == onlineLastUpdate, "onlineLastUpdate": onlineLastUpdate }
  }

  //Updates the metadata session storage
  //@ts-ignore
  async #updateMetadataSessionStorage(onlineLastUpdate) {
    const response = await this.#getDataFromAPI("uuids")
    const uuidlist = response["data"]
    sessionStorage.setItem("uuidlist", uuidlist)
    sessionStorage.setItem("metadata_lastupdated", onlineLastUpdate)
  }

  //Updates a single players advancements storage, seperated because might be useful later
  //@ts-ignore
  async #updatePlayerAdvancementsStorage(uuid) {
    const response = await this.#getDataFromAPI("advancements/" + String(uuid))
    const playerAdvancements = response["data"]
    sessionStorage.setItem("advancements_" + uuid, playerAdvancements)
  }

  //Updates the advancements session storage of all players
  //@ts-ignore
  async #updateAdvancementsSessionStorage(onlineLastUpdate) {
    const uuidList = this.getUUIDList()
    for (const uuid of uuidList) {
      await this.#updatePlayerAdvancementsStorage(uuid)
    }
    sessionStorage.setItem("advancements_lastupdated", onlineLastUpdate)
  }

  //Returns a list of UUIDs
  getUUIDList() {
    const uuidListString = sessionStorage.getItem("uuidlist")
    const uuidList = JSON.parse(uuidListString)
    return uuidList
  }

  //Ensures all sessionStorage is the latest version
  async ensureAllIsUpToDate() {
    const isUpdated = await this.#checkIfLatestVersion()
    if (isUpdated["metadata"] == false) {
      await this.#updateMetadataSessionStorage(String(isUpdated["onlineLastUpdate"]))
      console.log("MetaData Updated")
    }
    if (isUpdated["advancements"] == false) {
      await this.#updateAdvancementsSessionStorage(String(isUpdated["onlineLastUpdate"]))
      console.log("Advancements Updated")
    }
    return "All Is Up To Date!"
  }

  //Returns a json object of all a uuids advancements
  getAllAdvancementsFromUUID(uuid) {
    const advancementsString = sessionStorage.getItem("advancements_" + String(uuid)) || "{}"
    const advancements = JSON.parse(advancementsString)
    return advancements
  }

  //returns the advancement details based on an advancement
  getExactAdvancementFromUUID(uuid, advancementName) {
    const allAdvancements = this.getAllAdvancementsFromUUID(String(uuid))
    return allAdvancements[String(advancementName)] || null
  }
}
