//@ts-check

class MCAdvancement extends HTMLElement {
  // Needed for attributeChangedCallback
  static get observedAttributes() {
    return ['col','row','ns','done','type','route'];
  }

  constructor() {
    super();
    /** @type {{col: ?string, row: ?string, ns: string, route: string, done: string, type: string}} */
    this.savedAttributes = {
      col: this.getAttribute("col"),
      row: this.getAttribute("row"),
      ns: this.getAttribute("ns") ?? "",
      route: this.getAttribute("route") ?? "./img/",
      done: this.getAttribute("done") ?? "false",
      type: this.getAttribute("type") ?? "normal",
    }

    this.shadow = this.attachShadow({mode: 'open'});

    const advancementImage = document.createElement('img');
    this.shadow.appendChild(advancementImage);
  }

  /** 
   * @private
   * @param {string} attribute - the attribute that has been updated
   */
  updateElement(attribute) {
    //only fires if the attribute not null, meaning only set attributes are used
    if (this.savedAttributes[attribute] !== null) {
      switch (attribute) {
        //ON ELEMENT STYLING MIGHT CHANGED TO BE INSIDE THE PARENTS STYLE TAGS
        case 'col':
        case 'row':
          this.style.gridArea = `${this.savedAttributes.row}/${this.savedAttributes.col}/${String(Number(this.savedAttributes.row)+2)}/${String(Number(this.savedAttributes.col)+2)}`;
          break;
        case 'ns':
        case 'route':
          this.shadowRoot.querySelector("img").src = `${this.savedAttributes.route}${this.savedAttributes.ns}.png`;
          break;
        case 'done':
          //most likely handled by parent style
          break;
        case 'type':
          //most likely handled by parent style
          break;
      }
    }
  }

  //When element is added to DOM
  connectedCallback() {
    //Goes through the attributes and updates their respective function
    for (const att in this.observedAttributes) {
      this.updateElement(att);
    }
  }

  //When an attribute is changed
  attributeChangedCallback(name, _, newValue) {
    this.savedAttributes[name] = newValue;
    this.updateElement(name);
  }
}



class MCAdvancementContainer extends HTMLElement {
  // Needed for attributeChangedCallback
  static get observedAttributes() {
    return ["category"];
  }

  constructor() {
    super();

  }

    /** Creates the advancement grid/table/display
   * @private
   * @param {string} category - the category of achievement
   * @returns {HTMLDivElement}
   */
  generateTable(category) {
    const mainGrid = document.createElement("div");
    mainGrid.style.display = "grid";
    mainGrid.style.gridTemplateRows = `repeat(${this.templateSizes[category].rows},20px)`;
    mainGrid.style.gridTemplateColumns = `repeat(${this.templateSizes[category].columns},20px)`;
    mainGrid.style.gap = "10px";
    
    for (let i=0; i<this.templates[category].length; i++) {
      const advTemplate = this.templates[category][i];
      mainGrid.appendChild(this.createAdvancement(category,...advTemplate));
    }

    return mainGrid;
  }

  /** Creates the advancement element
   * @private
   * @param {string} category - advancement category such as "story"
   * @param {string} name - advancement name such as "shiny_gear"
   * @param {number} row - advancement row/y value
   * @param {number} col - advancement column/x value
   * @param {string} [type] - optional type such as challenge, defaults to normal
   * @returns {MCAdvancement}
   */
  createAdvancement(category,name,row,col,type="normal") {
    //const advancementElement = document.createElement("mc-advancement");
    const advancementElement = new MCAdvancement();
    advancementElement.setAttribute("ns",`${category}/${name}`);
    advancementElement.setAttribute("type",String(type));
    advancementElement.setAttribute("row",String(row));
    advancementElement.setAttribute("col",String(col));
    return advancementElement
  }

  //When element is added to DOM
  connectedCallback() {

    console.log("adv container added to dom")

    const gridDiv = this.querySelector("div") || null;
    if (gridDiv) {gridDiv.remove()}

    const containerStyle = document.createElement("style");
    containerStyle.innerHTML = this.advancementStyling;
    this.appendChild(containerStyle)
    
    const category = this.getAttribute("category");
    if (this.templateSizes[category]) {
      const advancementContainer = this.generateTable(category)
      this.appendChild(advancementContainer)
    }
  }

  //When an attribute is changed (IT SEEMS LIKE WHEN TAG IS CREATED, CONSTRUCTOR->ATTRIBUTES->CONNECTED)
  attributeChangedCallback(name, _, newValue) {
    console.log("adv container changed")
    if (name = "category") {
      const category = newValue
      const gridDiv = this.querySelector("div") || null;
      if (gridDiv) {gridDiv.remove()}
      if (this.templateSizes[category]) {
        const advancementContainer = this.generateTable(category)
        this.appendChild(advancementContainer)
      }
    }
  }

  //Not sure how to solve this issue, i tried making it as small footprint as possible, other option is to use the actual elements as template, but i feel thats ALOT more
  /** @type {{ [category:string]: [name:string, row:number, col:number, type?:string][] }} */
  templates = {
    story: [["root",4,1],["mine_stone",4,3],["upgrade_tools",4,5],["smelt_iron",4,7],["obtain_armor",1,9],["lava_bucket",3,9],["iron_tools",6,9],["deflect_arrow",1,11],["form_obsidian",3,11],["mine_diamond",6,11],["enter_the_nether",3,13],["shiny_gear",5,13],["enchant_item",7,13],["cure_zombie_villager",2,15,"goal"],["follow_ender_eye",4,15],["enter_the_end",4,17]],
    nether: [["root",9,1],["return_to_sender",1,3],["find_bastion",3,3],["obtain_ancient_debris",6,3],["fast_travel",8,3,"challenge"],["find_fortress",10,3],["obtain_crying_obsidian",13,3],["distract_piglin",15,3],["ride_strider",17,3],["uneasy_alliance",1,5,"challenge"],["loot_bastion",3,5],["use_lodestone",5,5],["netherite_armor",7,5,"challenge"],["get_wither_skull",9,5],["obtain_blaze_rod",11,5],["charge_respawn_anchor",13,5],["explore_nether",17,5,"challenge"],["summon_wither",9,7],["brew_potion",11,7],["create_beacon",9,9],["all_potions",11,9,"challenge"],["create_full_beacon",9,11,"goal"],["all_effects",11,11,"challenge"]],
    end: [["root",4,1],["kill_dragon",4,3],["dragon_egg",1,5,"goal"],["enter_end_gateway",3,5],["respawn_dragon",5,5,"goal"],["dragon_breath",7,5,"goal"],["find_end_city",3,7],["elytra",2,9],["levitate",4,9,"challenge"]],
    adventure: [["root",11,1],["voluntary_exile",1,3],["kill_a_mob",7,3],["trade",12,3],["honey_block_slide",14,3],["ol_betsy",16,3],["sleep_in_bed",20,3],["hero_of_the_village",1,5,"challenge"],["throw_trident",3,5],["shoot_arrow",6,5],["kill_all_mobs",8,5,"challenge"],["totem_of_undying",10,5,"goal"],["summon_iron_golem",12,5,"goal"],["two_birds_one_arrow",14,5,"challenge"],["whos_the_pillager_now",16,5],["arbalistic",18,5,"challenge"],["adventuring_time",20,5,"challenge"],["very_very_frightening",3,7],["sniper_duel",5,7,"challenge"],["bullseye",7,7,"challenge"]],
    husbandry: [["root",6,1],["safely_harvest_honey",1,3],["breed_an_animal",3,3],["tame_an_animal",5,3],["fishy_business",7,3],["silk_touch_nest",9,3],["plant_seed",11,3],["bred_all_animals",3,5,"challenge"],["complete_catalogue",5,5,"challenge"],["tactical_fishing",7,5],["balanced_diet",10,5,"challenge"],["obtain_netherite_hoe",12,5,"challenge"]],
  }
  
  /** @type {{ [category:string]: {rows:number, columns:number}}} */
  templateSizes = {
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
      box-sizing: border-box;

      border: 2px #000000;
      border-radius: 4px;

      background-color: #eaeaea;
    }

    mc-advancement[type="challenge"] {}

    mc-advancement[type="goal"] {}

    mc-advancement[done="true"] {
      background-color: #ffd972;
    }
  `
}

customElements.define('mc-advancement', MCAdvancement);
customElements.define('mc-advancement-container', MCAdvancementContainer);

