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
              this.shadow.innerHTML = `<mc-item-icon type="${mappedArray[0]}" name="${mappedArray[1]}" res="48"${enchanted}></mc-item-icon>`;
            }
          }
          break;
      }
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

  advancementIcons: AdvancementIconMap = {
    story: {root: ["block","grass_block"], mine_stone: ["item","wooden_pickaxe"], upgrade_tools: ["item","stone_pickaxe"], smelt_iron: ["item","iron_ingot"], obtain_armor: ["item","iron_chestplate"], lava_bucket: ["item","lava_bucket"], iron_tools: ["item","iron_pickaxe"], deflect_arrow: ["item","shield"], form_obsidian: ["block","obsidian"], mine_diamond: ["item","diamond"], enter_the_nether: ["item","flint_and_steel"], shiny_gear: ["item","diamond_chesplate"], enchant_item: ["item","enchanted_book","enchanted"], cure_zombie_villager: ["item","golden_apple"], follow_ender_eye: ["item","eye_of_ender"], enter_the_end: ["block","end_stone"]},
    nether: {root: ["block","red_nether_bricks"], return_to_sender: ["item","fire_charge"], find_bastion: ["block","polished_blackstone_bricks"], obtain_ancient_debris: ["block","ancient_debris"], fast_travel: ["item", "map"], find_fortress: ["block", "nether_bricks"], obtain_crying_obsidian: ["block","crying_obsidian"], distract_piglin: ["item","gold_ingot"], ride_strider: ["item","warped_fungus_on_a_stick"], uneasy_alliance: ["item","ghast_tear"], loot_bastion: ["item","chest"], use_lodestone: ["block","lodestone"], netherite_armor: ["item","netherite_chestplate"], get_wither_skull: ["item","wither_skeleton_skull"], obtain_blaze_rod: ["item","blaze_rod"], charge_respawn_anchor: ["block","respawn_anchor"], explore_nether: ["item","netherite_boots"], summon_wither: ["item","nether_star","enchanted"], brew_potion: ["item","uncraftable_potion"], create_beacon: ["block","beacon"], all_potions: ["item","milk_bucket"], create_full_beacon: ["block","beacon"], all_effects: ["item","bucket"]},
    end: {root: ["block","end_stone"], kill_dragon: ["item","dragon_head"], dragon_egg: ["item","dragon_egg"], enter_end_gateway: ["item","ender_pearl"], respawn_dragon: ["item","end_crystal","enchanted"], dragon_breath: ["item","dragon_breath"], find_end_city: ["block","purpur_block"], elytra: ["item","elytra"], levitate: ["item","shulker_shell"]},
    adventure: {root: ["item","map"], voluntary_exile: ["item","ominous_banner"], kill_a_mob: ["item","iron_sword"], trade: ["item","emerald"], honey_block_slide: ["block","honey_block"], ol_betsy: ["item","crossbow"], sleep_in_bed: ["item","red_bed"], hero_of_the_village: ["item","ominous_banner"], throw_trident: ["item","trident"], shoot_arrow: ["item", "bow"], kill_all_mobs: ["item","diamond_sword"], totem_of_undying: ["item","totem_of_undying"], summon_iron_golem: ["block","carved_pumpkin"], two_birds_one_arrow: ["item","crossbow"], whos_the_pillager_now: ["item","crossbow"], arbalistic: ["item","crossbow"], adventuring_time: ["item","diamond_boots"], very_very_frightening: ["item","trident"], sniper_duel: ["item","arrow"], bullseye: ["block","target"]},
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

class MCAdvancementContainer extends HTMLElement {
  // Needed for attributeChangedCallback
  static get observedAttributes() {
    return ["category"];
  }

  constructor() {
    super();
  }


  private generateAdvancementDiv(category: AdvancementCategory) {
    const mainGrid = document.createElement("div");
    mainGrid.style.display = "grid";
    mainGrid.style.gridTemplateRows = `repeat(${this.templateSizes[category].rows},20px)`;
    mainGrid.style.gridTemplateColumns = `repeat(${this.templateSizes[category].columns},20px)`;
    mainGrid.style.gap = "10px";
    
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

  //When element is added to DOM
  connectedCallback() {
    const gridDiv = this.querySelector("div");
    if (gridDiv != null)
      gridDiv.remove();

    const containerStyle = document.createElement("style");
    containerStyle.innerHTML = this.advancementStyling;
    this.appendChild(containerStyle);
    
    const category = this.getAttribute("category");
    if (category as any in advancementCategories) {
      const advancementContainer = this.generateAdvancementDiv(category as AdvancementCategory);
      this.appendChild(advancementContainer);
    }
  }

  //When an attribute is changed (IT SEEMS LIKE WHEN TAG IS CREATED, CONSTRUCTOR->ATTRIBUTES->CONNECTED)
  attributeChangedCallback(name: string, _: never, newValue: string) {
    if (name == "category") {
      const category = newValue;
      const gridDiv = this.querySelector("div");
      if (gridDiv)
        gridDiv.remove();

      if (category as any in advancementCategories) {
        const advancementContainer = this.generateAdvancementDiv(category as AdvancementCategory);
        this.appendChild(advancementContainer);
      }
    }
  }

  //Not sure how to solve this issue, i tried making it as small footprint as possible, other option is to use the actual elements as template, but i feel thats ALOT more
  templates: AdvancementContainerTemplate = {
    story: [["root",4,1],["mine_stone",4,3],["upgrade_tools",4,5],["smelt_iron",4,7],["obtain_armor",1,9],["lava_bucket",3,9],["iron_tools",6,9],["deflect_arrow",1,11],["form_obsidian",3,11],["mine_diamond",6,11],["enter_the_nether",3,13],["shiny_gear",5,13],["enchant_item",7,13],["cure_zombie_villager",2,15,"goal"],["follow_ender_eye",4,15],["enter_the_end",4,17]],
    nether: [["root",9,1],["return_to_sender",1,3],["find_bastion",3,3],["obtain_ancient_debris",6,3],["fast_travel",8,3,"challenge"],["find_fortress",10,3],["obtain_crying_obsidian",13,3],["distract_piglin",15,3],["ride_strider",17,3],["uneasy_alliance",1,5,"challenge"],["loot_bastion",3,5],["use_lodestone",5,5],["netherite_armor",7,5,"challenge"],["get_wither_skull",9,5],["obtain_blaze_rod",11,5],["charge_respawn_anchor",13,5],["explore_nether",17,5,"challenge"],["summon_wither",9,7],["brew_potion",11,7],["create_beacon",9,9],["all_potions",11,9,"challenge"],["create_full_beacon",9,11,"goal"],["all_effects",11,11,"challenge"]],
    end: [["root",4,1],["kill_dragon",4,3],["dragon_egg",1,5,"goal"],["enter_end_gateway",3,5],["respawn_dragon",5,5,"goal"],["dragon_breath",7,5,"goal"],["find_end_city",3,7],["elytra",2,9],["levitate",4,9,"challenge"]],
    adventure: [["root",11,1],["voluntary_exile",1,3],["kill_a_mob",7,3],["trade",12,3],["honey_block_slide",14,3],["ol_betsy",16,3],["sleep_in_bed",20,3],["hero_of_the_village",1,5,"challenge"],["throw_trident",3,5],["shoot_arrow",6,5],["kill_all_mobs",8,5,"challenge"],["totem_of_undying",10,5,"goal"],["summon_iron_golem",12,5,"goal"],["two_birds_one_arrow",14,5,"challenge"],["whos_the_pillager_now",16,5],["arbalistic",18,5,"challenge"],["adventuring_time",20,5,"challenge"],["very_very_frightening",3,7],["sniper_duel",5,7,"challenge"],["bullseye",7,7,"challenge"]],
    husbandry: [["root",6,1],["safely_harvest_honey",1,3],["breed_an_animal",3,3],["tame_an_animal",5,3],["fishy_business",7,3],["silk_touch_nest",9,3],["plant_seed",11,3],["bred_all_animals",3,5,"challenge"],["complete_catalogue",5,5,"challenge"],["tactical_fishing",7,5],["balanced_diet",10,5,"challenge"],["obtain_netherite_hoe",12,5,"challenge"]],
  };

  templateSizes: AdvancementContainerTemplateSizes = {
    story: {rows: 8, columns: 18},
    nether: {rows: 18, columns: 12},
    end: {rows: 8, columns: 10},
    adventure: {rows: 21, columns: 8},
    husbandry: {rows: 13, columns: 6}
  }



  //ALL SIZING WILL BE REDONE AND THIS IS STILL BASIC STYLING
  advancementStyling = `
    mc-advancement {
      padding: 3px;
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
}

interface MCItemIconOptions {
  type: "block" | "item";
  name: string;
  enchanted?: true;
}

const imageDir = (document.currentScript as HTMLScriptElement).src+"/../../img/";
const faces = {
  top: {
    topLeft:      new UVCoord(0.50,0.000),
    bottomLeft:   new UVCoord(0.05,0.225),
    bottomRight:  new UVCoord(0.50,0.450),
    topRight:     new UVCoord(0.95,0.225),
  },
  left: {
    topLeft:      new UVCoord(0.05,0.225),
    bottomLeft:   new UVCoord(0.05,0.775),
    bottomRight:  new UVCoord(0.50,1.000),
    topRight:     new UVCoord(0.50,0.450),
  },
  right: {
    topLeft:      new UVCoord(0.50,0.450),
    bottomLeft:   new UVCoord(0.50,1.000),
    bottomRight:  new UVCoord(0.95,0.775),
    topRight:     new UVCoord(0.95,0.225),
  },
  flat: {
    topLeft:      new UVCoord(0.00,0.000),
    bottomLeft:   new UVCoord(0.00,1.000),
    bottomRight:  new UVCoord(1.00,1.000),
    topRight:     new UVCoord(1.00,0.000),
  },
} as const;

const faceTextures: Record<string,{top:string,left?:string,right?:string}> = {
  cobblestone: {
    top: `${imageDir}block/cobblestone.png`,
  },
};

class MCItemIcon extends HTMLElement {

  static get observedAttributes() {
    return ["name", "type", "enchanted", "res"] as const;
  }

  private shadow: ShadowRoot;
  private itemCanvas: HTMLCanvasElement;
  private renderer: Renderer | null = null;
  private displayType: "block" | "item" | "none" = "none";
  private itemName: string = "";
  private enchanted: boolean = false;
  private defaultRes = 256;
  private resolution: number = this.defaultRes;

  constructor() {
    super();
    this.shadow = this.attachShadow({mode: "closed"});
    this.itemCanvas = document.createElement("canvas");
    
    const style = document.createElement("style");
    style.textContent = `
      canvas {
        width: 100%;
        height: 100%;
      }
    `;
    this.shadow.append(style, this.itemCanvas);
  }

  private async drawCanvas() {
    if (this.displayType == "block") {
      const [topTexture, leftTexture, rightTexture] = await Promise.all([
        loadTexture(faceTextures[this.itemName].top),
        faceTextures[this.itemName].left != undefined ? loadTexture(faceTextures[this.itemName].left!) : null,
        faceTextures[this.itemName].right != undefined ? loadTexture(faceTextures[this.itemName].right!) : null,
      ]);
      this.renderer!.renderQuad(faces.top, topTexture);
      this.renderer!.renderQuad(faces.left, leftTexture ?? topTexture, (colour, coord)=>{
        return brightness(colour, 0.8);
      });
      this.renderer!.renderQuad(faces.right, rightTexture ?? topTexture, (colour, coord)=>{
        return brightness(colour, 0.6);
      });
    }
    else if (this.displayType == "item") {
      const itemTexture = await loadTexture(faceTextures[this.itemName].top);
      this.renderer!.renderQuad(faces.flat, itemTexture);
    }
    else {
      const itemTexture = await loadTexture(`${imageDir}block/missing.png`);
      this.renderer!.renderQuad(faces.flat, itemTexture);
    }
  }

  connectedCallback() {
    const typeAttr = this.getAttribute("type");
    const nameAttr = this.getAttribute("name") || "";
    this.resolution = Number(this.getAttribute("res")) || this.defaultRes;
    this.enchanted = this.hasAttribute("enchanted");
    if (typeAttr == "block" || typeAttr == "item")
      this.displayType = typeAttr;
    if (nameAttr in faceTextures)
      this.itemName = nameAttr;
    else
      this.displayType = "none";

    this.itemCanvas.width = this.resolution;
    this.itemCanvas.height = this.resolution;
    this.renderer = new Renderer(this.itemCanvas);
    this.drawCanvas();
  }

  attributeChangedCallback(attrName: typeof MCItemIcon["observedAttributes"][number], oldVal: string, newVal: string) {
    switch (attrName) {
      case "type":
        if (newVal == "block" || newVal == "item")
          this.displayType = newVal;
        break;
      case "name":
        if (newVal in Object.keys(faceTextures))
          this.itemName = newVal;
        else
          this.displayType = "none";
        break;
      case "enchanted":
        this.enchanted = this.hasAttribute("enchanted");
        break;
      case "res":
        this.resolution = Number(this.getAttribute("res")) || this.defaultRes;
        break;
    }
  }

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
