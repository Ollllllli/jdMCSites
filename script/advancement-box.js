class MCAdvancementGui {
    advGuiRoot = null;
    constructor(advInstance, playerInstance, advGuiTag){
        this.advInstance = advInstance;
        this.playerInstance = playerInstance;
        this.advView = document.querySelector("mc-advancement-view");
        if (advGuiTag) {
            this.advGuiRoot = document.querySelector(advGuiTag);
        }
        if (this.advGuiRoot != null) {
            let uuidNameList = [];
            for (const [uuid, player] of playerInstance.players){
                uuidNameList.push([
                    uuid,
                    player.username
                ]);
            }
            uuidNameList.sort((a, b)=>Number(a[1].localeCompare(b[1]))
            );
            const { root: uuidPickerRoot , select: uuidPickerSelect  } = generateSelect(uuidNameList);
            const { root: categoryPickerRoot , select: categoryPickerSelect  } = generateSelect([
                [
                    "story",
                    "Story"
                ],
                [
                    "nether",
                    "Nether"
                ],
                [
                    "end",
                    "End"
                ],
                [
                    "adventure",
                    "Adventure"
                ],
                [
                    "husbandry",
                    "Husbandry"
                ]
            ]);
            const mcHeaderEle = document.createElement("mc-header");
            mcHeaderEle.append(uuidPickerRoot, categoryPickerRoot);
            categoryPickerSelect.addEventListener("change", ()=>{
                this.changeAdvancementCategory(categoryPickerSelect.value);
                this.updateAdvancementsStatus(uuidPickerSelect.value);
            });
            uuidPickerSelect.addEventListener("change", ()=>{
                this.updateAdvancementsStatus(uuidPickerSelect.value);
            });
            this.advGuiRoot.insertAdjacentElement('afterbegin', mcHeaderEle);
            this.updateAdvancementsStatus(uuidPickerSelect.value);
        }
    }
    updateAdvancementsStatus(uuid) {
        if (this.advView != null) {
            const allCompleted = this.advInstance.getAllCompleted(uuid);
            for (const advEle of this.advView.querySelectorAll("mc-advancement")){
                advEle.removeAttribute("done");
                const namespace = advEle.getAttribute("ns");
                if (namespace != null) {
                    if (allCompleted.includes(namespace)) {
                        advEle.setAttribute("done", "true");
                    }
                    if (advEle instanceof MCAdvancement) {
                        advEle.updateCriteria(this.advInstance.getProgress(namespace, uuid), this.advInstance.getCompletionDate(namespace, uuid));
                    }
                }
            }
        }
    }
    changeAdvancementCategory(category) {
        if (this.advView != null) {
            this.advView.setAttribute("category", category);
        }
    }
}
let advGuiGlob;
window.onload = async ()=>{
    const advancements = new AdvancementsAPI();
    const player = new PlayerAPI();
    await Promise.all([
        advancements.init(),
        player.init()
    ]);
    advGuiGlob = new MCAdvancementGui(advancements, player, "mc-advancement-gui");
};
