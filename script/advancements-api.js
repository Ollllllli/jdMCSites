class AdvancementsAPI {
    #apiURL = "https://jdapi.olllli.workers.dev/";
    constructor() {
    }

    //Gets the data from the API
    async #getDataFromAPI(entrypoint) {
        const options = {
            method: 'GET',
            mode: 'cors'
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
        const localAdvancementsUpdate = sessionStorage.getItem("advancements_lastupdated")
        const localMetadataUpdate = sessionStorage.getItem("metadata_lastupdated")
        const response = await this.#getDataFromAPI("meta/lastupdated")
        const onlineLastUpdate = response["data"]
        return { "metadata": localMetadataUpdate == onlineLastUpdate, "advancements": localAdvancementsUpdate == onlineLastUpdate, "onlineLastUpdate": onlineLastUpdate }
    }

    //Updates the metadata session storage
    async #updateMetadataSessionStorage(onlineLastUpdate) {
        const response = await this.#getDataFromAPI("uuids")
        const uuidlist = response["data"]
        sessionStorage.setItem("uuidlist", uuidlist)
        sessionStorage.setItem("metadata_lastupdated", onlineLastUpdate)
    }

    //Updates a single players advancements storage, seperated because might be useful later
    async #updatePlayerAdvancementsStorage(uuid) {
        const response = await this.#getDataFromAPI("advancements/" + String(uuid))
        const playerAdvancements = response["data"]
        sessionStorage.setItem("advancements_" + uuid, playerAdvancements)
    }

    //Updates the advancements session storage of all players
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
