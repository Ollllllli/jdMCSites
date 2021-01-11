class StatsAPI {
    #apiURL = "https://jdapi.olllli.workers.dev/";
    constructor() {
        //this.ensureAllIsUpToDate()
    }

    //Gets the data from the API
    async #getDataFromAPI(entrypoint) {
        const options = {
            method: 'GET'
        }
        const response = await fetch(this.#apiURL + String(entrypoint), options)
        if (response.status == 200) {
            const responseJSON = await response.json()
            return responseJSON
        } else {
            if (response == "error") {
                throw new Error("some error from getDataFromAPI")
                //better error handling
            }
        }
    }

    //Checks if the sessionStorage data is the latest version
    async #checkIfLatestVersion() {
        const localStatsUpdate = sessionStorage.getItem("stats_lastupdated")
        const localMetadataUpdate = sessionStorage.getItem("metadata_lastupdated")
        const response = await this.#getDataFromAPI("meta/lastupdated")
        const onlineLastUpdate = response["data"]
        return { "metadata": localMetadataUpdate == onlineLastUpdate, "stats": localStatsUpdate == onlineLastUpdate, "onlineLastUpdate": onlineLastUpdate }
    }

    //Updates the metadata session storage
    async #updateMetadataSessionStorage(onlineLastUpdate) {
        const response = await this.#getDataFromAPI("uuids")
        const uuidlist = response["data"]
        sessionStorage.setItem("uuidlist", uuidlist)
        sessionStorage.setItem("metadata_lastupdated", onlineLastUpdate)
    }

    //Updates a single players stats storage, seperated because might be useful later
    async #updatePlayerStatsStorage(uuid) {
        const response = await this.#getDataFromAPI("stats/" + String(uuid))
        const playerStats = response["data"]
        sessionStorage.setItem("stats_" + uuid, playerStats)
    }

    //Updates the stats session storage of all players
    async #updateStatsSessionStorage(onlineLastUpdate) {
        const uuidList = this.getUUIDList()
        for (const uuid of uuidList) {
            await this.#updatePlayerStatsStorage(uuid)
        }
        sessionStorage.setItem("stats_lastupdated", onlineLastUpdate)
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
        if (isUpdated["stats"] == false) {
            await this.#updateStatsSessionStorage(String(isUpdated["onlineLastUpdate"]))
            console.log("Stats Updated")
        }
        return "All Is Up To Date!"
    }

    //Returns a json object of all a uuids stats
    getAllStatsFromUUID(uuid) {
        const statsString = sessionStorage.getItem("stats_" + String(uuid)) || {}
        const stats = JSON.parse(statsString)["stats"] || {}
        return stats
    }

    //returns a exact stat value of a certain statistic
    getExactStatFromUUID(uuid, statType, statName) {
        const allStats = this.getAllStatsFromUUID(String(uuid))
        const allStatsFromType = allStats[String(statType)] || {}
        const statValue = allStatsFromType[String(statName)] || 0
        return Number(statValue)
    }

    //returns a list of {UUID, statValue}
    getAllStatsOfType(statType, statName) {
        const uuidList = this.getUUIDList()
        let statsList = []
        for (const uuid of uuidList) {
            const value = this.getExactStatFromUUID(uuid, statType, statName)
            statsList.push({ uuid, value })
        }
        return statsList
    }
}
