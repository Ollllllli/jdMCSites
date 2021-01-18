class MCAdvancementMain {
    advMainRoot = null;
    constructor(advInstance, playerInstance, advMainTag){
        this.advInstance = advInstance;
        this.playerInstance = playerInstance;
        this.advContainer = document.querySelector("mc-advancement-container");
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
            this.advMainRoot.insertAdjacentElement('afterbegin', mcHeaderEle);
        }
    }
    updateAdvancementsStatus(uuid, category) {
        if (this.advContainer != null) {
            for (const child of this.advContainer.children){
                child.removeAttribute("done");
            }
            for (const adv of this.advInstance.getAllCompleted(uuid)){
                if (adv.includes(category)) {
                    const advEle = document.querySelector(`mc-advancement-container mc-advancement[ns="${adv}"]`);
                    if (advEle != null) {
                        advEle.setAttribute("done", "true");
                    }
                }
            }
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
