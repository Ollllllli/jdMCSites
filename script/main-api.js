var /** A Minecraft UUID. */ UUIDType;
(function(UUIDType) {
    UUIDType["_type"] = "UUID";
})(UUIDType || (UUIDType = {
}));
var /** A Minecraft Namespace in format `name:value`. */ MCNamespaceType;
(function(MCNamespaceType) {
    MCNamespaceType["_type"] = "MCNamespace";
})(MCNamespaceType || (MCNamespaceType = {
}));
var /** A Minecraft Namespace in format `name:value`. */ DateStringType;
(function(DateStringType) {
    DateStringType["_type"] = "DateString";
})(DateStringType || (DateStringType = {
}));
class JDAPIError extends Error {
}
class CacheManager {
    apiBaseUrl = "https://jdapi.olllli.workers.dev/";
    storage = localStorage;
    uuids = new Set();
    /** Ensure cache is up to date, and prepare properties. */ async init() {
        const isUpdated = await this.versionCheck();
        if (!isUpdated.uuid) {
            await this.updateUuidCache(isUpdated.serverUpdateTimestamp);
            console.log("UUIDs Updated");
        }
        const uuidsList = JSON.parse(this.storage.getItem("uuid") ?? "[]");
        for (const uuid of uuidsList)this.uuids.add(uuid);
        return isUpdated;
    }
    /** Wrapper function to `GET` API endpoint data. */ async fetchAPI(endpoint) {
        // Fetch data from the API server.
        const response = await fetch(`${this.apiBaseUrl}${endpoint}`);
        // If successful, return response body.
        if (response.status == 200) return response.text();
        else {
            throw new JDAPIError(await response.text());
        }
    }
    /** Checks if StatsAPI's this.storage is up to date.
   * Returns whether stats and uuid are up to date,
   * and includes the API Server's own update timestamp. */ async versionCheck() {
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
            serverUpdateTimestamp
        };
    }
    /** Update the UUID Cache. */ async updateUuidCache(serverUpdateTimestamp) {
        const uuidsString = await this.fetchAPI("uuid");
        this.storage.setItem("uuid", uuidsString);
        this.storage.setItem("meta.lastupdated:uuid", serverUpdateTimestamp);
    }
}
/** Singleton class to manage Statistics from the API server. */ class StatsAPI extends CacheManager {
    stats = new Map();
    /** Ensure cache is up to date, and prepare properties. */ async init() {
        const isUpdated = await super.init();
        if (!isUpdated.stats) {
            await this.updateAllStatsCache(isUpdated.serverUpdateTimestamp);
            console.log("Stats Updated");
        }
        for (const uuid of this.uuids)this.stats.set(uuid, JSON.parse(this.storage.getItem(`stats:${uuid}`))["stats"]);
        return isUpdated;
    }
    /** Returns the value of stat `namespace` for `uuid`. */ getStatValue(namespace, uuid) {
        const uuidStats = this.stats.get(uuid);
        const namespaceKeys = namespace.split(":");
        return (uuidStats[`minecraft:${namespaceKeys[0]}`] ?? {
        })[`minecraft:${namespaceKeys[1]}`] ?? 0;
    }
    /** Return an ordered object of UUIDs and their score for the `namespace` statistic.*/ getUUIDScores(namespace) {
        const statsObject = new Map();
        for (const uuid of this.uuids){
            statsObject.set(uuid, this.getStatValue(namespace, uuid));
        }
        return statsObject;
    }
    /** Update the Stats Cache, storing a record per uuid. */ async updateTargetStatsCache(serverUpdateTimestamp, uuid) {
        const stats = await this.fetchAPI(`stats/${uuid}`);
        this.storage.setItem(`stats:${uuid}`, stats);
        this.storage.setItem(`meta.lastupdated:stats.${uuid}`, serverUpdateTimestamp);
    }
    /** Update the Stats Cache of ALL uuids. */ async updateAllStatsCache(serverUpdateTimestamp) {
        for (const uuid of this.uuids)await this.updateTargetStatsCache(serverUpdateTimestamp, uuid);
        this.storage.setItem("meta.lastupdated:stats", serverUpdateTimestamp);
    }
}
class PlayerAPI extends CacheManager {
    players = new Map();
    /** Ensure cache is up to date, and prepare properties. */ async init() {
        const isUpdated = await super.init();
        if (!isUpdated.player) {
            await this.updateAllPlayersCache(isUpdated.serverUpdateTimestamp);
            console.log("Players Updated");
        }
        for (const uuid of this.uuids)this.players.set(uuid, JSON.parse(this.storage.getItem(`player:${uuid}`)));
        return isUpdated;
    }
    /** Update the Player Cache, storing a record per uuid. */ async updateTargetPlayerCache(serverUpdateTimestamp, uuid) {
        const player = await this.fetchAPI(`player/${uuid}`);
        this.storage.setItem(`player:${uuid}`, player);
        this.storage.setItem(`meta.lastupdated:player.${uuid}`, serverUpdateTimestamp);
    }
    /** Update the Player Cache of ALL uuids. */ async updateAllPlayersCache(serverUpdateTimestamp) {
        for (const uuid of this.uuids)await this.updateTargetPlayerCache(serverUpdateTimestamp, uuid);
        this.storage.setItem("meta.lastupdated:player", serverUpdateTimestamp);
    }
    /** Get a data URI of the Player's head without hat. */ getHeadCanvas(uuid, mode = "merge") {
        const player = this.players.get(uuid);
        const cnv = document.createElement("canvas");
        cnv.width = 8;
        cnv.height = 8;
        const ctx = cnv.getContext("2d");
        const img = document.createElement("img");
        img.src = player.offline ? "./img/steve-head.png" : player.skin.replace("http:", "https:");
        img.decode().then(()=>{
            if (player.offline) return ctx.drawImage(img, 0, 0);
            if (mode === "merge" || mode === "face") ctx.drawImage(img, -8, -8);
            if (mode === "merge" || mode === "hat") ctx.drawImage(img, -40, -8);
        });
        return cnv;
    }
}
class AdvancementsAPI extends CacheManager {
    advancements = new Map();
    /** Ensure cache is up to date, and prepare properties. */ async init() {
        const isUpdated = await super.init();
        if (!isUpdated.advancements) {
            await this.updateAllAdvancementsCache(isUpdated.serverUpdateTimestamp);
            console.log("Advancements Updated");
        }
        for (const uuid of this.uuids){
            const rawAdvancements = JSON.parse(this.storage.getItem(`advancements:${uuid}`) ?? "{}");
            // remap each criteria item to a date
            for(const predicate in rawAdvancements){
                if (predicate != "DateVersion") {
                    for(const criterion in rawAdvancements[predicate]["criteria"]){
                        rawAdvancements[predicate]["criteria"][criterion] = new Date(rawAdvancements[predicate]["criteria"][criterion]);
                    }
                }
            }
            this.advancements.set(uuid, rawAdvancements);
        }
        return isUpdated;
    }
    /** Gets the `AdvancementProgress` for the given `uuid`. `name` is in the format `category/name`. */ getProgress(name, uuid) {
        return (this.advancements.get(uuid) ?? {
        })[`minecraft:${name}`] ?? {
            done: false,
            criteria: {
            }
        };
    }
    /** Gets the advancement completion date, or null if not completed.*/ getCompletionDate(name, uuid) {
        const progress = this.getProgress(name, uuid);
        if (progress.done == true) return Object.values(progress.criteria).sort((a, b)=>b.valueOf() - a.valueOf()
        )[0] ?? null;
        else return null;
    }
    getAllCompleted(uuid) {
        let completed = [];
        const uuidAdv = this.advancements.get(uuid);
        if (uuidAdv != null) {
            for(const advancement in uuidAdv){
                if (uuidAdv[advancement].done == true) {
                    completed.push(advancement.replace("minecraft:", ""));
                }
            }
        }
        return completed;
    }
    /** Update the Advancements Cache, storing a record per uuid. */ async updateTargetAdvancementsCache(serverUpdateTimestamp, uuid) {
        const advancements = await this.fetchAPI(`advancements/${uuid}`);
        this.storage.setItem(`advancements:${uuid}`, advancements);
        this.storage.setItem(`meta.lastupdated:advancements.${uuid}`, serverUpdateTimestamp);
    }
    /** Update the Advancements Cache of ALL uuids. */ async updateAllAdvancementsCache(serverUpdateTimestamp) {
        for (const uuid of this.uuids)await this.updateTargetAdvancementsCache(serverUpdateTimestamp, uuid);
        this.storage.setItem("meta.lastupdated:advancements", serverUpdateTimestamp);
    }
}
