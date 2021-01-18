class MCAdvancementMain {
  advContainer: MCAdvancementContainer | null;
  constructor(private advInstance: AdvancementsAPI, private playerInstance: PlayerAPI) {
    this.advContainer = document.querySelector("mc-advancement-container");
  }

  updateAdvancementsStatus(uuid: UUID, category: AdvancementCategory) {
    if (this.advContainer != null) {
      for (const child of this.advContainer.children) {
        child.removeAttribute("done");
      }

      for (const adv of this.advInstance.getAllCompleted(uuid)) {
        if (adv.includes(category)) {
          const advEle = document.querySelector(`mc-advancement-container mc-advancement[ns="${adv}"]`);
          if (advEle != null) {
            advEle.setAttribute("done","true");
          }
        }
      }
    }
  }

}

let advMain: MCAdvancementMain;
window.onload = async()=>{
  const advancements = new AdvancementsAPI();  
  const player = new PlayerAPI();
  await Promise.all([advancements.init(), player.init()]);
  advMain = new MCAdvancementMain(advancements, player);
};
