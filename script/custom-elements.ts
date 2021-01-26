function generateSelect(keyValue: [optionValue: string, optionLabel: string][]) {
  const selectWrapper = document.createElement("div");
  selectWrapper.classList.add("select-wrapper");
  const selectElement = document.createElement("select");
  selectElement.onfocus = ()=>{selectElement.size=selectElement.children.length;}
  selectElement.onblur = ()=>{selectElement.size=0;}
  selectElement.onchange = ()=>{selectElement.size=1;selectElement.blur();}
  for (const [optionValue, optionLabel] of keyValue) {
    const optionElement = new Option(optionLabel,optionValue);
    selectElement.append(optionElement);
  }
  selectWrapper.append(selectElement);
  return {
    root: selectWrapper,
    select: selectElement
  }
}

// abstract class BaseCustomElement<ObserveAttrs extends Record<string,(value:any)=>unknown>> extends HTMLElement
// {
//   attrs = new Map<keyof ObserveAttrs, ReturnType<ObserveAttrs[keyof ObserveAttrs]>>();
//   constructor(private attrsToObserve: ObserveAttrs) {
//     super();
//     this.attachShadow({mode: 'closed'});
//     Object.defineProperty(this.constructor, "observedAttributes", {get:()=>Object.keys(this.attrsToObserve)});
//   }
//   private updateAttributes() {
//     for (const attrKey in this.attrsToObserve) {
//       this.attrs.set(attrKey, this.attrsToObserve[attrKey](this.getAttribute(attrKey)) as any);
//     }
//   }
//   async ready() {}
//   connectedCallback() { this.updateAttributes(); this.ready(); }
//   attributeChangedCallback() { this.updateAttributes() }
// }

type AdvancementIconMap = { [category in AdvancementCategory]: { [advancementName: string]: ["item"|"block", string, "enchanted"?] } }

class MCAdvancement extends HTMLElement {
  
  private static advancementAttributes = ['col','row','ns','done','type'] as const;
  
  // Needed for attributeChangedCallback
  static get observedAttributes() {
    return MCAdvancement.advancementAttributes;
  }

  shadow = this.attachShadow({mode: 'closed'});
  savedAttributes: Record<typeof MCAdvancement.advancementAttributes[number], string | null> = {
    col: null,
    row: null,
    ns: "story/root",
    done: "false",
    type: "normal",
  };

  constructor() {
    super();
  }

  private updateElement(attribute: typeof MCAdvancement.advancementAttributes[number]) {
    //only fires if the attribute not null, meaning only set attributes are used
    if (this.savedAttributes[attribute] !== null) {
      switch (attribute) {
        case 'col':
        case 'row':
          this.style.gridArea = `${this.savedAttributes.row}/${this.savedAttributes.col}/${String(Number(this.savedAttributes.row)+2)}/${String(Number(this.savedAttributes.col)+2)}`;
          break;
        case 'ns':
          //For typescript as savedAttributes['ns'] is string|null
          if (this.savedAttributes['ns']) {
            const nsSplit = (this.savedAttributes['ns']).split("/");
            if (nsSplit.length == 2 && nsSplit[0] in this.advancementIcons && nsSplit[1] in this.advancementIcons[nsSplit[0] as AdvancementCategory]) {
              const mappedArray = this.advancementIcons[nsSplit[0] as AdvancementCategory][nsSplit[1]];
              const enchanted = (mappedArray.includes("enchanted")) ? " enchanted" : "";
              this.shadow.innerHTML = `<mc-item-icon model="${mappedArray[0]}/${mappedArray[1]}"${enchanted}></mc-item-icon>`;
            }
          }
          break;
      }
    }
  }

  get getMiddle() {
    const ownBounds = this.getBoundingClientRect();
    if (this.parentElement != null && this.parentElement.tagName == "DIV") {
      const parentBounds = this.parentElement.getBoundingClientRect();
      const xMiddleRelativeToParent = Math.ceil((ownBounds.x - parentBounds.x + (ownBounds.width / 2)));
      const yMiddleRelativeToParent = Math.ceil((ownBounds.y - parentBounds.y + (ownBounds.height / 2)));
      return {x: xMiddleRelativeToParent, y: yMiddleRelativeToParent, relativeToParent: true};
    } else {
      const xMiddleRelativeToSelf = Math.ceil((ownBounds.x + (ownBounds.width / 2)));
      const yMiddleRelativeToSelf = Math.ceil((ownBounds.y + (ownBounds.height / 2)));
      return {x: xMiddleRelativeToSelf, y: yMiddleRelativeToSelf, relativeToParent: false};
    }
  }

  //When element is added to DOM
  connectedCallback() {
    //Goes through the attributes and updates their respective function
    for (const att of MCAdvancement.advancementAttributes) {
      this.updateElement(att);
    }
  }

  //When an attribute is changed
  attributeChangedCallback(name: typeof MCAdvancement.advancementAttributes[number], _: never, newValue: string) {
    this.savedAttributes[name] = newValue;
    this.updateElement(name);
  }

  private advancementIcons: AdvancementIconMap = {
    story: {root: ["block","grass_block"], mine_stone: ["item","wooden_pickaxe"], upgrade_tools: ["item","stone_pickaxe"], smelt_iron: ["item","iron_ingot"], obtain_armor: ["item","iron_chestplate"], lava_bucket: ["item","lava_bucket"], iron_tools: ["item","iron_pickaxe"], deflect_arrow: ["item","shield"], form_obsidian: ["block","obsidian"], mine_diamond: ["item","diamond"], enter_the_nether: ["item","flint_and_steel"], shiny_gear: ["item","diamond_chestplate"], enchant_item: ["item","enchanted_book","enchanted"], cure_zombie_villager: ["item","golden_apple"], follow_ender_eye: ["item","ender_eye"], enter_the_end: ["block","end_stone"]},
    nether: {root: ["block","red_nether_bricks"], return_to_sender: ["item","fire_charge"], find_bastion: ["block","polished_blackstone_bricks"], obtain_ancient_debris: ["block","ancient_debris"], fast_travel: ["item", "map"], find_fortress: ["block", "nether_bricks"], obtain_crying_obsidian: ["block","crying_obsidian"], distract_piglin: ["item","gold_ingot"], ride_strider: ["item","warped_fungus_on_a_stick"], uneasy_alliance: ["item","ghast_tear"], loot_bastion: ["block","chest"], use_lodestone: ["block","lodestone"], netherite_armor: ["item","netherite_chestplate"], get_wither_skull: ["block","wither_skeleton_skull"], obtain_blaze_rod: ["item","blaze_rod"], charge_respawn_anchor: ["block","respawn_anchor_0"], explore_nether: ["item","netherite_boots"], summon_wither: ["item","nether_star","enchanted"], brew_potion: ["item","uncraftable_potion"], create_beacon: ["block","beacon"], all_potions: ["item","milk_bucket"], create_full_beacon: ["block","beacon"], all_effects: ["item","bucket"]},
    end: {root: ["block","end_stone"], kill_dragon: ["block","dragon_head"], dragon_egg: ["block","dragon_egg"], enter_end_gateway: ["item","ender_pearl"], respawn_dragon: ["item","end_crystal","enchanted"], dragon_breath: ["item","dragon_breath"], find_end_city: ["block","purpur_block"], elytra: ["item","elytra"], levitate: ["item","shulker_shell"]},
    adventure: {root: ["item","map"], voluntary_exile: ["block","ominous_banner"], kill_a_mob: ["item","iron_sword"], trade: ["item","emerald"], honey_block_slide: ["block","honey_block"], ol_betsy: ["item","crossbow"], sleep_in_bed: ["block","red_bed"], hero_of_the_village: ["block","ominous_banner"], throw_trident: ["item","trident"], shoot_arrow: ["item", "bow"], kill_all_mobs: ["item","diamond_sword"], totem_of_undying: ["item","totem_of_undying"], summon_iron_golem: ["block","carved_pumpkin"], two_birds_one_arrow: ["item","crossbow"], whos_the_pillager_now: ["item","crossbow"], arbalistic: ["item","crossbow"], adventuring_time: ["item","diamond_boots"], very_very_frightening: ["item","trident"], sniper_duel: ["item","arrow"], bullseye: ["block","target"]},
    husbandry: {root: ["block","hay_block"], safely_harvest_honey: ["item","honey_bottle"], breed_an_animal: ["item","wheat"], tame_an_animal: ["item","lead"], fishy_business: ["item","fishing_rod"], silk_touch_nest: ["block","bee_nest"], plant_seed: ["item","wheat"], bred_all_animals: ["item","golden_carrot"], complete_catalogue: ["item","cod"], tactical_fishing: ["item","pufferfish_bucket"], balanced_diet: ["item","apple"], obtain_netherite_hoe: ["item","netherite_hoe"]},
  }
}

const advancementCategories = ["story", "nether", "end", "adventure", "husbandry"] as const;
type AdvancementCategory = typeof advancementCategories[number];

type AdvancementViewTemplateSizes = { [category in AdvancementCategory]: { rows: number, columns: number } };
type lineCoordinates = {x1:number,y1:number,x2:number,y2:number};
type polyCoordinates = {x1:number,y1:number,x2:number,y2:number,x3:number,y3:number,x4:number,y4:number};
type templateType = {row: number, col: number, type: "normal"|"challenge"|"goal", children: string[]};
type AdvancementTemplate = Record<AdvancementCategory,Record<string,templateType>>;

class MCAdvancementView extends HTMLElement {
  // Needed for attributeChangedCallback
  static get observedAttributes() {
    return ["category"];
  }

  firstTime = true;
  cachedSVGs: Record<AdvancementCategory,SVGSVGElement|null> = {
    story: null,
    nether: null,
    end: null,
    adventure: null,
    husbandry: null
  }

  constructor() {
    super();
  }

  private cleanOutView() {
    const gridDiv = this.querySelector("mc-advancement-view>div");
    const svgEle = this.querySelector("mc-advancement-view>svg");
    if (gridDiv != null)
      gridDiv.remove();
    if (svgEle != null)
      svgEle.remove();
    this.removeAttribute("style");
  }

  private generateAdvancementDiv(category: AdvancementCategory) {
    const mainGrid = document.createElement("div");
    //Advancement 26px Gap 2px, Advancement = 2 col + 1 Gap, hence Col = x*12px and Gap = x*2px.
    //x=4 for width=1000px
    mainGrid.style.display = "inline-grid";
    mainGrid.style.gridTemplateRows = `repeat(${this.templateSizes[category].rows},48px)`;
    mainGrid.style.gridTemplateColumns = `repeat(${this.templateSizes[category].columns},48px)`;
    mainGrid.style.gap = "8px";
    for (const advancementName in this.advancementTemplates[category]) {
      const advTemplate = this.advancementTemplates[category][advancementName];
      mainGrid.appendChild(this.createAdvancement(category, advancementName, advTemplate.row, advTemplate.col, advTemplate.type));
    }

    return mainGrid;
  }

  private createAdvancement(category: AdvancementCategory, name: string, row: number, col: number, type="normal") {
    const advancementElement = new MCAdvancement();
    advancementElement.setAttribute("ns",`${category}/${name}`);
    advancementElement.setAttribute("type",String(type));
    advancementElement.setAttribute("row",String(row));
    advancementElement.setAttribute("col",String(col));
    return advancementElement;
  }

  //Optimize:false is to render coords list every time
  //Optimize:true is to use a pre rendered list of coords generated for col width 48 and gap 8
  //clean this up
  private generateUnderlaySVG(category: AdvancementCategory, optimise: boolean) {
    const svgEle = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgEle.style.position = "absolute";
    svgEle.innerHTML += `<style>${this.svgStyling}</style>`;

    if (this.querySelector("mc-advancement-view>div") != null) {
      const gridDivBounds = this.querySelector("mc-advancement-view>div")!.getBoundingClientRect();
      svgEle.setAttribute("width",String(gridDivBounds.width));
      svgEle.setAttribute("height",String(gridDivBounds.height)); 
    }

    let coordinatesSet: Set<{type:"polyline",coords:polyCoordinates}|{type:"line",coords:lineCoordinates}> = new Set(); 
    for (const advancementName in this.advancementTemplates[category]) {
      const advTemplate: templateType = this.advancementTemplates[category][advancementName];
      for (const endAdv of advTemplate.children) {
        const linkingCoords = this.getLinkingCoords(category+"/"+advancementName,category+"/"+endAdv)
        if (linkingCoords != null) {
          coordinatesSet.add(linkingCoords);
        }
      } 
    }
    for (const color of ["black","white"]) {
      for (const cGroup of coordinatesSet.values()) {
        if (cGroup.type == "line") {
          const coords = cGroup.coords;
          svgEle.innerHTML += `<line id="${color}" x1="${coords.x1}" y1="${coords.y1}" x2="${coords.x2}" y2="${coords.y2}"></line>`;
        } else if (cGroup.type == "polyline") {
          const coords = cGroup.coords;
          svgEle.innerHTML += `<polyline id="${color}" points="${coords.x1},${coords.y1} ${coords.x2},${coords.y2} ${coords.x3},${coords.y3} ${coords.x4},${coords.y4}"></polyline>`;
        }
      }
    }
    return svgEle
  }

  private getLinkingCoords(advancement1ns: string, advancement2ns: string) {
    const advancement1: MCAdvancement | null = this.querySelector(`mc-advancement[ns="${advancement1ns}"]`);
    const advancement2: MCAdvancement | null = this.querySelector(`mc-advancement[ns="${advancement2ns}"]`);
    if (advancement1 != null && advancement2 != null) {
      let coords: {type:"polyline",coords:polyCoordinates}|{type:"line",coords:lineCoordinates};
      const a1m = advancement1.getMiddle;
      const a2m = advancement2.getMiddle;
      if (a1m.y == a2m.y) {
        coords = {type:"line",coords:{x1:a1m.x, y1:a1m.y, x2:a2m.x, y2:a2m.y}};
      } else {
        const xAvg = Math.ceil((a1m.x + a2m.x)/2);
        coords = {type:"polyline",coords:{x1:a1m.x, y1:a1m.y, x2:xAvg, y2:a1m.y, x3:xAvg, y3:a2m.y, x4: a2m.x, y4: a2m.y}}
      }
      return coords
    } else {
      return null
    }
  }

  private updateElement(category: string) {
    this.cleanOutView();
    if (advancementCategories.includes(category as AdvancementCategory)) {
      this.style.display = "block";
      this.style.textAlign = "center";
      this.style.backgroundImage = `url("./img/gui/${category}_background.png")`;
      this.style.backgroundSize = "64px";
      this.style.padding = "8px";
      const advancementView = this.generateAdvancementDiv(category as AdvancementCategory);
      this.appendChild(advancementView);
      const cachedSVGEle = this.cachedSVGs[category as AdvancementCategory];
      if (cachedSVGEle == null) {
        const svgEle = this.generateUnderlaySVG(category as AdvancementCategory,false);
        this.insertBefore(svgEle,this.querySelector("mc-advancement-view>div"));
        this.cachedSVGs[category as AdvancementCategory] = svgEle
      } else {
        this.insertBefore(cachedSVGEle,this.querySelector("mc-advancement-view>div"));
      }  
    }
  }

  //When element is added to DOM
  connectedCallback() {
    if (this.firstTime)
      this.firstTime = false;
    console.log("connectedCallback");

    const viewStyle = document.createElement("style");
    viewStyle.innerHTML = this.advancementStyling;
    this.appendChild(viewStyle);
    
    const category = this.getAttribute("category");
    if (category != null) {
      this.updateElement(category);
    }
  }

  //When an attribute is changed (IT SEEMS LIKE WHEN TAG IS CREATED, CONSTRUCTOR->ATTRIBUTES->CONNECTED)
  attributeChangedCallback(name: string, _: never, newValue: string) {
    console.log("attributeChangedCallback");
    if (name == "category" && !this.firstTime) {
      const category = newValue;
      this.updateElement(category);
    }
  }

  private readonly advancementTemplates: AdvancementTemplate = {
    "story": {"root": {"row": 4, "col": 1, "type": "normal", "children": ["mine_stone"]}, "mine_stone": {"row": 4, "col": 3, "type": "normal", "children": ["upgrade_tools"]}, "upgrade_tools": {"row": 4, "col": 5, "type": "normal", "children": ["smelt_iron"]}, "smelt_iron": {"row": 4, "col": 7, "type": "normal", "children": ["obtain_armor", "lava_bucket", "iron_tools"]}, "obtain_armor": {"row": 1, "col": 9, "type": "normal", "children": ["deflect_arrow"]}, "lava_bucket": {"row": 3, "col": 9, "type": "normal", "children": ["form_obsidian"]}, "iron_tools": {"row": 6, "col": 9, "type": "normal", "children": ["mine_diamond"]}, "deflect_arrow": {"row": 1, "col": 11, "type": "normal", "children": []}, "form_obsidian": {"row": 3, "col": 11, "type": "normal", "children": ["enter_the_nether"]}, "mine_diamond": {"row": 6, "col": 11, "type": "normal", "children": ["shiny_gear", "enchant_item"]}, "enter_the_nether": {"row": 3, "col": 13, "type": "normal", "children": ["cure_zombie_villager", "follow_ender_eye"]}, "shiny_gear": {"row": 5, "col": 13, "type": "normal", "children": []}, "enchant_item": {"row": 7, "col": 13, "type": "normal", "children": []}, "cure_zombie_villager": {"row": 2, "col": 15, "type": "goal", "children": []}, "follow_ender_eye": {"row": 4, "col": 15, "type": "normal", "children": ["enter_the_end"]}, "enter_the_end": {"row": 4, "col": 17, "type": "normal", "children": []}}, 
    "nether": {"root": {"row": 9, "col": 1, "type": "normal", "children": ["return_to_sender", "find_bastion", "obtain_ancient_debris", "fast_travel", "find_fortress", "obtain_crying_obsidian", "distract_piglin", "ride_strider"]}, "return_to_sender": {"row": 1, "col": 3, "type": "normal", "children": ["uneasy_alliance"]}, "find_bastion": {"row": 3, "col": 3, "type": "normal", "children": ["loot_bastion"]}, "obtain_ancient_debris": {"row": 6, "col": 3, "type": "normal", "children": ["use_lodestone", "netherite_armor"]}, "fast_travel": {"row": 8, "col": 3, "type": "challenge", "children": []}, "find_fortress": {"row": 10, "col": 3, "type": "normal", "children": ["get_wither_skull", "obtain_blaze_rod"]}, "obtain_crying_obsidian": {"row": 13, "col": 3, "type": "normal", "children": ["charge_respawn_anchor"]}, "distract_piglin": {"row": 15, "col": 3, "type": "normal", "children": []}, "ride_strider": {"row": 17, "col": 3, "type": "normal", "children": ["explore_nether"]}, "uneasy_alliance": {"row": 1, "col": 5, "type": "challenge", "children": []}, "loot_bastion": {"row": 3, "col": 5, "type": "normal", "children": []}, "use_lodestone": {"row": 5, "col": 5, "type": "normal", "children": []}, "netherite_armor": {"row": 7, "col": 5, "type": "challenge", "children": []}, "get_wither_skull": {"row": 9, "col": 5, "type": "normal", "children": ["summon_wither"]}, "obtain_blaze_rod": {"row": 11, "col": 5, "type": "normal", "children": ["brew_potion"]}, "charge_respawn_anchor": {"row": 13, "col": 5, "type": "normal", "children": []}, "explore_nether": {"row": 17, "col": 5, "type": "challenge", "children": []}, "summon_wither": {"row": 9, "col": 7, "type": "normal", "children": ["create_beacon"]}, "brew_potion": {"row": 11, "col": 7, "type": "normal", "children": ["all_potions"]}, "create_beacon": {"row": 9, "col": 9, "type": "normal", "children": ["create_full_beacon"]}, "all_potions": {"row": 11, "col": 9, "type": "challenge", "children": ["all_effects"]}, "create_full_beacon": {"row": 9, "col": 11, "type": "goal", "children": []}, "all_effects": {"row": 11, "col": 11, "type": "challenge", "children": []}}, 
    "end": {"root": {"row": 4, "col": 1, "type": "normal", "children": ["kill_dragon"]}, "kill_dragon": {"row": 4, "col": 3, "type": "normal", "children": ["dragon_egg", "enter_end_gateway", "respawn_dragon", "dragon_breath"]}, "dragon_egg": {"row": 1, "col": 5, "type": "goal", "children": []}, "enter_end_gateway": {"row": 3, "col": 5, "type": "normal", "children": ["find_end_city"]}, "respawn_dragon": {"row": 5, "col": 5, "type": "goal", "children": []}, "dragon_breath": {"row": 7, "col": 5, "type": "goal", "children": []}, "find_end_city": {"row": 3, "col": 7, "type": "normal", "children": ["elytra", "levitate"]}, "elytra": {"row": 2, "col": 9, "type": "normal", "children": []}, "levitate": {"row": 4, "col": 9, "type": "challenge", "children": []}}, 
    "adventure": {"root": {"row": 11, "col": 1, "type": "normal", "children": ["voluntary_exile", "kill_a_mob", "trade", "honey_block_slide", "ol_betsy", "sleep_in_bed"]}, "voluntary_exile": {"row": 1, "col": 3, "type": "normal", "children": ["hero_of_the_village"]}, "kill_a_mob": {"row": 7, "col": 3, "type": "normal", "children": ["throw_trident", "shoot_arrow", "kill_all_mobs", "totem_of_undying"]}, "trade": {"row": 12, "col": 3, "type": "normal", "children": ["summon_iron_golem"]}, "honey_block_slide": {"row": 14, "col": 3, "type": "normal", "children": []}, "ol_betsy": {"row": 16, "col": 3, "type": "normal", "children": ["two_birds_one_arrow", "whos_the_pillager_now", "arbalistic"]}, "sleep_in_bed": {"row": 20, "col": 3, "type": "normal", "children": ["adventuring_time"]}, "hero_of_the_village": {"row": 1, "col": 5, "type": "challenge", "children": []}, "throw_trident": {"row": 3, "col": 5, "type": "normal", "children": ["very_very_frightening"]}, "shoot_arrow": {"row": 6, "col": 5, "type": "normal", "children": ["sniper_duel", "bullseye"]}, "kill_all_mobs": {"row": 8, "col": 5, "type": "challenge", "children": []}, "totem_of_undying": {"row": 10, "col": 5, "type": "goal", "children": []}, "summon_iron_golem": {"row": 12, "col": 5, "type": "goal", "children": []}, "two_birds_one_arrow": {"row": 14, "col": 5, "type": "challenge", "children": []}, "whos_the_pillager_now": {"row": 16, "col": 5, "type": "normal", "children": []}, "arbalistic": {"row": 18, "col": 5, "type": "challenge", "children": []}, "adventuring_time": {"row": 20, "col": 5, "type": "challenge", "children": []}, "very_very_frightening": {"row": 3, "col": 7, "type": "normal", "children": []}, "sniper_duel": {"row": 5, "col": 7, "type": "challenge", "children": []}, "bullseye": {"row": 7, "col": 7, "type": "challenge", "children": []}}, 
    "husbandry": {"root": {"row": 6, "col": 1, "type": "normal", "children": ["safely_harvest_honey", "breed_an_animal", "tame_an_animal", "fishy_business", "silk_touch_nest", "plant_seed"]}, "safely_harvest_honey": {"row": 1, "col": 3, "type": "normal", "children": []}, "breed_an_animal": {"row": 3, "col": 3, "type": "normal", "children": ["bred_all_animals"]}, "tame_an_animal": {"row": 5, "col": 3, "type": "normal", "children": ["complete_catalogue"]}, "fishy_business": {"row": 7, "col": 3, "type": "normal", "children": ["tactical_fishing"]}, "silk_touch_nest": {"row": 9, "col": 3, "type": "normal", "children": []}, "plant_seed": {"row": 11, "col": 3, "type": "normal", "children": ["balanced_diet", "obtain_netherite_hoe"]}, "bred_all_animals": {"row": 3, "col": 5, "type": "challenge", "children": []}, "complete_catalogue": {"row": 5, "col": 5, "type": "challenge", "children": []}, "tactical_fishing": {"row": 7, "col": 5, "type": "normal", "children": []}, "balanced_diet": {"row": 10, "col": 5, "type": "challenge", "children": []}, "obtain_netherite_hoe": {"row": 12, "col": 5, "type": "challenge", "children": []}}
  };

  private readonly templateSizes: AdvancementViewTemplateSizes = {
    story: {rows: 8, columns: 18},
    nether: {rows: 18, columns: 12},
    end: {rows: 8, columns: 10},
    adventure: {rows: 21, columns: 8},
    husbandry: {rows: 13, columns: 6}
  };

  //ALL SIZING WILL BE REDONE AND THIS IS STILL BASIC STYLING
  private readonly advancementStyling = `
    mc-advancement {
      display: inline-block;
      padding: 20px;
      background-size: cover;
      background-image: url(./img/gui/advancement-normal.png);
      filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.7));
    }

    mc-advancement[type="challenge"] {
      background-image: url(./img/gui/advancement-challenge.png);
    }

    mc-advancement[type="goal"] {
      background-image: url(./img/gui/advancement-goal.png);
    }

    mc-advancement[done="true"] {
      background-image: url(./img/gui/advancement-normal-done.png);
    }

    mc-advancement[done="true"][type="goal"] {
      background-image: url(./img/gui/advancement-goal-done.png);
    }

    mc-advancement[done="true"][type="challenge"] {
      background-image: url(./img/gui/advancement-challenge-done.png);
    }
  `

  private readonly svgStyling = `
    line, polyline {
      stroke-linecap: square;
      stroke-linejoin: miter;
      fill: none;
    }

    line#black, polyline#black {
      stroke: rgb(0,0,0);
      stroke-width: 12;
    }

    line#white, polyline#white {
      stroke: rgb(255,255,255);
      stroke-width: 4;
    }
  `
}

const webRoot = `${(document.currentScript as HTMLScriptElement).src}/../../`;
const currentResourcePack = "vanilla";

function namespacedResource(pack: string, section: string, namespacedId: string, extension: string) {
  if (namespacedId === null || namespacedId === undefined)
    return "/__null";
  const namespaceSplit = namespacedId.includes(":") ? namespacedId.split(":") : [ "minecraft", namespacedId ];
  return `${webRoot}resourcepacks/${pack}/assets/${namespaceSplit[0]}/${section}/${namespaceSplit[1]}.${extension}`;
}

interface JSONModel {
  gui_light?: "front" | "side";
  display?: {
    gui: {
      // [x,y,z]
      translation: [number, number, number];
      rotation: [number, number, number];
      scale: [number, number, number];
    };
  };
  parent?: string;
  textures?: {
    // value is a Minecraft Namespaced ID or #variableName
    [variableName: string]: string;
  };
  elements?: {
    from: [number, number, number];
    to: [number, number, number];
    faces?: {
      [K in "north" | "south" | "east" | "west" | "up" | "down"]?: {
        // texture: Minecraft Namespaced ID or #variableName
        texture: string;
        uv?: [number, number, number, number];
      };
    };
  }[];
}

const __jsonModelCache = new OnceCache<Promise<JSONModel>>();
const __modelCache = new OnceCache<{model: JSONModel, elements: string[]}>();

class MCItemIcon extends HTMLElement {

  static get observedAttributes() {
    return ["model", "enchanted"] as const;
  }

  private shadow: ShadowRoot
    = this.attachShadow({mode: "open"});
  private renderer: CSSRenderer
    = document.createElement("css-renderer") as CSSRenderer;
  private innerStyle: HTMLStyleElement
    = document.createElement("style");
  private isUpdating: boolean
    = false;
  private baseBlockModel: JSONModel
    = {
      gui_light: "side",
      display: {
        gui: {
          rotation: [30,225,0],
          translation: [0,0,0],
          scale: [0.625,0.625,0.625]
        }
      },
      elements: [{
        from: [0,0,0],
        to: [16,16,16],
      }]
    };
  private baseItemModel: JSONModel
    = {
      gui_light: "front",
      display: {
        gui: {
          rotation: [0,180,0],
          translation: [0,0,0],
          scale: [1,1,1]
        }
      },
      elements: [{
        from: [0,0,8],
        to: [16,16,8],
        faces: {
          south: {
            texture: "#layer0"
          }
        }
      }],
    };

  constructor() {
    super();
    this.shadow.append(
      this.innerStyle,
      this.renderer,
    );
  }

  connectedCallback() { this.attributeChangedCallback() }

  // need to cache merged model maybe for when update() is called
  private async attributeChangedCallback() {
    if (this.isUpdating) return;
    this.isUpdating = true;
    const modelAttr = this.getAttribute("model");
    if (!modelAttr) return;
    this.style.display = "block";
    this.style.width = "100%";
    this.style.height = "100%";
    this.style.position = "relative";
    // const res = parseFloat(this.getAttribute("res") || "20");
    // font size can be set to be this inner height
    this.innerStyle.textContent
      = `css-renderer{font-size:${this.clientHeight||64}px;}`;
    this.renderer.rootOrigin.innerHTML = "";
    if (__modelCache.has(modelAttr)) {
      const cachedModel = __modelCache.get(modelAttr)!;
      this.renderer.setAttribute("rotate", cachedModel.model?.display?.gui.rotation.join(",")!);
      this.renderer.setAttribute("scale", cachedModel.model?.display?.gui.scale.join(",")!);
      this.renderer.setAttribute("translate", cachedModel.model?.display?.gui.translation.join(",")!);
      for (const ele of cachedModel.elements) {
        this.renderer.rootOrigin.insertAdjacentHTML("beforeend", ele);
      }
    } else {
      const model = await this.resolveModel(this.getAttribute("model") || null);
      // move render camera
      this.renderer.setAttribute("rotate", model?.display?.["gui"].rotation.join(",")!);
      this.renderer.setAttribute("scale", model?.display?.["gui"].scale.join(",")!);
      this.renderer.setAttribute("translate", model?.display?.["gui"].translation.join(",")!);
      // go through each element, and add it to renderer
      const elements: string[] = [];
      for (const modelElement of model["elements"]!) {
        const ele = document.createElement("css-renderer-element") as CSSRElement;
        if ((model.gui_light || "front") == "front") ele.setAttribute("noshade", "");
        ele.setAttribute("from", modelElement.from.join(","));
        ele.setAttribute("to", modelElement.to.join(","));
        // each tests for face.texture to see if its blank texture
        if (modelElement.faces?.north && modelElement.faces.north.texture) {
          ele.north = await this.getTexture(modelElement.faces.north.texture);
          ele.northUV = modelElement.faces.north.uv || [0,0,16,16];
        }
        if (modelElement.faces?.south && modelElement.faces.south.texture) {
          ele.south = await this.getTexture(modelElement.faces.south.texture);
          ele.southUV = modelElement.faces.south.uv || [0,0,16,16];
        }
        if (modelElement.faces?.east && modelElement.faces.east.texture) {
          ele.east = await this.getTexture(modelElement.faces.east.texture);
          ele.eastUV = modelElement.faces.east.uv || [0,0,16,16];
        }
        if (modelElement.faces?.west && modelElement.faces.west.texture) {
          ele.west = await this.getTexture(modelElement.faces.west.texture);
          ele.westUV = modelElement.faces.west.uv || [0,0,16,16];
        }
        if (modelElement.faces?.up && modelElement.faces.up.texture) {
          ele.up = await this.getTexture(modelElement.faces.up.texture);
          ele.upUV = modelElement.faces.up.uv || [0,0,16,16];
        }
        if (modelElement.faces?.down && modelElement.faces.down.texture) {
          ele.down = await this.getTexture(modelElement.faces.down.texture);
          ele.downUV = modelElement.faces.down.uv || [0,0,16,16];
        }
        elements.push(ele.outerHTML);
      }
      __modelCache.add(modelAttr, {model, elements});
      for (const ele of elements) {
        this.renderer.rootOrigin.insertAdjacentHTML("beforeend", ele);
      }
    }
    for (const ele of this.renderer.rootOrigin.querySelectorAll("css-renderer-plane")) {
      (ele as CSSRPlane).overlay
        = this.hasAttribute("enchanted")
        ? "../resourcepacks/vanilla/assets/minecraft/textures/misc/enchanted_item_glint.png"
        : null;
      (ele as CSSRPlane).overlayStyle
        = "css-renderer-overlay {"
        +   "mix-blend-mode: screen;"
        +   "background-size: 400%;"
        +   "animation: 20s linear infinite enchantGlint;"
        + "}"
        + "@keyframes enchantGlint {"
        +   "from { background-position: 0% 0% }"
        +   "to { background-position: 400% 400% }"
        + "}";
    }
    
    this.isUpdating = false;
  }

  // provide default model
  // resolve to a merged model
  private async resolveModel(namespacedId: string | null) {
    if (namespacedId === null) return this.baseItemModel;
    let modelFilename = namespacedResource("vanilla", "models", namespacedId, "json");
    let modelRes = await loadUrl(modelFilename);
    const modelTree: JSONModel[] = [];
    // get heirachy into tree
    if (modelRes !== null) {
      let currModel = await __jsonModelCache.add(modelFilename, ()=>modelRes!.json());
      modelTree.unshift(currModel);
      while (currModel["parent"]) {
        modelFilename = namespacedResource("vanilla", "models", currModel["parent"], "json");
        modelRes = await loadUrl(modelFilename);
        if (modelRes === null) break;
        currModel = await __jsonModelCache.add(modelFilename, ()=>modelRes!.json());
        modelTree.unshift(currModel);
      }
    }
    // add in a basic model as a placeholder if nothing found
    modelTree.unshift(namespacedId.includes("block/") ? this.baseBlockModel : this.baseItemModel);
    // merge tree into mergedModel
    const mergedModel: JSONModel = { textures: {} };
    for (const model of modelTree) {
      for (const texture in model["textures"])
        mergedModel["textures"]![texture] = model["textures"][texture];
      if (model["display"]) mergedModel["display"] = { ...mergedModel["display"], ...JSON.parse(JSON.stringify(model["display"])) };
      if (model["elements"]) mergedModel["elements"] = JSON.parse(JSON.stringify(model["elements"]));
      if (model["gui_light"]) mergedModel["gui_light"] = model["gui_light"];
    }
    // preprocess textures
    for (const modelElement of mergedModel["elements"]!) {
      let done = false;
      while (!done) {
        done = true;
        for (const faceKey in modelElement["faces"]) {
          //@ts-ignore
          const face = modelElement["faces"][faceKey];
          if (face.texture.startsWith("#")) {
            done = false;
            // set blank texture
            face.texture = mergedModel["textures"]![face.texture.slice(1)] || "";
          }
        }
      }
    }
    return mergedModel;
  }

  private async getTexture(namespacedId: string) {
    const textureFilename = namespacedResource(currentResourcePack, "textures", namespacedId, "png");
    const fallbackTextureFilename = namespacedResource("vanilla", "textures", namespacedId, "png");
    const texture = await loadUrl(textureFilename);
    if (texture !== null)
      return textureFilename;
    else
      return fallbackTextureFilename;
  }
}

customElements.define('mc-advancement', MCAdvancement);
customElements.define('mc-advancement-view', MCAdvancementView);
customElements.define('mc-item-icon', MCItemIcon);
