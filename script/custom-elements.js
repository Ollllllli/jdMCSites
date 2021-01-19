function generateSelect(keyValue) {
    const selectWrapper = document.createElement("div");
    selectWrapper.classList.add("select-wrapper");
    const selectElement = document.createElement("select");
    selectElement.onfocus = ()=>{
        selectElement.size = selectElement.children.length;
    };
    selectElement.onblur = ()=>{
        selectElement.size = 0;
    };
    selectElement.onchange = ()=>{
        selectElement.size = 1;
        selectElement.blur();
    };
    for (const [optionValue, optionLabel] of keyValue){
        const optionElement = new Option(optionLabel, optionValue);
        selectElement.append(optionElement);
    }
    selectWrapper.append(selectElement);
    return {
        root: selectWrapper,
        select: selectElement
    };
}
class MCAdvancement extends HTMLElement {
    static advancementAttributes = [
        'col',
        'row',
        'ns',
        'done',
        'type'
    ];
    // Needed for attributeChangedCallback
    static get observedAttributes() {
        return MCAdvancement.advancementAttributes;
    }
    shadow = this.attachShadow({
        mode: 'open'
    });
    savedAttributes = {
        col: null,
        row: null,
        ns: "story/root",
        done: "false",
        type: "normal"
    };
    constructor(){
        super();
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
                    //For typescript as savedAttributes['ns'] is string|null
                    if (this.savedAttributes['ns']) {
                        const nsSplit = this.savedAttributes['ns'].split("/");
                        if (nsSplit.length == 2 && nsSplit[0] in this.advancementIcons && nsSplit[1] in this.advancementIcons[nsSplit[0]]) {
                            const mappedArray = this.advancementIcons[nsSplit[0]][nsSplit[1]];
                            const enchanted = mappedArray.includes("enchanted") ? " enchanted" : "";
                            this.shadow.innerHTML = `<mc-item-icon type="${mappedArray[0]}" name="${mappedArray[1]}"${enchanted}></mc-item-icon>`;
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
            const xMiddleRelativeToParent = Math.ceil(ownBounds.x - parentBounds.x + ownBounds.width / 2);
            const yMiddleRelativeToParent = Math.ceil(ownBounds.y - parentBounds.y + ownBounds.height / 2);
            return {
                x: xMiddleRelativeToParent,
                y: yMiddleRelativeToParent,
                relativeToParent: true
            };
        } else {
            const xMiddleRelativeToSelf = Math.ceil(ownBounds.x + ownBounds.width / 2);
            const yMiddleRelativeToSelf = Math.ceil(ownBounds.y + ownBounds.height / 2);
            return {
                x: xMiddleRelativeToSelf,
                y: yMiddleRelativeToSelf,
                relativeToParent: false
            };
        }
    }
    //When element is added to DOM
    connectedCallback() {
        //Goes through the attributes and updates their respective function
        for (const att of MCAdvancement.advancementAttributes){
            this.updateElement(att);
        }
    }
    //When an attribute is changed
    attributeChangedCallback(name, _, newValue) {
        this.savedAttributes[name] = newValue;
        this.updateElement(name);
    }
    advancementIcons = {
        story: {
            root: [
                "block",
                "grass_block"
            ],
            mine_stone: [
                "item",
                "wooden_pickaxe"
            ],
            upgrade_tools: [
                "item",
                "stone_pickaxe"
            ],
            smelt_iron: [
                "item",
                "iron_ingot"
            ],
            obtain_armor: [
                "item",
                "iron_chestplate"
            ],
            lava_bucket: [
                "item",
                "lava_bucket"
            ],
            iron_tools: [
                "item",
                "iron_pickaxe"
            ],
            deflect_arrow: [
                "block",
                "shield"
            ],
            form_obsidian: [
                "block",
                "obsidian"
            ],
            mine_diamond: [
                "item",
                "diamond"
            ],
            enter_the_nether: [
                "item",
                "flint_and_steel"
            ],
            shiny_gear: [
                "item",
                "diamond_chestplate"
            ],
            enchant_item: [
                "item",
                "enchanted_book",
                "enchanted"
            ],
            cure_zombie_villager: [
                "item",
                "golden_apple"
            ],
            follow_ender_eye: [
                "item",
                "ender_eye"
            ],
            enter_the_end: [
                "block",
                "end_stone"
            ]
        },
        nether: {
            root: [
                "block",
                "red_nether_bricks"
            ],
            return_to_sender: [
                "item",
                "fire_charge"
            ],
            find_bastion: [
                "block",
                "polished_blackstone_bricks"
            ],
            obtain_ancient_debris: [
                "block",
                "ancient_debris"
            ],
            fast_travel: [
                "item",
                "map"
            ],
            find_fortress: [
                "block",
                "nether_bricks"
            ],
            obtain_crying_obsidian: [
                "block",
                "crying_obsidian"
            ],
            distract_piglin: [
                "item",
                "gold_ingot"
            ],
            ride_strider: [
                "item",
                "warped_fungus_on_a_stick"
            ],
            uneasy_alliance: [
                "item",
                "ghast_tear"
            ],
            loot_bastion: [
                "block",
                "chest"
            ],
            use_lodestone: [
                "block",
                "lodestone"
            ],
            netherite_armor: [
                "item",
                "netherite_chestplate"
            ],
            get_wither_skull: [
                "block",
                "wither_skeleton_skull"
            ],
            obtain_blaze_rod: [
                "item",
                "blaze_rod"
            ],
            charge_respawn_anchor: [
                "block",
                "respawn_anchor_0"
            ],
            explore_nether: [
                "item",
                "netherite_boots"
            ],
            summon_wither: [
                "item",
                "nether_star",
                "enchanted"
            ],
            brew_potion: [
                "item",
                "uncraftable_potion"
            ],
            create_beacon: [
                "block",
                "beacon"
            ],
            all_potions: [
                "item",
                "milk_bucket"
            ],
            create_full_beacon: [
                "block",
                "beacon"
            ],
            all_effects: [
                "item",
                "bucket"
            ]
        },
        end: {
            root: [
                "block",
                "end_stone"
            ],
            kill_dragon: [
                "block",
                "dragon_head"
            ],
            dragon_egg: [
                "block",
                "dragon_egg"
            ],
            enter_end_gateway: [
                "item",
                "ender_pearl"
            ],
            respawn_dragon: [
                "item",
                "end_crystal",
                "enchanted"
            ],
            dragon_breath: [
                "item",
                "dragon_breath"
            ],
            find_end_city: [
                "block",
                "purpur_block"
            ],
            elytra: [
                "item",
                "elytra"
            ],
            levitate: [
                "item",
                "shulker_shell"
            ]
        },
        adventure: {
            root: [
                "item",
                "map"
            ],
            voluntary_exile: [
                "block",
                "ominous_banner"
            ],
            kill_a_mob: [
                "item",
                "iron_sword"
            ],
            trade: [
                "item",
                "emerald"
            ],
            honey_block_slide: [
                "block",
                "honey_block"
            ],
            ol_betsy: [
                "item",
                "crossbow_standby"
            ],
            sleep_in_bed: [
                "block",
                "red_bed"
            ],
            hero_of_the_village: [
                "block",
                "ominous_banner"
            ],
            throw_trident: [
                "item",
                "trident"
            ],
            shoot_arrow: [
                "item",
                "bow"
            ],
            kill_all_mobs: [
                "item",
                "diamond_sword"
            ],
            totem_of_undying: [
                "item",
                "totem_of_undying"
            ],
            summon_iron_golem: [
                "block",
                "carved_pumpkin"
            ],
            two_birds_one_arrow: [
                "item",
                "crossbow_standby"
            ],
            whos_the_pillager_now: [
                "item",
                "crossbow_standby"
            ],
            arbalistic: [
                "item",
                "crossbow_standby"
            ],
            adventuring_time: [
                "item",
                "diamond_boots"
            ],
            very_very_frightening: [
                "item",
                "trident"
            ],
            sniper_duel: [
                "item",
                "arrow"
            ],
            bullseye: [
                "block",
                "target"
            ]
        },
        husbandry: {
            root: [
                "block",
                "hay_block"
            ],
            safely_harvest_honey: [
                "item",
                "honey_bottle"
            ],
            breed_an_animal: [
                "item",
                "wheat"
            ],
            tame_an_animal: [
                "item",
                "lead"
            ],
            fishy_business: [
                "item",
                "fishing_rod"
            ],
            silk_touch_nest: [
                "block",
                "bee_nest"
            ],
            plant_seed: [
                "item",
                "wheat"
            ],
            bred_all_animals: [
                "item",
                "golden_carrot"
            ],
            complete_catalogue: [
                "item",
                "cod"
            ],
            tactical_fishing: [
                "item",
                "pufferfish_bucket"
            ],
            balanced_diet: [
                "item",
                "apple"
            ],
            obtain_netherite_hoe: [
                "item",
                "netherite_hoe"
            ]
        }
    };
}
const advancementCategories = [
    "story",
    "nether",
    "end",
    "adventure",
    "husbandry"
];
class MCAdvancementView extends HTMLElement {
    // Needed for attributeChangedCallback
    static get observedAttributes() {
        return [
            "category"
        ];
    }
    firstTime = true;
    cachedSVGs = {
        story: null,
        nether: null,
        end: null,
        adventure: null,
        husbandry: null
    };
    constructor(){
        super();
    }
    cleanOutView() {
        const gridDiv = this.querySelector("mc-advancement-view>div");
        const svgEle = this.querySelector("mc-advancement-view>svg");
        if (gridDiv != null) gridDiv.remove();
        if (svgEle != null) svgEle.remove();
        this.removeAttribute("style");
    }
    generateAdvancementDiv(category) {
        const mainGrid = document.createElement("div");
        //Advancement 26px Gap 2px, Advancement = 2 col + 1 Gap, hence Col = x*12px and Gap = x*2px.
        //x=4 for width=1000px
        mainGrid.style.display = "inline-grid";
        mainGrid.style.gridTemplateRows = `repeat(${this.templateSizes[category].rows},48px)`;
        mainGrid.style.gridTemplateColumns = `repeat(${this.templateSizes[category].columns},48px)`;
        mainGrid.style.gap = "8px";
        for(const advancementName in this.advancementTemplates[category]){
            const advTemplate = this.advancementTemplates[category][advancementName];
            mainGrid.appendChild(this.createAdvancement(category, advancementName, advTemplate.row, advTemplate.col, advTemplate.type));
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
    //Optimize:false is to render coords list every time
    //Optimize:true is to use a pre rendered list of coords generated for col width 48 and gap 8
    //clean this up
    generateUnderlaySVG(category, optimise) {
        const svgEle = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgEle.style.position = "absolute";
        svgEle.innerHTML += `<style>${this.svgStyling}</style>`;
        if (this.querySelector("mc-advancement-view>div") != null) {
            const gridDivBounds = this.querySelector("mc-advancement-view>div").getBoundingClientRect();
            svgEle.setAttribute("width", String(gridDivBounds.width));
            svgEle.setAttribute("height", String(gridDivBounds.height));
        }
        let coordinatesSet = new Set();
        for(const advancementName in this.advancementTemplates[category]){
            const advTemplate = this.advancementTemplates[category][advancementName];
            for (const endAdv of advTemplate.children){
                const linkingCoords = this.getLinkingCoords(category + "/" + advancementName, category + "/" + endAdv);
                if (linkingCoords != null) {
                    coordinatesSet.add(linkingCoords);
                }
            }
        }
        for (const color of [
            "black",
            "white"
        ]){
            for (const cGroup of coordinatesSet.values()){
                if (cGroup.type == "line") {
                    const coords = cGroup.coords;
                    svgEle.innerHTML += `<line id="${color}" x1="${coords.x1}" y1="${coords.y1}" x2="${coords.x2}" y2="${coords.y2}"></line>`;
                } else if (cGroup.type == "polyline") {
                    const coords = cGroup.coords;
                    svgEle.innerHTML += `<polyline id="${color}" points="${coords.x1},${coords.y1} ${coords.x2},${coords.y2} ${coords.x3},${coords.y3} ${coords.x4},${coords.y4}"></polyline>`;
                }
            }
        }
        return svgEle;
    }
    getLinkingCoords(advancement1ns, advancement2ns) {
        const advancement1 = this.querySelector(`mc-advancement[ns="${advancement1ns}"]`);
        const advancement2 = this.querySelector(`mc-advancement[ns="${advancement2ns}"]`);
        if (advancement1 != null && advancement2 != null) {
            let coords;
            const a1m = advancement1.getMiddle;
            const a2m = advancement2.getMiddle;
            if (a1m.y == a2m.y) {
                coords = {
                    type: "line",
                    coords: {
                        x1: a1m.x,
                        y1: a1m.y,
                        x2: a2m.x,
                        y2: a2m.y
                    }
                };
            } else {
                const xAvg = Math.ceil((a1m.x + a2m.x) / 2);
                coords = {
                    type: "polyline",
                    coords: {
                        x1: a1m.x,
                        y1: a1m.y,
                        x2: xAvg,
                        y2: a1m.y,
                        x3: xAvg,
                        y3: a2m.y,
                        x4: a2m.x,
                        y4: a2m.y
                    }
                };
            }
            return coords;
        } else {
            return null;
        }
    }
    updateElement(category) {
        this.cleanOutView();
        if (advancementCategories.includes(category)) {
            this.style.display = "block";
            this.style.textAlign = "center";
            this.style.backgroundImage = `url("./img/gui/${category}_background.png")`;
            this.style.backgroundSize = "64px";
            this.style.padding = "8px";
            const advancementView = this.generateAdvancementDiv(category);
            this.appendChild(advancementView);
            const cachedSVGEle = this.cachedSVGs[category];
            if (cachedSVGEle == null) {
                const svgEle = this.generateUnderlaySVG(category, false);
                this.insertBefore(svgEle, this.querySelector("mc-advancement-view>div"));
                this.cachedSVGs[category] = svgEle;
            } else {
                this.insertBefore(cachedSVGEle, this.querySelector("mc-advancement-view>div"));
            }
        }
    }
    //When element is added to DOM
    connectedCallback() {
        if (this.firstTime) this.firstTime = false;
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
    attributeChangedCallback(name, _, newValue) {
        console.log("attributeChangedCallback");
        if (name == "category" && !this.firstTime) {
            const category = newValue;
            this.updateElement(category);
        }
    }
    advancementTemplates = {
        "story": {
            "root": {
                "row": 4,
                "col": 1,
                "type": "normal",
                "children": [
                    "mine_stone"
                ]
            },
            "mine_stone": {
                "row": 4,
                "col": 3,
                "type": "normal",
                "children": [
                    "upgrade_tools"
                ]
            },
            "upgrade_tools": {
                "row": 4,
                "col": 5,
                "type": "normal",
                "children": [
                    "smelt_iron"
                ]
            },
            "smelt_iron": {
                "row": 4,
                "col": 7,
                "type": "normal",
                "children": [
                    "obtain_armor",
                    "lava_bucket",
                    "iron_tools"
                ]
            },
            "obtain_armor": {
                "row": 1,
                "col": 9,
                "type": "normal",
                "children": [
                    "deflect_arrow"
                ]
            },
            "lava_bucket": {
                "row": 3,
                "col": 9,
                "type": "normal",
                "children": [
                    "form_obsidian"
                ]
            },
            "iron_tools": {
                "row": 6,
                "col": 9,
                "type": "normal",
                "children": [
                    "mine_diamond"
                ]
            },
            "deflect_arrow": {
                "row": 1,
                "col": 11,
                "type": "normal",
                "children": []
            },
            "form_obsidian": {
                "row": 3,
                "col": 11,
                "type": "normal",
                "children": [
                    "enter_the_nether"
                ]
            },
            "mine_diamond": {
                "row": 6,
                "col": 11,
                "type": "normal",
                "children": [
                    "shiny_gear",
                    "enchant_item"
                ]
            },
            "enter_the_nether": {
                "row": 3,
                "col": 13,
                "type": "normal",
                "children": [
                    "cure_zombie_villager",
                    "follow_ender_eye"
                ]
            },
            "shiny_gear": {
                "row": 5,
                "col": 13,
                "type": "normal",
                "children": []
            },
            "enchant_item": {
                "row": 7,
                "col": 13,
                "type": "normal",
                "children": []
            },
            "cure_zombie_villager": {
                "row": 2,
                "col": 15,
                "type": "goal",
                "children": []
            },
            "follow_ender_eye": {
                "row": 4,
                "col": 15,
                "type": "normal",
                "children": [
                    "enter_the_end"
                ]
            },
            "enter_the_end": {
                "row": 4,
                "col": 17,
                "type": "normal",
                "children": []
            }
        },
        "nether": {
            "root": {
                "row": 9,
                "col": 1,
                "type": "normal",
                "children": [
                    "return_to_sender",
                    "find_bastion",
                    "obtain_ancient_debris",
                    "fast_travel",
                    "find_fortress",
                    "obtain_crying_obsidian",
                    "distract_piglin",
                    "ride_strider"
                ]
            },
            "return_to_sender": {
                "row": 1,
                "col": 3,
                "type": "normal",
                "children": [
                    "uneasy_alliance"
                ]
            },
            "find_bastion": {
                "row": 3,
                "col": 3,
                "type": "normal",
                "children": [
                    "loot_bastion"
                ]
            },
            "obtain_ancient_debris": {
                "row": 6,
                "col": 3,
                "type": "normal",
                "children": [
                    "use_lodestone",
                    "netherite_armor"
                ]
            },
            "fast_travel": {
                "row": 8,
                "col": 3,
                "type": "challenge",
                "children": []
            },
            "find_fortress": {
                "row": 10,
                "col": 3,
                "type": "normal",
                "children": [
                    "get_wither_skull",
                    "obtain_blaze_rod"
                ]
            },
            "obtain_crying_obsidian": {
                "row": 13,
                "col": 3,
                "type": "normal",
                "children": [
                    "charge_respawn_anchor"
                ]
            },
            "distract_piglin": {
                "row": 15,
                "col": 3,
                "type": "normal",
                "children": []
            },
            "ride_strider": {
                "row": 17,
                "col": 3,
                "type": "normal",
                "children": [
                    "explore_nether"
                ]
            },
            "uneasy_alliance": {
                "row": 1,
                "col": 5,
                "type": "challenge",
                "children": []
            },
            "loot_bastion": {
                "row": 3,
                "col": 5,
                "type": "normal",
                "children": []
            },
            "use_lodestone": {
                "row": 5,
                "col": 5,
                "type": "normal",
                "children": []
            },
            "netherite_armor": {
                "row": 7,
                "col": 5,
                "type": "challenge",
                "children": []
            },
            "get_wither_skull": {
                "row": 9,
                "col": 5,
                "type": "normal",
                "children": [
                    "summon_wither"
                ]
            },
            "obtain_blaze_rod": {
                "row": 11,
                "col": 5,
                "type": "normal",
                "children": [
                    "brew_potion"
                ]
            },
            "charge_respawn_anchor": {
                "row": 13,
                "col": 5,
                "type": "normal",
                "children": []
            },
            "explore_nether": {
                "row": 17,
                "col": 5,
                "type": "challenge",
                "children": []
            },
            "summon_wither": {
                "row": 9,
                "col": 7,
                "type": "normal",
                "children": [
                    "create_beacon"
                ]
            },
            "brew_potion": {
                "row": 11,
                "col": 7,
                "type": "normal",
                "children": [
                    "all_potions"
                ]
            },
            "create_beacon": {
                "row": 9,
                "col": 9,
                "type": "normal",
                "children": [
                    "create_full_beacon"
                ]
            },
            "all_potions": {
                "row": 11,
                "col": 9,
                "type": "challenge",
                "children": [
                    "all_effects"
                ]
            },
            "create_full_beacon": {
                "row": 9,
                "col": 11,
                "type": "goal",
                "children": []
            },
            "all_effects": {
                "row": 11,
                "col": 11,
                "type": "challenge",
                "children": []
            }
        },
        "end": {
            "root": {
                "row": 4,
                "col": 1,
                "type": "normal",
                "children": [
                    "kill_dragon"
                ]
            },
            "kill_dragon": {
                "row": 4,
                "col": 3,
                "type": "normal",
                "children": [
                    "dragon_egg",
                    "enter_end_gateway",
                    "respawn_dragon",
                    "dragon_breath"
                ]
            },
            "dragon_egg": {
                "row": 1,
                "col": 5,
                "type": "goal",
                "children": []
            },
            "enter_end_gateway": {
                "row": 3,
                "col": 5,
                "type": "normal",
                "children": [
                    "find_end_city"
                ]
            },
            "respawn_dragon": {
                "row": 5,
                "col": 5,
                "type": "goal",
                "children": []
            },
            "dragon_breath": {
                "row": 7,
                "col": 5,
                "type": "goal",
                "children": []
            },
            "find_end_city": {
                "row": 3,
                "col": 7,
                "type": "normal",
                "children": [
                    "elytra",
                    "levitate"
                ]
            },
            "elytra": {
                "row": 2,
                "col": 9,
                "type": "normal",
                "children": []
            },
            "levitate": {
                "row": 4,
                "col": 9,
                "type": "challenge",
                "children": []
            }
        },
        "adventure": {
            "root": {
                "row": 11,
                "col": 1,
                "type": "normal",
                "children": [
                    "voluntary_exile",
                    "kill_a_mob",
                    "trade",
                    "honey_block_slide",
                    "ol_betsy",
                    "sleep_in_bed"
                ]
            },
            "voluntary_exile": {
                "row": 1,
                "col": 3,
                "type": "normal",
                "children": [
                    "hero_of_the_village"
                ]
            },
            "kill_a_mob": {
                "row": 7,
                "col": 3,
                "type": "normal",
                "children": [
                    "throw_trident",
                    "shoot_arrow",
                    "kill_all_mobs",
                    "totem_of_undying"
                ]
            },
            "trade": {
                "row": 12,
                "col": 3,
                "type": "normal",
                "children": [
                    "summon_iron_golem"
                ]
            },
            "honey_block_slide": {
                "row": 14,
                "col": 3,
                "type": "normal",
                "children": []
            },
            "ol_betsy": {
                "row": 16,
                "col": 3,
                "type": "normal",
                "children": [
                    "two_birds_one_arrow",
                    "whos_the_pillager_now",
                    "arbalistic"
                ]
            },
            "sleep_in_bed": {
                "row": 20,
                "col": 3,
                "type": "normal",
                "children": [
                    "adventuring_time"
                ]
            },
            "hero_of_the_village": {
                "row": 1,
                "col": 5,
                "type": "challenge",
                "children": []
            },
            "throw_trident": {
                "row": 3,
                "col": 5,
                "type": "normal",
                "children": [
                    "very_very_frightening"
                ]
            },
            "shoot_arrow": {
                "row": 6,
                "col": 5,
                "type": "normal",
                "children": [
                    "sniper_duel",
                    "bullseye"
                ]
            },
            "kill_all_mobs": {
                "row": 8,
                "col": 5,
                "type": "challenge",
                "children": []
            },
            "totem_of_undying": {
                "row": 10,
                "col": 5,
                "type": "goal",
                "children": []
            },
            "summon_iron_golem": {
                "row": 12,
                "col": 5,
                "type": "goal",
                "children": []
            },
            "two_birds_one_arrow": {
                "row": 14,
                "col": 5,
                "type": "challenge",
                "children": []
            },
            "whos_the_pillager_now": {
                "row": 16,
                "col": 5,
                "type": "normal",
                "children": []
            },
            "arbalistic": {
                "row": 18,
                "col": 5,
                "type": "challenge",
                "children": []
            },
            "adventuring_time": {
                "row": 20,
                "col": 5,
                "type": "challenge",
                "children": []
            },
            "very_very_frightening": {
                "row": 3,
                "col": 7,
                "type": "normal",
                "children": []
            },
            "sniper_duel": {
                "row": 5,
                "col": 7,
                "type": "challenge",
                "children": []
            },
            "bullseye": {
                "row": 7,
                "col": 7,
                "type": "challenge",
                "children": []
            }
        },
        "husbandry": {
            "root": {
                "row": 6,
                "col": 1,
                "type": "normal",
                "children": [
                    "safely_harvest_honey",
                    "breed_an_animal",
                    "tame_an_animal",
                    "fishy_business",
                    "silk_touch_nest",
                    "plant_seed"
                ]
            },
            "safely_harvest_honey": {
                "row": 1,
                "col": 3,
                "type": "normal",
                "children": []
            },
            "breed_an_animal": {
                "row": 3,
                "col": 3,
                "type": "normal",
                "children": [
                    "bred_all_animals"
                ]
            },
            "tame_an_animal": {
                "row": 5,
                "col": 3,
                "type": "normal",
                "children": [
                    "complete_catalogue"
                ]
            },
            "fishy_business": {
                "row": 7,
                "col": 3,
                "type": "normal",
                "children": [
                    "tactical_fishing"
                ]
            },
            "silk_touch_nest": {
                "row": 9,
                "col": 3,
                "type": "normal",
                "children": []
            },
            "plant_seed": {
                "row": 11,
                "col": 3,
                "type": "normal",
                "children": [
                    "balanced_diet",
                    "obtain_netherite_hoe"
                ]
            },
            "bred_all_animals": {
                "row": 3,
                "col": 5,
                "type": "challenge",
                "children": []
            },
            "complete_catalogue": {
                "row": 5,
                "col": 5,
                "type": "challenge",
                "children": []
            },
            "tactical_fishing": {
                "row": 7,
                "col": 5,
                "type": "normal",
                "children": []
            },
            "balanced_diet": {
                "row": 10,
                "col": 5,
                "type": "challenge",
                "children": []
            },
            "obtain_netherite_hoe": {
                "row": 12,
                "col": 5,
                "type": "challenge",
                "children": []
            }
        }
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
    advancementStyling = `\n    mc-advancement {\n      display: inline-block;\n      padding: 20px;\n      background-size: cover;\n      background-image: url(./img/gui/advancement-normal.png);\n      filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.7));\n    }\n\n    mc-advancement[type="challenge"] {\n      background-image: url(./img/gui/advancement-challenge.png);\n    }\n\n    mc-advancement[type="goal"] {\n      background-image: url(./img/gui/advancement-goal.png);\n    }\n\n    mc-advancement[done="true"] {\n      background-image: url(./img/gui/advancement-normal-done.png);\n    }\n\n    mc-advancement[done="true"][type="goal"] {\n      background-image: url(./img/gui/advancement-goal-done.png);\n    }\n\n    mc-advancement[done="true"][type="challenge"] {\n      background-image: url(./img/gui/advancement-challenge-done.png);\n    }\n  `;
    svgStyling = `\n    line, polyline {\n      stroke-linecap: square;\n      stroke-linejoin: miter;\n      fill: none;\n    }\n\n    line#black, polyline#black {\n      stroke: rgb(0,0,0);\n      stroke-width: 12;\n    }\n\n    line#white, polyline#white {\n      stroke: rgb(255,255,255);\n      stroke-width: 4;\n    }\n  `;
}
const imageDir = document.currentScript.src + "/../../img/";
const blocksConfigPromise = fetch(`${imageDir}block/blocks.json`).then((v)=>{
    return v.json();
});
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
    itemRes = 48;
    constructor(){
        super();
        const style = document.createElement("style");
        style.textContent = `\n      canvas {\n        width: 100%;\n        height: 100%;\n      }\n    `;
        this.shadow.append(style, this.itemCanvas);
    }
    async drawCanvas(itemType, itemName) {
        const blocksConfig = await blocksConfigPromise;
        if (itemType == "block") {
            const faces = blocksConfig["block"][itemName] ?? [];
            const loadTexturesPromise = [];
            // load textures
            for (const [_, textureName] of faces){
                if (!itemTextureCache.has(textureName)) {
                    if (itemTextureCache.get(textureName) instanceof Promise) continue;
                    const textureDataPromise = loadTexture(`${imageDir}block/${textureName}.png`);
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
                this.renderer.renderQuad(this.itemCanvasContext, {
                    topLeft: blocksConfig["model"][modelName][0],
                    topRight: blocksConfig["model"][modelName][3],
                    bottomLeft: blocksConfig["model"][modelName][1],
                    bottomRight: blocksConfig["model"][modelName][2]
                }, faceTexture, textureFilter);
            }
        } else if (itemType == "item") {
            const itemTexturePath = `${imageDir}item/${itemName}.png`;
            if (!itemTextureCache.has(itemTexturePath)) {
                const itemTexturePromise = loadTexture(itemTexturePath);
                itemTextureCache.set(itemTexturePath, itemTexturePromise);
                console.log(itemTexturePath, await itemTexturePromise);
            }
            const itemTexture = await itemTextureCache.get(itemTexturePath);
            this.renderer.renderQuad(this.itemCanvasContext, {
                topLeft: blocksConfig["model"]["flat"][0],
                topRight: blocksConfig["model"]["flat"][3],
                bottomLeft: blocksConfig["model"]["flat"][1],
                bottomRight: blocksConfig["model"]["flat"][2]
            }, itemTexture);
        } else {
            if (!itemTextureCache.has("@MISSING@")) {
                const itemTexturePromise = loadTexture(null);
                itemTextureCache.set("@MISSING@", itemTexturePromise);
            }
            const itemTexture = await itemTextureCache.get("@MISSING@");
            this.renderer.renderQuad(this.itemCanvasContext, {
                topLeft: blocksConfig["model"]["flat"][0],
                topRight: blocksConfig["model"]["flat"][3],
                bottomLeft: blocksConfig["model"]["flat"][1],
                bottomRight: blocksConfig["model"]["flat"][2]
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
                this.itemName = this.getAttribute("name") ?? "";
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
        this.updateProperty("name");
        this.updateProperty("type");
        this.updateProperty("res");
        this.updateProperty("enchanted");
        this.itemCanvas.width = this.itemRes;
        this.itemCanvas.height = this.itemRes;
        this.renderer = new Renderer(this.itemCanvas.width, this.itemCanvas.height);
        this.drawCanvas(this.itemType, this.itemName);
    }
}
// new MCItemIcon({ type: "block", name: "cobblestone" });
document.head.insertAdjacentHTML("afterbegin", `\n  <style>\n    mc-item-icon {\n      display: inline-block;\n      width: 30em;\n      height: 30em;\n    }\n  </style>\n`);
customElements.define('mc-advancement', MCAdvancement);
customElements.define('mc-advancement-view', MCAdvancementView);
customElements.define('mc-item-icon', MCItemIcon);
