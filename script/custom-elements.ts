type AdvancementIconMap = { [category in AdvancementCategory]: { [advancementName: string]: ["item"|"block", string, "enchanted"?] } }

class MCAdvancement extends HTMLElement {
  
  private static advancementAttributes = ['col','row','ns','done','type'] as const;
  
  // Needed for attributeChangedCallback
  static get observedAttributes() {
    return MCAdvancement.advancementAttributes;
  }

  shadow = this.attachShadow({mode: 'open'});
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
              //this.shadow.innerHTML = `<mc-item-icon type="${mappedArray[0]}" name="${mappedArray[1]}"${enchanted}></mc-item-icon>`;
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
    nether: {root: ["block","red_nether_bricks"], return_to_sender: ["item","fire_charge"], find_bastion: ["block","polished_blackstone_bricks"], obtain_ancient_debris: ["block","ancient_debris"], fast_travel: ["item", "map"], find_fortress: ["block", "nether_bricks"], obtain_crying_obsidian: ["block","crying_obsidian"], distract_piglin: ["item","gold_ingot"], ride_strider: ["item","warped_fungus_on_a_stick"], uneasy_alliance: ["item","ghast_tear"], loot_bastion: ["item","chest"], use_lodestone: ["block","lodestone"], netherite_armor: ["item","netherite_chestplate"], get_wither_skull: ["item","wither_skeleton_skull"], obtain_blaze_rod: ["item","blaze_rod"], charge_respawn_anchor: ["block","respawn_anchor_0"], explore_nether: ["item","netherite_boots"], summon_wither: ["item","nether_star","enchanted"], brew_potion: ["item","uncraftable_potion"], create_beacon: ["block","beacon"], all_potions: ["item","milk_bucket"], create_full_beacon: ["block","beacon"], all_effects: ["item","bucket"]},
    end: {root: ["block","end_stone"], kill_dragon: ["item","dragon_head"], dragon_egg: ["item","dragon_egg"], enter_end_gateway: ["item","ender_pearl"], respawn_dragon: ["item","end_crystal","enchanted"], dragon_breath: ["item","dragon_breath"], find_end_city: ["block","purpur_block"], elytra: ["item","elytra"], levitate: ["item","shulker_shell"]},
    adventure: {root: ["item","map"], voluntary_exile: ["item","ominous_banner"], kill_a_mob: ["item","iron_sword"], trade: ["item","emerald"], honey_block_slide: ["block","honey_block"], ol_betsy: ["item","crossbow_standby"], sleep_in_bed: ["item","red_bed"], hero_of_the_village: ["item","ominous_banner"], throw_trident: ["item","trident"], shoot_arrow: ["item", "bow"], kill_all_mobs: ["item","diamond_sword"], totem_of_undying: ["item","totem_of_undying"], summon_iron_golem: ["block","carved_pumpkin"], two_birds_one_arrow: ["item","crossbow_standby"], whos_the_pillager_now: ["item","crossbow_standby"], arbalistic: ["item","crossbow_standby"], adventuring_time: ["item","diamond_boots"], very_very_frightening: ["item","trident"], sniper_duel: ["item","arrow"], bullseye: ["block","target"]},
    husbandry: {root: ["block","hay_block"], safely_harvest_honey: ["item","honey_bottle"], breed_an_animal: ["item","wheat"], tame_an_animal: ["item","lead"], fishy_business: ["item","fishing_rod"], silk_touch_nest: ["block","bee_nest"], plant_seed: ["item","wheat"], bred_all_animals: ["item","golden_carrot"], complete_catalogue: ["item","cod"], tactical_fishing: ["item","pufferfish_bucket"], balanced_diet: ["item","apple"], obtain_netherite_hoe: ["item","netherite_hoe"]},
  }
}

const advancementCategories = ["story", "nether", "end", "adventure", "husbandry"] as const;
type AdvancementCategory = typeof advancementCategories[number];
/** [0]: Name of Advancement. e.g. "shiny_gear".  
 *  [1]: Grid Row in the Advancement's Tab.  
 *  [2]: Grid Column in the Advancement's Tab.  
 *  [3]?: Optional Type of Advancement.  
 */
type AdvancementContainerTemplate = { [category in AdvancementCategory]: [string, number, number, string?][] }
type AdvancementContainerTemplateSizes = { [category in AdvancementCategory]: { rows: number, columns: number } }
type lineCoordinates = {x1:number,y1:number,x2:number,y2:number}
type polyCoordinates = {x1:number,y1:number,x2:number,y2:number,x3:number,y3:number,x4:number,y4:number}

class MCAdvancementContainer extends HTMLElement {
  // Needed for attributeChangedCallback
  static get observedAttributes() {
    return ["category"];
  }

  firstTime = true;

  constructor() {
    super();
  }

  private cleanOutContainer() {
    const gridDiv = this.querySelector("mc-advancement-container>div");
    const svgEle = this.querySelector("mc-advancement-container>svg");
    if (gridDiv != null)
      gridDiv.remove();
    if (svgEle != null)
      svgEle.remove();
  }

  private generateAdvancementDiv(category: AdvancementCategory) {
    this.style.display = "block"
    this.style.textAlign = "center"
    const mainGrid = document.createElement("div");
    //Advancement 26px Gap 2px, Advancement = 2 col + 1 Gap, hence Col = x*12px and Gap = x*2px.
    //x=4 for width=1000px
    mainGrid.style.display = "inline-grid";
    mainGrid.style.gridTemplateRows = `repeat(${this.templateSizes[category].rows},48px)`;
    mainGrid.style.gridTemplateColumns = `repeat(${this.templateSizes[category].columns},48px)`;
    mainGrid.style.gap = "8px";
    
    for (let i=0; i<this.templates[category].length; i++) {
      const advTemplate = this.templates[category][i];
      mainGrid.appendChild(this.createAdvancement(category, ...advTemplate));
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
  private generateUnderlaySVG(category: AdvancementCategory|null, optimize: false|true) {
    const svgEle = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgEle.style.position = "absolute";
    svgEle.style.zIndex = "-1";
    svgEle.innerHTML += `<style>${this.svgStyling}</style>`;
    if (this.querySelector("mc-advancement-container>div") != null) {
      const gridDivBounds = this.querySelector("mc-advancement-container>div")!.getBoundingClientRect();
      svgEle.setAttribute("width",String(gridDivBounds.width));
      svgEle.setAttribute("height",String(gridDivBounds.height)); 
    }
    if (category != null && advancementCategories.includes(category)) {
      let coordinatesSet: Set<{type:"polyline",coords:polyCoordinates}|{type:"line",coords:lineCoordinates}> = new Set(); 
      for (const advancementGroup of this.templateLineMap[category]) {
        for (const endAdv of advancementGroup[1]) {
          const linkingCoords = this.getLinkingCoords(category+"/"+advancementGroup[0],category+"/"+endAdv)
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

  //When element is added to DOM
  connectedCallback() {
    if (this.firstTime)
      this.firstTime = false;
    console.log("connectedCallback")
    this.cleanOutContainer()

    const containerStyle = document.createElement("style");
    containerStyle.innerHTML = this.advancementStyling;
    this.appendChild(containerStyle);
    
    const category = this.getAttribute("category");
    if (advancementCategories.includes(category as AdvancementCategory)) {
      const advancementContainer = this.generateAdvancementDiv(category as AdvancementCategory);
      this.appendChild(advancementContainer);
      this.insertBefore(this.generateUnderlaySVG(category as AdvancementCategory,false),this.querySelector("mc-advancement-container>div"));
    }
  }

  //When an attribute is changed (IT SEEMS LIKE WHEN TAG IS CREATED, CONSTRUCTOR->ATTRIBUTES->CONNECTED)
  attributeChangedCallback(name: string, _: never, newValue: string) {
    console.log("attributeChangedCallback")
    if (name == "category" && !this.firstTime) {
      this.cleanOutContainer()

      const category = newValue;
      if (advancementCategories.includes(category as AdvancementCategory)) {
        const advancementContainer = this.generateAdvancementDiv(category as AdvancementCategory);
        this.appendChild(advancementContainer);
        this.insertBefore(this.generateUnderlaySVG(category as AdvancementCategory,false),this.querySelector("mc-advancement-container>div"));
      }
    }
  }

  private readonly templates: AdvancementContainerTemplate = {
    story: [["root",4,1],["mine_stone",4,3],["upgrade_tools",4,5],["smelt_iron",4,7],["obtain_armor",1,9],["lava_bucket",3,9],["iron_tools",6,9],["deflect_arrow",1,11],["form_obsidian",3,11],["mine_diamond",6,11],["enter_the_nether",3,13],["shiny_gear",5,13],["enchant_item",7,13],["cure_zombie_villager",2,15,"goal"],["follow_ender_eye",4,15],["enter_the_end",4,17]],
    nether: [["root",9,1],["return_to_sender",1,3],["find_bastion",3,3],["obtain_ancient_debris",6,3],["fast_travel",8,3,"challenge"],["find_fortress",10,3],["obtain_crying_obsidian",13,3],["distract_piglin",15,3],["ride_strider",17,3],["uneasy_alliance",1,5,"challenge"],["loot_bastion",3,5],["use_lodestone",5,5],["netherite_armor",7,5,"challenge"],["get_wither_skull",9,5],["obtain_blaze_rod",11,5],["charge_respawn_anchor",13,5],["explore_nether",17,5,"challenge"],["summon_wither",9,7],["brew_potion",11,7],["create_beacon",9,9],["all_potions",11,9,"challenge"],["create_full_beacon",9,11,"goal"],["all_effects",11,11,"challenge"]],
    end: [["root",4,1],["kill_dragon",4,3],["dragon_egg",1,5,"goal"],["enter_end_gateway",3,5],["respawn_dragon",5,5,"goal"],["dragon_breath",7,5,"goal"],["find_end_city",3,7],["elytra",2,9],["levitate",4,9,"challenge"]],
    adventure: [["root",11,1],["voluntary_exile",1,3],["kill_a_mob",7,3],["trade",12,3],["honey_block_slide",14,3],["ol_betsy",16,3],["sleep_in_bed",20,3],["hero_of_the_village",1,5,"challenge"],["throw_trident",3,5],["shoot_arrow",6,5],["kill_all_mobs",8,5,"challenge"],["totem_of_undying",10,5,"goal"],["summon_iron_golem",12,5,"goal"],["two_birds_one_arrow",14,5,"challenge"],["whos_the_pillager_now",16,5],["arbalistic",18,5,"challenge"],["adventuring_time",20,5,"challenge"],["very_very_frightening",3,7],["sniper_duel",5,7,"challenge"],["bullseye",7,7,"challenge"]],
    husbandry: [["root",6,1],["safely_harvest_honey",1,3],["breed_an_animal",3,3],["tame_an_animal",5,3],["fishy_business",7,3],["silk_touch_nest",9,3],["plant_seed",11,3],["bred_all_animals",3,5,"challenge"],["complete_catalogue",5,5,"challenge"],["tactical_fishing",7,5],["balanced_diet",10,5,"challenge"],["obtain_netherite_hoe",12,5,"challenge"]],
  };

  private readonly templateSizes: AdvancementContainerTemplateSizes = {
    story: {rows: 8, columns: 18},
    nether: {rows: 18, columns: 12},
    end: {rows: 8, columns: 10},
    adventure: {rows: 21, columns: 8},
    husbandry: {rows: 13, columns: 6}
  };

  private readonly templateLineMap: { [category in AdvancementCategory] : [parentAdv: string, childrenAdv: string[]][]} = {
    story: [["root",["mine_stone"]],["mine_stone",["upgrade_tools"]],["upgrade_tools",["smelt_iron"]],["smelt_iron",["obtain_armor","lava_bucket","iron_tools"]],["obtain_armor",["deflect_arrow"]],["lava_bucket",["form_obsidian"]],["form_obsidian",["enter_the_nether"]],["enter_the_nether",["cure_zombie_villager","follow_ender_eye"]],["follow_ender_eye",["enter_the_end"]],["iron_tools",["mine_diamond"]],["mine_diamond",["shiny_gear","enchant_item"]],],
    nether: [["root",["return_to_sender","find_bastion","obtain_ancient_debris","fast_travel","find_fortress","obtain_crying_obsidian","distract_piglin","ride_strider"]],["return_to_sender",["uneasy_alliance"]],["find_bastion",["loot_bastion"]],["obtain_ancient_debris",["use_lodestone","netherite_armor"]],["find_fortress",["get_wither_skull","obtain_blaze_rod"]],["get_wither_skull",["summon_wither"]],["summon_wither",["create_beacon"]],["create_beacon",["create_full_beacon"]],["obtain_blaze_rod",["brew_potion"]],["brew_potion",["all_potions"]],["all_potions",["all_effects"]],["obtain_crying_obsidian",["charge_respawn_anchor"]],["ride_strider",["explore_nether"]],],
    end: [["root",["kill_dragon"]],["kill_dragon",["dragon_egg","enter_end_gateway","respawn_dragon","dragon_breath"]],["enter_end_gateway",["find_end_city"]],["find_end_city",["elytra","levitate"]],],
    adventure: [["root",["voluntary_exile","kill_a_mob","trade","honey_block_slide","ol_betsy","sleep_in_bed"]],["voluntary_exile",["hero_of_the_village"]],["kill_a_mob",["throw_trident","shoot_arrow","kill_all_mobs","totem_of_undying"]],["throw_trident",["very_very_frightening"]],["shoot_arrow",["sniper_duel","bullseye"]],["trade",["summon_iron_golem"]],["ol_betsy",["two_birds_one_arrow","whos_the_pillager_now","arbalistic"]],["sleep_in_bed",["adventuring_time"]],],
    husbandry: [["root",["safely_harvest_honey","breed_an_animal","tame_an_animal","fishy_business","silk_touch_nest","plant_seed"]],["breed_an_animal",["bred_all_animals"]],["tame_an_animal",["complete_catalogue"]],["fishy_business",["tactical_fishing"]],["plant_seed",["balanced_diet","obtain_netherite_hoe"]],]
  }

  //ALL SIZING WILL BE REDONE AND THIS IS STILL BASIC STYLING
  private readonly advancementStyling = `
    mc-advancement {
      display: inline-block;
      background-size: cover;
      background-image: url(./img/gui/advancement-normal.png);
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

interface MCItemIconOptions {
  type: "block" | "item";
  name: string;
  enchanted?: true;
}

const imageDir = (document.currentScript as HTMLScriptElement).src+"/../../img/";

interface BlocksConfig {
  model: {
    [quadName: string]: [
      [number, number],
      [number, number],
      [number, number],
      [number, number],
    ];
  };
  block: {
    [blockName: string]: [
      [quadName: string, imageName: string],
    ];
  };
};

const blocksConfigPromise: Promise<BlocksConfig> = fetch(`${imageDir}block/blocks.json`).then(v=>{return v.json()});
const itemIconTypes = ["block", "item", "none"] as const;
const itemTextureCache = new Map<string,ImageData|Promise<ImageData>>();

class MCItemIcon extends HTMLElement {

  static get observedAttributes() {
    return ["name", "type", "enchanted", "res"] as const;
  }

  private shadow: ShadowRoot
    = this.attachShadow({mode: "closed"});
  private renderer: Renderer | null
    = null;
  private itemCanvas: HTMLCanvasElement
    = document.createElement("canvas");
  private itemCanvasContext: CanvasRenderingContext2D
    = this.itemCanvas.getContext("2d")!;
  private itemType: typeof itemIconTypes[number]
    = "none";
  private itemName: string
    = "";
  private itemIsEnchanted: boolean
    = false;
  private itemRes: number
    = 48;

  constructor() {
    super();
    const style = document.createElement("style");
    style.textContent = `
      canvas {
        width: 100%;
        height: 100%;
      }
    `;
    this.shadow.append(style, this.itemCanvas);
  }

  private async drawCanvas(itemType: string, itemName: string) {
    const blocksConfig = await blocksConfigPromise;
    if (itemType == "block") {
      const faces = blocksConfig["block"][itemName] ?? [];
      const loadTexturesPromise = [];
      // load textures
      for (const [_, textureName] of faces) {
        if (!itemTextureCache.has(textureName)) {
          if (itemTextureCache.get(textureName) instanceof Promise)
            continue;
          const textureDataPromise = loadTexture(`${imageDir}block/${textureName}.png`);
          itemTextureCache.set(textureName, textureDataPromise);
        }
        const texturePromise = itemTextureCache.get(textureName);
        loadTexturesPromise.push(texturePromise);
      }
      await Promise.all(loadTexturesPromise);
      // draw faces
      for (const [modelName, textureName] of faces) {
        // load texture from cache
        const faceTexture = await itemTextureCache.get(textureName)!;
        let textureFilter: RendererFilter | undefined = undefined;
        if (modelName == "left")
          textureFilter = { brightness: 0.8 };
        else if (modelName == "right")
          textureFilter = { brightness: 0.6 };
        this.renderer!.renderQuad(this.itemCanvasContext, {
          topLeft: blocksConfig["model"][modelName][0] as any,
          topRight: blocksConfig["model"][modelName][3] as any,
          bottomLeft: blocksConfig["model"][modelName][1] as any,
          bottomRight: blocksConfig["model"][modelName][2] as any,
        }, faceTexture, textureFilter);
      }
    }
    else if (itemType == "item") {
      const itemTexturePath = `${imageDir}item/${itemName}.png`;
      if (!itemTextureCache.has(itemTexturePath)) {
        const itemTexturePromise = loadTexture(itemTexturePath);
        itemTextureCache.set(itemTexturePath, itemTexturePromise);
        console.log(itemTexturePath, await itemTexturePromise);
      }
      const itemTexture = await itemTextureCache.get(itemTexturePath)!;
      this.renderer!.renderQuad(this.itemCanvasContext, {
        topLeft: blocksConfig["model"]["flat"][0] as any,
        topRight: blocksConfig["model"]["flat"][3] as any,
        bottomLeft: blocksConfig["model"]["flat"][1] as any,
        bottomRight: blocksConfig["model"]["flat"][2] as any,
      }, itemTexture);
    }
    else {
      if (!itemTextureCache.has("@MISSING@")) {
        const itemTexturePromise = loadTexture(null);
        itemTextureCache.set("@MISSING@", itemTexturePromise);
      }
      const itemTexture = await itemTextureCache.get("@MISSING@")!;
      this.renderer!.renderQuad(this.itemCanvasContext, {
        topLeft: blocksConfig["model"]["flat"][0] as any,
        topRight: blocksConfig["model"]["flat"][3] as any,
        bottomLeft: blocksConfig["model"]["flat"][1] as any,
        bottomRight: blocksConfig["model"]["flat"][2] as any,
      }, itemTexture);
    }
  }

  private updateProperty(key: string) {
    let value: any;
    switch (key) {
      case "type":
        value = this.getAttribute("type");
        if (itemIconTypes.includes(value))
          this.itemType = value;
        break;
      case "name":
        this.itemName = this.getAttribute("name") ?? "";
        break;
      case "enchanted":
        this.itemIsEnchanted = this.hasAttribute("enchanted");
        break;
      case "res":
        value = this.getAttribute("res");
        value > 0
          ? this.itemRes = value
          : 0;
        break;
    }
  }

  connectedCallback() {
    this.updateProperty("name");
    this.updateProperty("type");
    this.updateProperty("res");
    this.updateProperty("enchanted");
    this.itemCanvas.width = this.itemRes;
    this.itemCanvas.height = this.itemRes;
    this.renderer = new Renderer(this.itemCanvas.width, this.itemCanvas.height);
    this.drawCanvas(this.itemType, this.itemName);
  }

  // attributeChangedCallback(attrName: typeof MCItemIcon["observedAttributes"][number], oldVal: string, newVal: string) {
  //   this.updateProperty(attrName);
  // }
}

// new MCItemIcon({ type: "block", name: "cobblestone" });

document.head.insertAdjacentHTML("afterbegin", `
  <style>
    mc-item-icon {
      display: inline-block;
      width: 30em;
      height: 30em;
    }
  </style>
`);

customElements.define('mc-advancement', MCAdvancement);
customElements.define('mc-advancement-container', MCAdvancementContainer);
customElements.define('mc-item-icon', MCItemIcon);
