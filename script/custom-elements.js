const advancementAttributes = [
    'col',
    'row',
    'ns',
    'done',
    'type',
    'route'
];
class MCAdvancement extends HTMLElement {
    // Needed for attributeChangedCallback
    static get observedAttributes() {
        return advancementAttributes;
    }
    shadow = this.attachShadow({
        mode: 'open'
    });
    savedAttributes = {
        col: null,
        row: null,
        ns: "",
        route: "./img/",
        done: "false",
        type: "normal"
    };
    constructor(){
        super();
        this.shadow.appendChild(document.createElement('img'));
    }
    updateElement(attribute) {
        //only fires if the attribute not null, meaning only set attributes are used
        if (this.savedAttributes[attribute] !== null) {
            switch(attribute){
                case 'col':
                case 'row':
                    this.style.gridArea = `${this.savedAttributes.row}/${this.savedAttributes.col}/${String(Number(this.savedAttributes.row) + 2)}/${String(Number(this.savedAttributes.col) + 2)}`;
                    break;
                case 'ns':
                case 'route':
                    this.shadow.querySelector("img").src = `${this.savedAttributes.route}${this.savedAttributes.ns}.png`;
                    break;
            }
        }
    }
    //When element is added to DOM
    connectedCallback() {
        //Goes through the attributes and updates their respective function
        for (const att of advancementAttributes){
            this.updateElement(att);
        }
    }
    //When an attribute is changed
    attributeChangedCallback(name, _, newValue) {
        this.savedAttributes[name] = newValue;
        this.updateElement(name);
    }
}
const advancementCategories = [
    "story",
    "nether",
    "end",
    "adventure",
    "husbandry"
];
class MCAdvancementContainer extends HTMLElement {
    // Needed for attributeChangedCallback
    static get observedAttributes() {
        return [
            "category"
        ];
    }
    constructor(){
        super();
    }
    generateAdvancementDiv(category) {
        const mainGrid = document.createElement("div");
        mainGrid.style.display = "grid";
        mainGrid.style.gridTemplateRows = `repeat(${this.templateSizes[category].rows},20px)`;
        mainGrid.style.gridTemplateColumns = `repeat(${this.templateSizes[category].columns},20px)`;
        mainGrid.style.gap = "10px";
        for(let i = 0; i < this.templates[category].length; i++){
            const advTemplate = this.templates[category][i];
            mainGrid.appendChild(this.createAdvancement(category, ...advTemplate));
        }
        return mainGrid;
    }
    createAdvancement(category, name, row, col, type = "normal") {
        const advancementElement = new MCAdvancement();
        advancementElement.setAttribute("ns", `${category}/${name}`);
        advancementElement.setAttribute("type", String(type));
        advancementElement.setAttribute("row", String(row));
        advancementElement.setAttribute("col", String(col));
        return advancementElement;
    }
    //When element is added to DOM
    connectedCallback() {
        const gridDiv = this.querySelector("div");
        if (gridDiv != null) gridDiv.remove();
        const containerStyle = document.createElement("style");
        containerStyle.innerHTML = this.advancementStyling;
        this.appendChild(containerStyle);
        const category = this.getAttribute("category");
        if (category in advancementCategories) {
            const advancementContainer = this.generateAdvancementDiv(category);
            this.appendChild(advancementContainer);
        }
    }
    //When an attribute is changed (IT SEEMS LIKE WHEN TAG IS CREATED, CONSTRUCTOR->ATTRIBUTES->CONNECTED)
    attributeChangedCallback(name, _, newValue) {
        if (name == "category") {
            const category = newValue;
            const gridDiv = this.querySelector("div");
            if (gridDiv) gridDiv.remove();
            if (category in advancementCategories) {
                const advancementContainer = this.generateAdvancementDiv(category);
                this.appendChild(advancementContainer);
            }
        }
    }
    //Not sure how to solve this issue, i tried making it as small footprint as possible, other option is to use the actual elements as template, but i feel thats ALOT more
    templates = {
        story: [
            [
                "root",
                4,
                1
            ],
            [
                "mine_stone",
                4,
                3
            ],
            [
                "upgrade_tools",
                4,
                5
            ],
            [
                "smelt_iron",
                4,
                7
            ],
            [
                "obtain_armor",
                1,
                9
            ],
            [
                "lava_bucket",
                3,
                9
            ],
            [
                "iron_tools",
                6,
                9
            ],
            [
                "deflect_arrow",
                1,
                11
            ],
            [
                "form_obsidian",
                3,
                11
            ],
            [
                "mine_diamond",
                6,
                11
            ],
            [
                "enter_the_nether",
                3,
                13
            ],
            [
                "shiny_gear",
                5,
                13
            ],
            [
                "enchant_item",
                7,
                13
            ],
            [
                "cure_zombie_villager",
                2,
                15,
                "goal"
            ],
            [
                "follow_ender_eye",
                4,
                15
            ],
            [
                "enter_the_end",
                4,
                17
            ]
        ],
        nether: [
            [
                "root",
                9,
                1
            ],
            [
                "return_to_sender",
                1,
                3
            ],
            [
                "find_bastion",
                3,
                3
            ],
            [
                "obtain_ancient_debris",
                6,
                3
            ],
            [
                "fast_travel",
                8,
                3,
                "challenge"
            ],
            [
                "find_fortress",
                10,
                3
            ],
            [
                "obtain_crying_obsidian",
                13,
                3
            ],
            [
                "distract_piglin",
                15,
                3
            ],
            [
                "ride_strider",
                17,
                3
            ],
            [
                "uneasy_alliance",
                1,
                5,
                "challenge"
            ],
            [
                "loot_bastion",
                3,
                5
            ],
            [
                "use_lodestone",
                5,
                5
            ],
            [
                "netherite_armor",
                7,
                5,
                "challenge"
            ],
            [
                "get_wither_skull",
                9,
                5
            ],
            [
                "obtain_blaze_rod",
                11,
                5
            ],
            [
                "charge_respawn_anchor",
                13,
                5
            ],
            [
                "explore_nether",
                17,
                5,
                "challenge"
            ],
            [
                "summon_wither",
                9,
                7
            ],
            [
                "brew_potion",
                11,
                7
            ],
            [
                "create_beacon",
                9,
                9
            ],
            [
                "all_potions",
                11,
                9,
                "challenge"
            ],
            [
                "create_full_beacon",
                9,
                11,
                "goal"
            ],
            [
                "all_effects",
                11,
                11,
                "challenge"
            ]
        ],
        end: [
            [
                "root",
                4,
                1
            ],
            [
                "kill_dragon",
                4,
                3
            ],
            [
                "dragon_egg",
                1,
                5,
                "goal"
            ],
            [
                "enter_end_gateway",
                3,
                5
            ],
            [
                "respawn_dragon",
                5,
                5,
                "goal"
            ],
            [
                "dragon_breath",
                7,
                5,
                "goal"
            ],
            [
                "find_end_city",
                3,
                7
            ],
            [
                "elytra",
                2,
                9
            ],
            [
                "levitate",
                4,
                9,
                "challenge"
            ]
        ],
        adventure: [
            [
                "root",
                11,
                1
            ],
            [
                "voluntary_exile",
                1,
                3
            ],
            [
                "kill_a_mob",
                7,
                3
            ],
            [
                "trade",
                12,
                3
            ],
            [
                "honey_block_slide",
                14,
                3
            ],
            [
                "ol_betsy",
                16,
                3
            ],
            [
                "sleep_in_bed",
                20,
                3
            ],
            [
                "hero_of_the_village",
                1,
                5,
                "challenge"
            ],
            [
                "throw_trident",
                3,
                5
            ],
            [
                "shoot_arrow",
                6,
                5
            ],
            [
                "kill_all_mobs",
                8,
                5,
                "challenge"
            ],
            [
                "totem_of_undying",
                10,
                5,
                "goal"
            ],
            [
                "summon_iron_golem",
                12,
                5,
                "goal"
            ],
            [
                "two_birds_one_arrow",
                14,
                5,
                "challenge"
            ],
            [
                "whos_the_pillager_now",
                16,
                5
            ],
            [
                "arbalistic",
                18,
                5,
                "challenge"
            ],
            [
                "adventuring_time",
                20,
                5,
                "challenge"
            ],
            [
                "very_very_frightening",
                3,
                7
            ],
            [
                "sniper_duel",
                5,
                7,
                "challenge"
            ],
            [
                "bullseye",
                7,
                7,
                "challenge"
            ]
        ],
        husbandry: [
            [
                "root",
                6,
                1
            ],
            [
                "safely_harvest_honey",
                1,
                3
            ],
            [
                "breed_an_animal",
                3,
                3
            ],
            [
                "tame_an_animal",
                5,
                3
            ],
            [
                "fishy_business",
                7,
                3
            ],
            [
                "silk_touch_nest",
                9,
                3
            ],
            [
                "plant_seed",
                11,
                3
            ],
            [
                "bred_all_animals",
                3,
                5,
                "challenge"
            ],
            [
                "complete_catalogue",
                5,
                5,
                "challenge"
            ],
            [
                "tactical_fishing",
                7,
                5
            ],
            [
                "balanced_diet",
                10,
                5,
                "challenge"
            ],
            [
                "obtain_netherite_hoe",
                12,
                5,
                "challenge"
            ]
        ]
    };
    templateSizes = {
        story: {
            rows: 8,
            columns: 18
        },
        nether: {
            rows: 18,
            columns: 12
        },
        end: {
            rows: 8,
            columns: 10
        },
        adventure: {
            rows: 21,
            columns: 8
        },
        husbandry: {
            rows: 13,
            columns: 6
        }
    };
    //ALL SIZING WILL BE REDONE AND THIS IS STILL BASIC STYLING
    advancementStyling = `\n    mc-advancement {\n      padding: 3px;\n      display: inline-block;\n\n      background-size: cover;\n      background-image: url(./img/gui/advancement-normal.png);\n    }\n\n    mc-advancement[type="challenge"] {\n      background-image: url(./img/gui/advancement-challenge.png);\n    }\n\n    mc-advancement[type="goal"] {\n      background-image: url(./img/gui/advancement-goal.png);\n    }\n\n    mc-advancement[done="true"] {\n      background-image: url(./img/gui/advancement-normal-done.png);\n    }\n\n    mc-advancement[done="true"][type="goal"] {\n      background-image: url(./img/gui/advancement-goal-done.png);\n    }\n\n    mc-advancement[done="true"][type="challenge"] {\n      background-image: url(./img/gui/advancement-challenge-done.png);\n    }\n  `;
}
const imageDir = document.currentScript.src + "/../../img/";
const blocksConfigPromise = fetch(`${imageDir}block/blocks.json`).then((v)=>v.json()
);
const itemIconTypes = [
    "block",
    "item",
    "none"
];
const itemTextureCache = new Map();
class MCItemIcon extends HTMLElement {
    static get observedAttributes() {
        return [
            "name",
            "type",
            "enchanted",
            "res"
        ];
    }
    shadow = this.attachShadow({
        mode: "closed"
    });
    renderer = null;
    itemCanvas = document.createElement("canvas");
    itemCanvasContext = this.itemCanvas.getContext("2d");
    itemType = "none";
    itemName = "";
    itemIsEnchanted = false;
    itemRes = 128;
    constructor(){
        super();
        const style = document.createElement("style");
        style.textContent = `\n      canvas {\n        width: 100%;\n        height: 100%;\n      }\n    `;
        this.shadow.append(style, this.itemCanvas);
    }
    async drawCanvas() {
        const blocksConfig = await blocksConfigPromise;
        if (this.itemType == "block") {
            const faces = blocksConfig["block"][this.itemName];
            const loadTexturesPromise = [];
            // load textures
            for (const [_, textureName] of faces){
                if (!itemTextureCache.has(textureName)) {
                    if (itemTextureCache.get(textureName) instanceof Promise) continue;
                    const textureDataPromise = loadTexture(`block/${textureName}.png`);
                    itemTextureCache.set(textureName, textureDataPromise);
                }
                const texturePromise = itemTextureCache.get(textureName);
                loadTexturesPromise.push(texturePromise);
            }
            await Promise.all(loadTexturesPromise);
            // draw faces
            for (const [modelName, textureName] of faces){
                // load texture from cache
                const faceTexture = await itemTextureCache.get(textureName);
                let textureFilter = undefined;
                if (modelName == "left") textureFilter = {
                    brightness: 0.8
                };
                else if (modelName == "right") textureFilter = {
                    brightness: 0.6
                };
                const renderData = this.renderer.renderQuad(this.itemCanvasContext, {
                    topLeft: blocksConfig["model"][modelName],
                    topRight: blocksConfig["model"][modelName],
                    bottomLeft: blocksConfig["model"][modelName],
                    bottomRight: blocksConfig["model"][modelName]
                }, faceTexture, textureFilter);
            }
        } else if (this.itemType == "item") {
            const itemTexturePath = `item/${this.itemName}.png`;
            if (!itemTextureCache.has(itemTexturePath)) {
                const itemTexturePromise = loadTexture(itemTexturePath);
                itemTextureCache.set(itemTexturePath, itemTexturePromise);
            }
            const itemTexture = await itemTextureCache.get(itemTexturePath);
            const renderData = this.renderer.renderQuad(this.itemCanvasContext, {
                topLeft: blocksConfig["model"]["flat"],
                topRight: blocksConfig["model"]["flat"],
                bottomLeft: blocksConfig["model"]["flat"],
                bottomRight: blocksConfig["model"]["flat"]
            }, itemTexture);
        } else {
            const itemTexture = await loadTexture(`@INVALID@`);
            const renderData = this.renderer.renderQuad(this.itemCanvasContext, {
                topLeft: blocksConfig["model"]["flat"],
                topRight: blocksConfig["model"]["flat"],
                bottomLeft: blocksConfig["model"]["flat"],
                bottomRight: blocksConfig["model"]["flat"]
            }, itemTexture);
        }
    }
    updateProperty(key) {
        let value;
        switch(key){
            case "type":
                value = this.getAttribute("type");
                if (itemIconTypes.includes(value)) this.itemType = value;
                break;
            case "name":
                value = this.getAttribute("name");
                blocksConfigPromise.then((blocksConfig)=>value in blocksConfig["block"] ? this.itemName = value : this.itemType = "none"
                );
                break;
            case "enchanted":
                this.itemIsEnchanted = this.hasAttribute("enchanted");
                break;
            case "res":
                value = this.getAttribute("res");
                value > 0 ? this.itemRes = value : 0;
                break;
        }
    }
    connectedCallback() {
        this.updateProperty("enchanted");
        this.updateProperty("type");
        this.updateProperty("name");
        this.updateProperty("res");
        this.itemCanvas.width = this.itemRes;
        this.itemCanvas.height = this.itemRes;
        this.renderer = new Renderer(this.itemCanvas.width, this.itemCanvas.height);
        this.drawCanvas();
    }
    attributeChangedCallback(attrName, oldVal, newVal) {
        this.updateProperty(attrName);
    }
}
// new MCItemIcon({ type: "block", name: "cobblestone" });
document.head.insertAdjacentHTML("afterbegin", `\n  <style>\n    mc-item-icon {\n      display: inline-block;\n      width: 30em;\n      height: 30em;\n    }\n  </style>\n`);
customElements.define('mc-advancement', MCAdvancement);
customElements.define('mc-advancement-container', MCAdvancementContainer);
customElements.define('mc-item-icon', MCItemIcon);
