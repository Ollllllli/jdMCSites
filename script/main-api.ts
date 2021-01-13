//@ts-check

class JDAPIError extends Error {}

class CacheManager {

  /** @private */
  #apiBaseUrl = "https://jdapi.olllli.workers.dev/";
  /** @protected */
  storage = localStorage;
  /** @type {Set<string>} */
  uuids: Set<string> = new Set();

  /** Ensure cache is up to date, and prepare properties. */
  async init() {
    const isUpdated = await this.versionCheck();
    if (!isUpdated.uuid) {
      await this.#updateUuidCache(isUpdated.serverUpdateTimestamp);
      console.log("UUIDs Updated");
    }
    /** @type {string[]} */
    const uuidsList: string[] = JSON.parse(this.storage.getItem("uuid") ?? "[]");
    for (const uuid of uuidsList)
      this.uuids.add(uuid);
    return isUpdated;
  }

  /** Wrapper function to `GET` API endpoint data. */
  protected async fetchAPI(endpoint: string) {
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
  async versionCheck(): Promise<{ advancements: boolean; player: boolean; stats: boolean; uuid: boolean; serverUpdateTimestamp: string; }> {
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
  async #updateUuidCache(serverUpdateTimestamp: string) {
    const uuidsString = await this.fetchAPI("uuid");
    this.storage.setItem("uuid", uuidsString);
    this.storage.setItem("meta.lastupdated:uuid", serverUpdateTimestamp);
  }
}

/** Singleton class to manage Statistics from the API server. */
class StatsAPI extends CacheManager {

  /** @type {Map<string,any>} */
  stats: Map<string, any> = new Map();

  /** Ensure cache is up to date, and prepare properties. */
  async init() {
    const isUpdated = await super.init();
    if (!isUpdated.stats) {
      await this.#updateAllStatsCache(isUpdated.serverUpdateTimestamp)
      console.log("Stats Updated");
    }
    /** @type {string[]} */
    for (const uuid of this.uuids)
      this.stats.set(uuid, JSON.parse(this.storage.getItem(`stats:${uuid}`)!)["stats"]);
    return isUpdated;
  }

  /** Returns the value of stat `namespace` for `uuid`.
   * @param {string} uuid
   * @param {string} namespace
   * @returns {number} */
  getNamespaceStat(namespace: string, uuid: string): number {
    const uuidStats = this.stats.get(uuid);
    const namespaceKeys = namespace.split(":");
    return (uuidStats[`minecraft:${namespaceKeys[0]}`] ?? {})[`minecraft:${namespaceKeys[1]}`] ?? 0;
  }

  /** Return an ordered object of UUIDs and their score for the `namespace` statistic.
   * @param {string} namespace
   * @returns {{[uuid: string]: number}} */
  getUUIDScores(namespace: string): { [uuid: string]: number; } {
      /** @type {{[uuid: string]: number}} */
      const statsObject: { [uuid: string]: number; } = {};
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
  async #updateTargetStatsCache(serverUpdateTimestamp: string, uuid: string) {
    const stats = await this.fetchAPI(`stats/${uuid}`);
    this.storage.setItem(`stats:${uuid}`, stats);
    this.storage.setItem(`meta.lastupdated:stats.${uuid}`, serverUpdateTimestamp);
  }

  /** Update the Stats Cache of ALL uuids.
   * @private
   * @param {string} serverUpdateTimestamp */
  //@ts-ignore
  async #updateAllStatsCache(serverUpdateTimestamp: string) {
    for (const uuid of this.uuids)
      await this.#updateTargetStatsCache(serverUpdateTimestamp, uuid);
    this.storage.setItem("meta.lastupdated:stats", serverUpdateTimestamp);
  }
}

class PlayerAPI extends CacheManager {
  /** @type {Map<string,{username:string,skin:string,offline:boolean,advancementCount:number}>} */
  players: Map<string, { username: string; skin: string; offline: boolean; advancementCount: number; }> = new Map();

  /** Ensure cache is up to date, and prepare properties. */
  async init() {
    const isUpdated = await super.init();
    if (!isUpdated.player) {
      await this.#updateAllPlayersCache(isUpdated.serverUpdateTimestamp)
      console.log("Players Updated");
    }
    /** @type {string[]} */
    for (const uuid of this.uuids)
      this.players.set(uuid, JSON.parse(this.storage.getItem(`player:${uuid}`)!));
    return isUpdated;
  }

  /** Update the Player Cache, storing a record per uuid.
   * @private
   * @param {string} serverUpdateTimestamp
   * @param {string} uuid */
  //@ts-ignore
  async #updateTargetPlayerCache(serverUpdateTimestamp: string, uuid: string) {
    const player = await this.fetchAPI(`player/${uuid}`);
    this.storage.setItem(`player:${uuid}`, player);
    this.storage.setItem(`meta.lastupdated:player.${uuid}`, serverUpdateTimestamp);
  }

  /** Update the Player Cache of ALL uuids.
   * @private
   * @param {string} serverUpdateTimestamp */
  //@ts-ignore
  async #updateAllPlayersCache(serverUpdateTimestamp: string) {
    for (const uuid of this.uuids)
      await this.#updateTargetPlayerCache(serverUpdateTimestamp, uuid);
    this.storage.setItem("meta.lastupdated:player", serverUpdateTimestamp);
  }

  /** Get a data URI of the Player's head without hat.
   * @param {string} uuid
   * @param {"merge"|"face"|"hat"} mode */
  getHeadCanvas(uuid: string, mode: "merge" | "face" | "hat"="merge") {
    const player = this.players.get(uuid);
    const cnv = document.createElement("canvas");
    cnv.width = 8;
    cnv.height = 8;
    const ctx = cnv.getContext("2d")!;
    const img = document.createElement("img");
    img.src = player!.offline ? "./img/steve-head.png" : player!.skin.replace("http:","https:");
    img.decode().then(()=>{
      if (player!.offline)
        return ctx.drawImage(img, 0, 0)
      if (mode === "merge" || mode === "face")
        ctx.drawImage(img, -8, -8);
      if (mode === "merge" || mode === "hat")
        ctx.drawImage(img, -40, -8);
    });
    return cnv;
  }
}

class AdvancementsAPI extends CacheManager {
  /** @type {Map<string,any>} */
  advancements: Map<string, any> = new Map();

  /** Ensure cache is up to date, and prepare properties. */
  async init() {
    const isUpdated = await super.init();
    if (!isUpdated.advancements) {
      await this.#updateAllAdvancementsCache(isUpdated.serverUpdateTimestamp)
      console.log("Advancements Updated");
    }
    /** @type {string[]} */
    for (const uuid of this.uuids)
      this.advancements.set(uuid, JSON.parse(this.storage.getItem(`advancements:${uuid}`)!));
    return isUpdated;
  }

  /** Returns the object containing a done boolean and the criteria completed of advancement `namespace` for `uuid`.
   * @param {string} uuid - uuid string
   * @param {string} namespace - namespaced advancement like story/shiny_gear
   * @returns {{done: boolean, criteria: {[criteria: string]: Date}}}
   */
  getNamespaceAdvancement(namespace: string, uuid: string): { done: boolean; criteria: { [criteria: string]: Date; }; } {
    const uuidAdvancements = this.advancements.get(uuid)
    const advancementData = uuidAdvancements[`minecraft:${namespace}`] ?? {}
    /** @type {{[criteria: string]: Date}} */
    let criteria: { [criteria: string]: Date; } = Object(); 
    //Converts all the dates to date objects
    for (let criterion in advancementData.criteria) {
      criteria[criterion] = new Date(advancementData.criteria[criterion])
    }
    return {done: advancementData["done"] ?? false, criteria: criteria ?? {}}
  }

  /** Returns the date of the latest completed criteria and null if not completed yet
   * @param {string} uuid - uuid string
   * @param {string} namespace - namespaced advancement like story/shiny_gear
   * @returns {Date|null} - date of the latest criteria completed
   */
  getAdvancementDate(namespace: string, uuid: string): Date | null {
    const advancement = this.getNamespaceAdvancement(namespace, uuid)
    let returnDate;
    if (!advancement.done) {
      returnDate = null // returns null if advancement isn't done
    } else {
      let dateList = []
      for (let criterion in advancement.criteria) {
        dateList.push(advancement.criteria[criterion]) //adds all dates to the list
      }
      console.log(dateList)
      //Sorts the datelist in descending order
      dateList.sort((a,b)=>{
        if (a>b){return -1}
        else if (b>a){return 1}
        else {return 0}
      })
      returnDate = dateList[0] ?? null //null just incase there are no criteria
    }
    return returnDate
  }

  /** Update the Advancements Cache, storing a record per uuid.
   * @private
   * @param {string} serverUpdateTimestamp
   * @param {string} uuid */
  //@ts-ignore
  async #updateTargetAdvancementsCache(serverUpdateTimestamp: string, uuid: string) {
    const advancements = await this.fetchAPI(`advancements/${uuid}`);
    this.storage.setItem(`advancements:${uuid}`, advancements);
    this.storage.setItem(`meta.lastupdated:advancements.${uuid}`, serverUpdateTimestamp);
  }

  /** Update the Advancements Cache of ALL uuids.
   * @private
   * @param {string} serverUpdateTimestamp */
  //@ts-ignore
  async #updateAllAdvancementsCache(serverUpdateTimestamp: string) {
    for (const uuid of this.uuids)
      await this.#updateTargetAdvancementsCache(serverUpdateTimestamp, uuid);
    this.storage.setItem("meta.lastupdated:advancements", serverUpdateTimestamp);
  }
}