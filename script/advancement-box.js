class MCAdvancementMain {
    advMainRoot = null;
    constructor(advInstance, playerInstance, advMainTag){
        this.advInstance = advInstance;
        this.playerInstance = playerInstance;
        this.advView = document.querySelector("mc-advancement-view");
        if (advMainTag) {
            this.advMainRoot = document.querySelector(advMainTag);
        }
        if (this.advMainRoot != null) {
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
                this.updateAdvancementsStatus(uuidPickerSelect.value, categoryPickerSelect.value);
            });
            uuidPickerSelect.addEventListener("change", ()=>{
                this.updateAdvancementsStatus(uuidPickerSelect.value, categoryPickerSelect.value);
            });
            this.advMainRoot.insertAdjacentElement('afterbegin', mcHeaderEle);
            this.updateAdvancementsStatus(uuidPickerSelect.value, categoryPickerSelect.value);
        }
    }
    updateAdvancementsStatus(uuid, category) {
        if (this.advView != null) {
            for (const child of this.advView.querySelectorAll("[done='true']")){
                child.removeAttribute("done");
            }
            for (const adv of this.advInstance.getAllCompleted(uuid)){
                if (adv.includes(category)) {
                    const advEle = document.querySelector(`mc-advancement-view mc-advancement[ns="${adv}"]`);
                    if (advEle != null) {
                        advEle.setAttribute("done", "true");
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
let advMainGlob;
window.onload = async ()=>{
    const advancements = new AdvancementsAPI();
    const player = new PlayerAPI();
    await Promise.all([
        advancements.init(),
        player.init()
    ]);
    advMainGlob = new MCAdvancementMain(advancements, player, "mc-advancement-main");
};
