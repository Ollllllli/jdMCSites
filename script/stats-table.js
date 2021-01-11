//@ts-check
///<reference lib="esnext"/>

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

/** @returns {{[key: string]:{valueFunc($_stats:any):number;formatFunc(x:number):string}}} */
function buildStatTracker() {
  const mcStatTable = document.querySelector("mc-stats-table");
  const trackedStats = {};
  for (const stat of mcStatTable.children) {
    if (stat.tagName !== "MC-STAT") continue;
    // value function builder
    const valueExpression = stat.getAttribute("value");
    let valueFuncBody = "";
    for (const match of valueExpression.matchAll(namespacePattern)) {
      const matchText = match[0];
      const matchGroups = Object.entries(match.groups).filter(g=>g[1]!==undefined).map(g=>g[0]);
      if (matchGroups.includes("namespace"))
        valueFuncBody += `$_stats["minecraft:${matchText.split(":")[0]}"]["minecraft:${matchText.split(":")[1]}"]`;
      else
        valueFuncBody += matchText;
    }
    const formatExpression = stat.getAttribute("format");
    trackedStats[stat.textContent] = {
      valueFunc: new Function("$_stats", `return Number(${valueFuncBody})`),
      formatFunc: new Function("x", `return String(${formatExpression})`),
    };
  }
  // clear out mc-stats-table children ready for inserting display elements
  while (mcStatTable.lastChild) mcStatTable.removeChild(mcStatTable.lastChild);
  //@ts-expect-error
  return trackedStats;
}

const statTracker = buildStatTracker();
