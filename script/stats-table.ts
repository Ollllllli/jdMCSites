/* OLD EXAMPLE FOR TEMPORARY STYLING PURPOSES
<div class="select-wrapper">
  <select onfocus='this.size=this.children.length;' onblur='this.size=0;' onchange='this.size=1;this.blur();'>
    <option>Time Played (hrs)</option>
    <option>Diamonds Quarried</option>
    <option>Ancient Debris Quarried</option>
  </select>
</div>
*/

const namespacePattern = /(?<namespace>(?:custom|mined|broken|crafted|used|picked_up|dropped|killed|killed_by):\w+)|./g

class MCStatsTable {
  table: Element;
  statsOptions: any;
  rowDiv: HTMLDivElement;
  constructor(tableSelector: string, private statsInstance: StatsAPI, private playerInstance: PlayerAPI) {
    this.table = document.querySelector(tableSelector)!;
    this.statsOptions = this.prepareOptions();
    // generate table header
    this.table.insertAdjacentHTML("beforeend", "".concat(
      `<mc-header>`,
        `<h2>Player</h2>`,
        `<div class="select-wrapper">`,
          `<select onfocus='this.size=this.children.length;' onblur='this.size=0;' onchange='this.size=1;this.blur();'>`,
            ...[...this.statsOptions.keys()].map(v=>`<option>${v}</option>`),
          `</select>`,
        `</div>`,
      `</mc-header>`,
    ));
    this.rowDiv = document.createElement("div");
    this.table.insertAdjacentElement("beforeend", this.rowDiv);
    const selectEle = this.table.querySelector("select")!;
    this.generateTable(selectEle["value"]);
    this.table.querySelector("select")?.addEventListener("change", e=>{
      this.generateTable(selectEle["value"]);
    });
  }
  /**
   * @private
   * returns {{[key: string]:{valueFunc($_stats:any):number;formatFunc(x:number):string}}} */
  prepareOptions() {
    /** @type {Map<string,{valueFunc($_statsInstance:StatsAPI,$_uuid:string):number;formatFunc(x:number):string}>} */
    const statsMap: Map<string, { valueFunc($_statsInstance: StatsAPI, $_uuid: string): number; formatFunc(x: number): string; }> = new Map();
    for (const statOption of this.table.children) {
      if (statOption.tagName !== "MC-STAT")
        continue;
      // value function builder
      const valueExpression = statOption.getAttribute("value")!;
      let valueFuncBody = "";
      for (const match of valueExpression.matchAll(namespacePattern)) {
        const matchText = match[0];
        const matchGroups = Object.entries(match.groups!).filter(g=>g[1]!==undefined).map(g=>g[0]);
        if (matchGroups.includes("namespace"))
          valueFuncBody += `$_statsInstance.getStatValue("${matchText}",$_uuid)`;
        else
          valueFuncBody += matchText;
      }
      const formatExpression = statOption.getAttribute("format");
      statsMap.set(statOption.textContent!, {
        //@ts-ignore
        valueFunc: new Function("$_statsInstance", "$_uuid", `return Number(${valueFuncBody})`),
        //@ts-ignore
        formatFunc: new Function("x", `return String(${formatExpression})`),
      });
    }
    // clear out mc-stats-table children ready for inserting display elements
    this.table.innerHTML = "";
    return statsMap;
  }

  generateTable(statOptionKey = [...this.statsOptions.entries()][0][0]) {
    const statOption = this.statsOptions.get(statOptionKey);
    this.rowDiv.innerHTML = "";
    /** @type [number,HTMLElement][] */
    const statTableList: [number, HTMLElement][] = [];
    for (const uuid of this.statsInstance.uuids) {
      const player = this.playerInstance.players.get(uuid)!;
      if (player.offline)
        continue;
      const rowEle = document.createElement("mc-row");
      const cnvEle = this.playerInstance.getHeadCanvas(uuid);
      const statValue = statOption.valueFunc(this.statsInstance, uuid);
      const statFormatted = statOption.formatFunc(statValue);
      rowEle.classList.add("style-info");
      rowEle.insertAdjacentElement("beforeend", cnvEle);
      rowEle.insertAdjacentHTML("beforeend", `<span>${player.username}</span>`);
      rowEle.insertAdjacentHTML("beforeend", `<span>${statFormatted}</span>`);
      statTableList.push([statValue, rowEle]);
    }
    statTableList.sort((a,b)=>b[0]-a[0]).forEach(e=>{
      this.rowDiv.insertAdjacentElement("beforeend", e[1]);
    });
  }
}

window.onload = async()=>{
  const stats = new StatsAPI();  
  const player = new PlayerAPI();
  const loadingEle = document.createElement("span");
  loadingEle.classList.add("loading-icon");
  document.querySelector("header div")!.insertAdjacentElement("afterend", loadingEle);
  await Promise.all([stats.init(), player.init()]);
  new MCStatsTable("mc-stats-table", stats, player);
  loadingEle.remove();
};
