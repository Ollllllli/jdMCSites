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
const pixelSize = 4;
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
    //shadow = this.attachShadow({mode: 'closed'}); removed as it doesnt allow sibling elements
    savedAttributes = {
        col: null,
        row: null,
        ns: "story/root",
        done: "false",
        type: "normal"
    };
    savedTooltip = null;
    currentlyIconed = false;
    constructor(){
        super();
    }
    updateElement(attribute) {
        switch(attribute){
            case 'col':
            case 'row':
                if (this.savedAttributes[attribute] == null) {
                    this.style.gridArea = "";
                } else {
                    this.style.gridArea = `${this.savedAttributes.row}/${this.savedAttributes.col}/${String(Number(this.savedAttributes.row) + 2)}/${String(Number(this.savedAttributes.col) + 2)}`;
                }
                break;
            case 'ns':
                //For typescript as savedAttributes['ns'] is string|null
                if (this.savedAttributes['ns'] != null) {
                    const nsSplit = this.savedAttributes['ns'].split("/");
                    if (nsSplit.length == 2 && nsSplit[0] in this.advancementIcons && nsSplit[1] in this.advancementIcons[nsSplit[0]]) {
                        const enchMap = this.advancementIcons[nsSplit[0]][nsSplit[1]];
                        const enchanted = enchMap.icon.ench == true ? " enchanted" : "";
                        if (this.currentlyIconed == false) {
                            this.insertAdjacentHTML("afterbegin", `<mc-item-icon model="${enchMap.icon.type}/${enchMap.icon.name}"${enchanted}></mc-item-icon>`);
                            this.currentlyIconed = true;
                        }
                        if (this.savedTooltip == null) {
                            this.savedTooltip = new MCTooltipFancy();
                            this.insertAdjacentElement("afterbegin", this.savedTooltip);
                        }
                        this.savedTooltip.setTitleText = enchMap.title;
                        this.savedTooltip.setDescriptionText = enchMap.desc;
                        const criteriaList = document.createElement("ul");
                        for (const criterion of enchMap.criteria){
                            const criterionReadable = criterion.replaceAll("_", " ").replaceAll("minecraft:", "").replaceAll("textures/entity/cat/", "").replaceAll(".png", "");
                            criteriaList.insertAdjacentHTML("beforeend", `<li id="${criterion}">${criterionReadable}</li>`);
                        }
                        this.savedTooltip.setDetailsContent = criteriaList;
                    } else {
                        this.querySelector("mc-item-icon")?.remove();
                        this.currentlyIconed = false;
                        this.savedTooltip?.remove();
                    }
                }
                break;
            case 'type':
                if (this.savedTooltip != null) {
                    if (this.savedAttributes.type == "challenge") {
                        this.savedTooltip.setAttribute("type", "challenge");
                    } else {
                        this.savedTooltip.removeAttribute("type");
                    }
                }
                break;
            case 'done':
                if (this.savedTooltip != null) {
                    if (this.savedAttributes.done == "true") {
                        this.savedTooltip.setAttribute("done", "");
                    } else {
                        this.savedTooltip.removeAttribute("done");
                    }
                }
                break;
        }
    }
    updateCriteria(advDetails, completionDate) {
        if (this.savedTooltip != null) {
            const criteriaListEle = this.savedTooltip.getDetailsContent;
            if (criteriaListEle instanceof HTMLUListElement) {
                const oldCompletionDate = criteriaListEle.querySelector("span#completionDate");
                console.log(criteriaListEle);
                if (oldCompletionDate != null) {
                    oldCompletionDate.remove();
                }
                for (const criterionLI of criteriaListEle.querySelectorAll("li")){
                    criterionLI.removeAttribute("done");
                    if (criterionLI.id in advDetails.criteria) {
                        criterionLI.setAttribute("done", "");
                    }
                }
                if (advDetails.done == true) {
                    criteriaListEle.insertAdjacentHTML("afterbegin", `<span id="completionDate">Completed: ${completionDate != null ? completionDate.toLocaleDateString() : "hacker"}</span>`);
                }
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
        "story": {
            "root": {
                "title": "Minecraft",
                "desc": "The heart and story of the game",
                "icon": {
                    "type": "block",
                    "name": "grass_block",
                    "ench": false
                },
                "criteria": [
                    "crafting_table"
                ]
            },
            "mine_stone": {
                "title": "Stone Age",
                "desc": "Mine stone with your new pickaxe",
                "icon": {
                    "type": "item",
                    "name": "wooden_pickaxe",
                    "ench": false
                },
                "criteria": [
                    "get_stone"
                ]
            },
            "upgrade_tools": {
                "title": "Getting an Upgrade",
                "desc": "Construct a better pickaxe",
                "icon": {
                    "type": "item",
                    "name": "stone_pickaxe",
                    "ench": false
                },
                "criteria": [
                    "stone_pickaxe"
                ]
            },
            "smelt_iron": {
                "title": "Acquire Hardware",
                "desc": "Smelt an iron ingot",
                "icon": {
                    "type": "item",
                    "name": "iron_ingot",
                    "ench": false
                },
                "criteria": [
                    "iron"
                ]
            },
            "obtain_armor": {
                "title": "Suit Up",
                "desc": "Protect yourself with a piece of iron armor",
                "icon": {
                    "type": "item",
                    "name": "iron_chestplate",
                    "ench": false
                },
                "criteria": [
                    "iron_boots",
                    "iron_chestplate",
                    "iron_helmet",
                    "iron_leggings"
                ]
            },
            "lava_bucket": {
                "title": "Hot Stuff",
                "desc": "Fill a bucket with lava",
                "icon": {
                    "type": "item",
                    "name": "lava_bucket",
                    "ench": false
                },
                "criteria": [
                    "lava_bucket"
                ]
            },
            "iron_tools": {
                "title": "Isn't It Iron Pick",
                "desc": "Upgrade your pickaxe",
                "icon": {
                    "type": "item",
                    "name": "iron_pickaxe",
                    "ench": false
                },
                "criteria": [
                    "iron_pickaxe"
                ]
            },
            "deflect_arrow": {
                "title": "Not Today, Thank You",
                "desc": "Deflect a projectile with a shield",
                "icon": {
                    "type": "item",
                    "name": "shield",
                    "ench": false
                },
                "criteria": [
                    "deflected_projectile"
                ]
            },
            "form_obsidian": {
                "title": "Ice Bucket Challenge",
                "desc": "Obtain a block of obsidian",
                "icon": {
                    "type": "block",
                    "name": "obsidian",
                    "ench": false
                },
                "criteria": [
                    "obsidian"
                ]
            },
            "mine_diamond": {
                "title": "Diamonds!",
                "desc": "Acquire diamonds",
                "icon": {
                    "type": "item",
                    "name": "diamond",
                    "ench": false
                },
                "criteria": [
                    "diamond"
                ]
            },
            "enter_the_nether": {
                "title": "We Need to Go Deeper",
                "desc": "Build, light and enter a Nether Portal",
                "icon": {
                    "type": "item",
                    "name": "flint_and_steel",
                    "ench": false
                },
                "criteria": [
                    "entered_nether"
                ]
            },
            "shiny_gear": {
                "title": "Cover Me With Diamonds",
                "desc": "Diamond armor saves lives",
                "icon": {
                    "type": "item",
                    "name": "diamond_chestplate",
                    "ench": false
                },
                "criteria": [
                    "diamond_boots",
                    "diamond_chestplate",
                    "diamond_helmet",
                    "diamond_leggings"
                ]
            },
            "enchant_item": {
                "title": "Enchanter",
                "desc": "Enchant an item at an Enchanting Table",
                "icon": {
                    "type": "item",
                    "name": "enchanted_book",
                    "ench": true
                },
                "criteria": [
                    "enchanted_item"
                ]
            },
            "cure_zombie_villager": {
                "title": "Zombie Doctor",
                "desc": "Weaken and then cure a Zombie Villager",
                "icon": {
                    "type": "item",
                    "name": "golden_apple",
                    "ench": false
                },
                "criteria": [
                    "cured_zombie"
                ]
            },
            "follow_ender_eye": {
                "title": "Eye Spy",
                "desc": "Follow an Eye of Ender",
                "icon": {
                    "type": "item",
                    "name": "ender_eye",
                    "ench": false
                },
                "criteria": [
                    "in_stronghold"
                ]
            },
            "enter_the_end": {
                "title": "The End?",
                "desc": "Enter the End Portal",
                "icon": {
                    "type": "block",
                    "name": "end_stone",
                    "ench": false
                },
                "criteria": [
                    "entered_end"
                ]
            }
        },
        "nether": {
            "root": {
                "title": "Nether",
                "desc": "Bring summer clothes",
                "icon": {
                    "type": "block",
                    "name": "red_nether_bricks",
                    "ench": false
                },
                "criteria": [
                    "entered_nether"
                ]
            },
            "return_to_sender": {
                "title": "Return to Sender",
                "desc": "Destroy a Ghast with a fireball",
                "icon": {
                    "type": "item",
                    "name": "fire_charge",
                    "ench": false
                },
                "criteria": [
                    "killed_ghast"
                ]
            },
            "find_bastion": {
                "title": "Those Were the Days",
                "desc": "Enter a Bastion Remnant",
                "icon": {
                    "type": "block",
                    "name": "polished_blackstone_bricks",
                    "ench": false
                },
                "criteria": [
                    "bastion"
                ]
            },
            "obtain_ancient_debris": {
                "title": "Hidden in the Depths",
                "desc": "Obtain Ancient Debris",
                "icon": {
                    "type": "block",
                    "name": "ancient_debris",
                    "ench": false
                },
                "criteria": [
                    "ancient_debris"
                ]
            },
            "fast_travel": {
                "title": "Subspace Bubble",
                "desc": "Use the Nether to travel 7 km in the Overworld",
                "icon": {
                    "type": "item",
                    "name": "map",
                    "ench": false
                },
                "criteria": [
                    "travelled"
                ]
            },
            "find_fortress": {
                "title": "A Terrible Fortress",
                "desc": "Break your way into a Nether Fortress",
                "icon": {
                    "type": "block",
                    "name": "nether_bricks",
                    "ench": false
                },
                "criteria": [
                    "fortress"
                ]
            },
            "obtain_crying_obsidian": {
                "title": "Who is Cutting Onions?",
                "desc": "Obtain Crying Obsidian",
                "icon": {
                    "type": "block",
                    "name": "crying_obsidian",
                    "ench": false
                },
                "criteria": [
                    "crying_obsidian"
                ]
            },
            "distract_piglin": {
                "title": "Oh Shiny",
                "desc": "Distract Piglins with gold",
                "icon": {
                    "type": "item",
                    "name": "gold_ingot",
                    "ench": false
                },
                "criteria": [
                    "distract_piglin",
                    "distract_piglin_directly"
                ]
            },
            "ride_strider": {
                "title": "This Boat Has Legs",
                "desc": "Ride a Strider with a Warped Fungus on a Stick",
                "icon": {
                    "type": "item",
                    "name": "warped_fungus_on_a_stick",
                    "ench": false
                },
                "criteria": [
                    "used_warped_fungus_on_a_stick"
                ]
            },
            "uneasy_alliance": {
                "title": "Uneasy Alliance",
                "desc": "Rescue a Ghast from the Nether, bring it safely home to the Overworld... and then kill it",
                "icon": {
                    "type": "item",
                    "name": "ghast_tear",
                    "ench": false
                },
                "criteria": [
                    "killed_ghast"
                ]
            },
            "loot_bastion": {
                "title": "War Pigs",
                "desc": "Loot a chest in a Bastion Remnant",
                "icon": {
                    "type": "block",
                    "name": "chest",
                    "ench": false
                },
                "criteria": [
                    "loot_bastion_bridge",
                    "loot_bastion_hoglin_stable",
                    "loot_bastion_other",
                    "loot_bastion_treasure"
                ]
            },
            "use_lodestone": {
                "title": "Country Lode, Take Me Home",
                "desc": "Use a compass on a Lodestone",
                "icon": {
                    "type": "block",
                    "name": "lodestone",
                    "ench": false
                },
                "criteria": [
                    "use_lodestone"
                ]
            },
            "netherite_armor": {
                "title": "Cover Me in Debris",
                "desc": "Get a full suit of Netherite armor",
                "icon": {
                    "type": "item",
                    "name": "netherite_chestplate",
                    "ench": false
                },
                "criteria": [
                    "netherite_armor"
                ]
            },
            "get_wither_skull": {
                "title": "Spooky Scary Skeleton",
                "desc": "Obtain a Wither Skeleton's skull",
                "icon": {
                    "type": "block",
                    "name": "wither_skeleton_skull",
                    "ench": false
                },
                "criteria": [
                    "wither_skull"
                ]
            },
            "obtain_blaze_rod": {
                "title": "Into Fire",
                "desc": "Relieve a Blaze of its rod",
                "icon": {
                    "type": "item",
                    "name": "blaze_rod",
                    "ench": false
                },
                "criteria": [
                    "blaze_rod"
                ]
            },
            "charge_respawn_anchor": {
                "title": "Not Quite \"Nine\" Lives",
                "desc": "Charge a Respawn Anchor to the maximum",
                "icon": {
                    "type": "block",
                    "name": "respawn_anchor_0",
                    "ench": false
                },
                "criteria": [
                    "charge_respawn_anchor"
                ]
            },
            "explore_nether": {
                "title": "Hot Tourist Destinations",
                "desc": "Explore all Nether biomes",
                "icon": {
                    "type": "item",
                    "name": "netherite_boots",
                    "ench": false
                },
                "criteria": [
                    "minecraft:basalt_deltas",
                    "minecraft:crimson_forest",
                    "minecraft:nether_wastes",
                    "minecraft:soul_sand_valley",
                    "minecraft:warped_forest"
                ]
            },
            "summon_wither": {
                "title": "Withering Heights",
                "desc": "Summon the Wither",
                "icon": {
                    "type": "item",
                    "name": "nether_star",
                    "ench": true
                },
                "criteria": [
                    "summoned"
                ]
            },
            "brew_potion": {
                "title": "Local Brewery",
                "desc": "Brew a potion",
                "icon": {
                    "type": "item",
                    "name": "uncraftable_potion",
                    "ench": false
                },
                "criteria": [
                    "potion"
                ]
            },
            "create_beacon": {
                "title": "Bring Home the Beacon",
                "desc": "Construct and place a beacon",
                "icon": {
                    "type": "block",
                    "name": "beacon",
                    "ench": false
                },
                "criteria": [
                    "beacon"
                ]
            },
            "all_potions": {
                "title": "A Furious Cocktail",
                "desc": "Have every potion effect applied at the same time",
                "icon": {
                    "type": "item",
                    "name": "milk_bucket",
                    "ench": false
                },
                "criteria": [
                    "all_effects"
                ]
            },
            "create_full_beacon": {
                "title": "Beaconator",
                "desc": "Bring a beacon to full power",
                "icon": {
                    "type": "block",
                    "name": "beacon",
                    "ench": false
                },
                "criteria": [
                    "beacon"
                ]
            },
            "all_effects": {
                "title": "How Did We Get Here?",
                "desc": "Have every effect applied at the same time",
                "icon": {
                    "type": "item",
                    "name": "bucket",
                    "ench": false
                },
                "criteria": [
                    "all_effects"
                ]
            }
        },
        "end": {
            "root": {
                "title": "The End",
                "desc": "Or the beginning?",
                "icon": {
                    "type": "block",
                    "name": "end_stone",
                    "ench": false
                },
                "criteria": [
                    "entered_end"
                ]
            },
            "kill_dragon": {
                "title": "Free the End",
                "desc": "Good luck",
                "icon": {
                    "type": "block",
                    "name": "dragon_head",
                    "ench": false
                },
                "criteria": [
                    "killed_dragon"
                ]
            },
            "dragon_egg": {
                "title": "The Next Generation",
                "desc": "Hold the Dragon Egg",
                "icon": {
                    "type": "block",
                    "name": "dragon_egg",
                    "ench": false
                },
                "criteria": [
                    "dragon_egg"
                ]
            },
            "enter_end_gateway": {
                "title": "Remote Getaway",
                "desc": "Escape the island",
                "icon": {
                    "type": "item",
                    "name": "ender_pearl",
                    "ench": false
                },
                "criteria": [
                    "entered_end_gateway"
                ]
            },
            "respawn_dragon": {
                "title": "The End... Again...",
                "desc": "Respawn the Ender Dragon",
                "icon": {
                    "type": "item",
                    "name": "end_crystal",
                    "ench": true
                },
                "criteria": [
                    "summoned_dragon"
                ]
            },
            "dragon_breath": {
                "title": "You Need a Mint",
                "desc": "Collect dragon's breath in a glass bottle",
                "icon": {
                    "type": "item",
                    "name": "dragon_breath",
                    "ench": false
                },
                "criteria": [
                    "dragon_breath"
                ]
            },
            "find_end_city": {
                "title": "The City at the End of the Game",
                "desc": "Go on in, what could happen?",
                "icon": {
                    "type": "block",
                    "name": "purpur_block",
                    "ench": false
                },
                "criteria": [
                    "in_city"
                ]
            },
            "elytra": {
                "title": "Sky's the Limit",
                "desc": "Find elytra",
                "icon": {
                    "type": "item",
                    "name": "elytra",
                    "ench": false
                },
                "criteria": [
                    "elytra"
                ]
            },
            "levitate": {
                "title": "Great View From Up Here",
                "desc": "Levitate up 50 blocks from the attacks of a Shulker",
                "icon": {
                    "type": "item",
                    "name": "shulker_shell",
                    "ench": false
                },
                "criteria": [
                    "levitated"
                ]
            }
        },
        "adventure": {
            "root": {
                "title": "Adventure",
                "desc": "Adventure, exploration and combat",
                "icon": {
                    "type": "item",
                    "name": "map",
                    "ench": false
                },
                "criteria": [
                    "killed_by_something",
                    "killed_something"
                ]
            },
            "voluntary_exile": {
                "title": "Voluntary Exile",
                "desc": "Kill a raid captain.\nMaybe consider staying away from villages for the time being...",
                "icon": {
                    "type": "block",
                    "name": "ominous_banner",
                    "ench": false
                },
                "criteria": [
                    "voluntary_exile"
                ]
            },
            "kill_a_mob": {
                "title": "Monster Hunter",
                "desc": "Kill any hostile monster",
                "icon": {
                    "type": "item",
                    "name": "iron_sword",
                    "ench": false
                },
                "criteria": [
                    "minecraft:blaze",
                    "minecraft:cave_spider",
                    "minecraft:creeper",
                    "minecraft:drowned",
                    "minecraft:elder_guardian",
                    "minecraft:ender_dragon",
                    "minecraft:enderman",
                    "minecraft:endermite",
                    "minecraft:evoker",
                    "minecraft:ghast",
                    "minecraft:guardian",
                    "minecraft:hoglin",
                    "minecraft:husk",
                    "minecraft:magma_cube",
                    "minecraft:phantom",
                    "minecraft:piglin",
                    "minecraft:piglin_brute",
                    "minecraft:pillager",
                    "minecraft:ravager",
                    "minecraft:shulker",
                    "minecraft:silverfish",
                    "minecraft:skeleton",
                    "minecraft:slime",
                    "minecraft:spider",
                    "minecraft:stray",
                    "minecraft:vex",
                    "minecraft:vindicator",
                    "minecraft:witch",
                    "minecraft:wither",
                    "minecraft:wither_skeleton",
                    "minecraft:zoglin",
                    "minecraft:zombie",
                    "minecraft:zombie_villager",
                    "minecraft:zombified_piglin"
                ]
            },
            "trade": {
                "title": "What a Deal!",
                "desc": "Successfully trade with a Villager",
                "icon": {
                    "type": "item",
                    "name": "emerald",
                    "ench": false
                },
                "criteria": [
                    "traded"
                ]
            },
            "honey_block_slide": {
                "title": "Sticky Situation",
                "desc": "Jump into a Honey Block to break your fall",
                "icon": {
                    "type": "block",
                    "name": "honey_block",
                    "ench": false
                },
                "criteria": [
                    "honey_block_slide"
                ]
            },
            "ol_betsy": {
                "title": "Ol' Betsy",
                "desc": "Shoot a crossbow",
                "icon": {
                    "type": "item",
                    "name": "crossbow",
                    "ench": false
                },
                "criteria": [
                    "shot_crossbow"
                ]
            },
            "sleep_in_bed": {
                "title": "Sweet Dreams",
                "desc": "Sleep in a bed to change your respawn point",
                "icon": {
                    "type": "block",
                    "name": "red_bed",
                    "ench": false
                },
                "criteria": [
                    "slept_in_bed"
                ]
            },
            "hero_of_the_village": {
                "title": "Hero of the Village",
                "desc": "Successfully defend a village from a raid",
                "icon": {
                    "type": "block",
                    "name": "ominous_banner",
                    "ench": false
                },
                "criteria": [
                    "hero_of_the_village"
                ]
            },
            "throw_trident": {
                "title": "A Throwaway Joke",
                "desc": "Throw a trident at something.\nNote: Throwing away your only weapon is not a good idea.",
                "icon": {
                    "type": "item",
                    "name": "trident",
                    "ench": false
                },
                "criteria": [
                    "shot_trident"
                ]
            },
            "shoot_arrow": {
                "title": "Take Aim",
                "desc": "Shoot something with an arrow",
                "icon": {
                    "type": "item",
                    "name": "bow",
                    "ench": false
                },
                "criteria": [
                    "shot_arrow"
                ]
            },
            "kill_all_mobs": {
                "title": "Monsters Hunted",
                "desc": "Kill one of every hostile monster",
                "icon": {
                    "type": "item",
                    "name": "diamond_sword",
                    "ench": false
                },
                "criteria": [
                    "minecraft:blaze",
                    "minecraft:cave_spider",
                    "minecraft:creeper",
                    "minecraft:drowned",
                    "minecraft:elder_guardian",
                    "minecraft:ender_dragon",
                    "minecraft:enderman",
                    "minecraft:endermite",
                    "minecraft:evoker",
                    "minecraft:ghast",
                    "minecraft:guardian",
                    "minecraft:hoglin",
                    "minecraft:husk",
                    "minecraft:magma_cube",
                    "minecraft:phantom",
                    "minecraft:piglin",
                    "minecraft:piglin_brute",
                    "minecraft:pillager",
                    "minecraft:ravager",
                    "minecraft:shulker",
                    "minecraft:silverfish",
                    "minecraft:skeleton",
                    "minecraft:slime",
                    "minecraft:spider",
                    "minecraft:stray",
                    "minecraft:vex",
                    "minecraft:vindicator",
                    "minecraft:witch",
                    "minecraft:wither",
                    "minecraft:wither_skeleton",
                    "minecraft:zoglin",
                    "minecraft:zombie",
                    "minecraft:zombie_villager",
                    "minecraft:zombified_piglin"
                ]
            },
            "totem_of_undying": {
                "title": "Postmortal",
                "desc": "Use a Totem of Undying to cheat death",
                "icon": {
                    "type": "item",
                    "name": "totem_of_undying",
                    "ench": false
                },
                "criteria": [
                    "used_totem"
                ]
            },
            "summon_iron_golem": {
                "title": "Hired Help",
                "desc": "Summon an Iron Golem to help defend a village",
                "icon": {
                    "type": "block",
                    "name": "carved_pumpkin",
                    "ench": false
                },
                "criteria": [
                    "summoned_golem"
                ]
            },
            "two_birds_one_arrow": {
                "title": "Two Birds, One Arrow",
                "desc": "Kill two Phantoms with a piercing arrow",
                "icon": {
                    "type": "item",
                    "name": "crossbow",
                    "ench": false
                },
                "criteria": [
                    "two_birds"
                ]
            },
            "whos_the_pillager_now": {
                "title": "Who's the Pillager Now?",
                "desc": "Give a Pillager a taste of their own medicine",
                "icon": {
                    "type": "item",
                    "name": "crossbow",
                    "ench": false
                },
                "criteria": [
                    "kill_pillager"
                ]
            },
            "arbalistic": {
                "title": "Arbalistic",
                "desc": "Kill five unique mobs with one crossbow shot",
                "icon": {
                    "type": "item",
                    "name": "crossbow",
                    "ench": false
                },
                "criteria": [
                    "arbalistic"
                ]
            },
            "adventuring_time": {
                "title": "Adventuring Time",
                "desc": "Discover every biome",
                "icon": {
                    "type": "item",
                    "name": "diamond_boots",
                    "ench": false
                },
                "criteria": [
                    "minecraft:badlands",
                    "minecraft:badlands_plateau",
                    "minecraft:bamboo_jungle",
                    "minecraft:bamboo_jungle_hills",
                    "minecraft:beach",
                    "minecraft:birch_forest",
                    "minecraft:birch_forest_hills",
                    "minecraft:cold_ocean",
                    "minecraft:dark_forest",
                    "minecraft:deep_cold_ocean",
                    "minecraft:deep_frozen_ocean",
                    "minecraft:deep_lukewarm_ocean",
                    "minecraft:desert",
                    "minecraft:desert_hills",
                    "minecraft:forest",
                    "minecraft:frozen_river",
                    "minecraft:giant_tree_taiga",
                    "minecraft:giant_tree_taiga_hills",
                    "minecraft:jungle",
                    "minecraft:jungle_edge",
                    "minecraft:jungle_hills",
                    "minecraft:lukewarm_ocean",
                    "minecraft:mountains",
                    "minecraft:mushroom_field_shore",
                    "minecraft:mushroom_fields",
                    "minecraft:plains",
                    "minecraft:river",
                    "minecraft:savanna",
                    "minecraft:savanna_plateau",
                    "minecraft:snowy_beach",
                    "minecraft:snowy_mountains",
                    "minecraft:snowy_taiga",
                    "minecraft:snowy_taiga_hills",
                    "minecraft:snowy_tundra",
                    "minecraft:stone_shore",
                    "minecraft:swamp",
                    "minecraft:taiga",
                    "minecraft:taiga_hills",
                    "minecraft:warm_ocean",
                    "minecraft:wooded_badlands_plateau",
                    "minecraft:wooded_hills",
                    "minecraft:wooded_mountains"
                ]
            },
            "very_very_frightening": {
                "title": "Very Very Frightening",
                "desc": "Strike a Villager with lightning",
                "icon": {
                    "type": "item",
                    "name": "trident",
                    "ench": false
                },
                "criteria": [
                    "struck_villager"
                ]
            },
            "sniper_duel": {
                "title": "Sniper Duel",
                "desc": "Kill a Skeleton from at least 50 meters away",
                "icon": {
                    "type": "item",
                    "name": "arrow",
                    "ench": false
                },
                "criteria": [
                    "killed_skeleton"
                ]
            },
            "bullseye": {
                "title": "Bullseye",
                "desc": "Hit the bullseye of a Target block from at least 30 meters away",
                "icon": {
                    "type": "block",
                    "name": "target",
                    "ench": false
                },
                "criteria": [
                    "bullseye"
                ]
            }
        },
        "husbandry": {
            "root": {
                "title": "Husbandry",
                "desc": "The world is full of friends and food",
                "icon": {
                    "type": "block",
                    "name": "hay_block",
                    "ench": false
                },
                "criteria": [
                    "consumed_item"
                ]
            },
            "safely_harvest_honey": {
                "title": "Bee Our Guest",
                "desc": "Use a Campfire to collect Honey from a Beehive using a Bottle without aggravating the bees",
                "icon": {
                    "type": "item",
                    "name": "honey_bottle",
                    "ench": false
                },
                "criteria": [
                    "safely_harvest_honey"
                ]
            },
            "breed_an_animal": {
                "title": "The Parrots and the Bats",
                "desc": "Breed two animals together",
                "icon": {
                    "type": "item",
                    "name": "wheat",
                    "ench": false
                },
                "criteria": [
                    "bred"
                ]
            },
            "tame_an_animal": {
                "title": "Best Friends Forever",
                "desc": "Tame an animal",
                "icon": {
                    "type": "item",
                    "name": "lead",
                    "ench": false
                },
                "criteria": [
                    "tamed_animal"
                ]
            },
            "fishy_business": {
                "title": "Fishy Business",
                "desc": "Catch a fish",
                "icon": {
                    "type": "item",
                    "name": "fishing_rod",
                    "ench": false
                },
                "criteria": [
                    "cod",
                    "pufferfish",
                    "salmon",
                    "tropical_fish"
                ]
            },
            "silk_touch_nest": {
                "title": "Total Beelocation",
                "desc": "Move a Bee Nest, with 3 bees inside, using Silk Touch",
                "icon": {
                    "type": "block",
                    "name": "bee_nest",
                    "ench": false
                },
                "criteria": [
                    "silk_touch_nest"
                ]
            },
            "plant_seed": {
                "title": "A Seedy Place",
                "desc": "Plant a seed and watch it grow",
                "icon": {
                    "type": "item",
                    "name": "wheat",
                    "ench": false
                },
                "criteria": [
                    "beetroots",
                    "melon_stem",
                    "nether_wart",
                    "pumpkin_stem",
                    "wheat"
                ]
            },
            "bred_all_animals": {
                "title": "Two by Two",
                "desc": "Breed all the animals!",
                "icon": {
                    "type": "item",
                    "name": "golden_carrot",
                    "ench": false
                },
                "criteria": [
                    "minecraft:bee",
                    "minecraft:cat",
                    "minecraft:chicken",
                    "minecraft:cow",
                    "minecraft:donkey",
                    "minecraft:fox",
                    "minecraft:hoglin",
                    "minecraft:horse",
                    "minecraft:llama",
                    "minecraft:mooshroom",
                    "minecraft:mule",
                    "minecraft:ocelot",
                    "minecraft:panda",
                    "minecraft:pig",
                    "minecraft:rabbit",
                    "minecraft:sheep",
                    "minecraft:strider",
                    "minecraft:turtle",
                    "minecraft:wolf"
                ]
            },
            "complete_catalogue": {
                "title": "A Complete Catalogue",
                "desc": "Tame all cat variants!",
                "icon": {
                    "type": "item",
                    "name": "cod",
                    "ench": false
                },
                "criteria": [
                    "textures/entity/cat/all_black.png",
                    "textures/entity/cat/black.png",
                    "textures/entity/cat/british_shorthair.png",
                    "textures/entity/cat/calico.png",
                    "textures/entity/cat/jellie.png",
                    "textures/entity/cat/persian.png",
                    "textures/entity/cat/ragdoll.png",
                    "textures/entity/cat/red.png",
                    "textures/entity/cat/siamese.png",
                    "textures/entity/cat/tabby.png",
                    "textures/entity/cat/white.png"
                ]
            },
            "tactical_fishing": {
                "title": "Tactical Fishing",
                "desc": "Catch a fish... without a fishing rod!",
                "icon": {
                    "type": "item",
                    "name": "pufferfish_bucket",
                    "ench": false
                },
                "criteria": [
                    "cod_bucket",
                    "pufferfish_bucket",
                    "salmon_bucket",
                    "tropical_fish_bucket"
                ]
            },
            "balanced_diet": {
                "title": "A Balanced Diet",
                "desc": "Eat everything that is edible, even if it's not good for you",
                "icon": {
                    "type": "item",
                    "name": "apple",
                    "ench": false
                },
                "criteria": [
                    "apple",
                    "baked_potato",
                    "beef",
                    "beetroot",
                    "beetroot_soup",
                    "bread",
                    "carrot",
                    "chicken",
                    "chorus_fruit",
                    "cod",
                    "cooked_beef",
                    "cooked_chicken",
                    "cooked_cod",
                    "cooked_mutton",
                    "cooked_porkchop",
                    "cooked_rabbit",
                    "cooked_salmon",
                    "cookie",
                    "dried_kelp",
                    "enchanted_golden_apple",
                    "golden_apple",
                    "golden_carrot",
                    "honey_bottle",
                    "melon_slice",
                    "mushroom_stew",
                    "mutton",
                    "poisonous_potato",
                    "porkchop",
                    "potato",
                    "pufferfish",
                    "pumpkin_pie",
                    "rabbit",
                    "rabbit_stew",
                    "rotten_flesh",
                    "salmon",
                    "spider_eye",
                    "suspicious_stew",
                    "sweet_berries",
                    "tropical_fish"
                ]
            },
            "obtain_netherite_hoe": {
                "title": "Serious Dedication",
                "desc": "Use a Netherite ingot to upgrade a hoe, and then reevaluate your life choices",
                "icon": {
                    "type": "item",
                    "name": "netherite_hoe",
                    "ench": false
                },
                "criteria": [
                    "netherite_hoe"
                ]
            }
        }
    };
}
//
//
// MC ADVANCEMENT VIEW
//
//
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
        mainGrid.style.gridTemplateRows = `repeat(${this.templateSizes[category].rows},${String(12 * pixelSize)}px)`;
        mainGrid.style.gridTemplateColumns = `repeat(${this.templateSizes[category].columns},${String(12 * pixelSize)}px)`;
        mainGrid.style.gap = `${String(2 * pixelSize)}px`;
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
    //clean this up
    generateUnderlaySVG(category) {
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
            this.style.backgroundSize = `${String(16 * pixelSize)}px`;
            this.style.padding = `${String(2 * pixelSize)}px`;
            const advancementView = this.generateAdvancementDiv(category);
            this.appendChild(advancementView);
            const cachedSVGEle = this.cachedSVGs[category];
            if (cachedSVGEle == null) {
                const svgEle = this.generateUnderlaySVG(category);
                this.insertBefore(svgEle, this.querySelector("mc-advancement-view>div"));
                this.cachedSVGs[category] = svgEle;
            } else {
                this.insertBefore(cachedSVGEle, this.querySelector("mc-advancement-view>div"));
            }
        }
    }
    //When element is added to DOM
    connectedCallback() {
        if (this.firstTime) {
            this.firstTime = false;
        }
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
    //filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.7));
    //ALL SIZING WILL BE REDONE AND THIS IS STILL BASIC STYLING
    advancementStyling = `\n    mc-advancement {\n      display: inline-block;\n      padding: 20px;\n      background-size: cover;\n      background-image: url(./img/gui/advancement-normal.png);\n      position: relative;\n    }\n\n    mc-advancement[type="challenge"] {\n      background-image: url(./img/gui/advancement-challenge.png);\n    }\n\n    mc-advancement[type="goal"] {\n      background-image: url(./img/gui/advancement-goal.png);\n    }\n\n    mc-advancement[done="true"] {\n      background-image: url(./img/gui/advancement-normal-done.png);\n    }\n\n    mc-advancement[done="true"][type="goal"] {\n      background-image: url(./img/gui/advancement-goal-done.png);\n    }\n\n    mc-advancement[done="true"][type="challenge"] {\n      background-image: url(./img/gui/advancement-challenge-done.png);\n    }\n\n    mc-advancement-view>div {\n      filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.7));\n      position: relative;\n      z-index: 0;\n    }\n  `;
    svgStyling = `\n    line, polyline {\n      stroke-linecap: square;\n      stroke-linejoin: miter;\n      fill: none;\n    }\n\n    line#black, polyline#black {\n      stroke: rgb(0,0,0);\n      stroke-width: ${String(3 * pixelSize)};\n    }\n\n    line#white, polyline#white {\n      stroke: rgb(255,255,255);\n      stroke-width: ${String(pixelSize)};\n    }\n  `;
}
//
//
// MC ITEM ICON
//
//
const webRoot = `${document.currentScript.src}/../../`;
const currentResourcePack = "vanilla";
function namespacedResource(pack, section, namespacedId, extension) {
    if (namespacedId === null || namespacedId === undefined) return "/__null";
    const namespaceSplit = namespacedId.includes(":") ? namespacedId.split(":") : [
        "minecraft",
        namespacedId
    ];
    return `${webRoot}resourcepacks/${pack}/assets/${namespaceSplit[0]}/${section}/${namespaceSplit[1]}.${extension}`;
}
const __jsonModelCache = new OnceCache();
const __modelCache = new OnceCache();
class MCItemIcon extends HTMLElement {
    static get observedAttributes() {
        return [
            "model",
            "enchanted"
        ];
    }
    shadow = this.attachShadow({
        mode: "open"
    });
    renderer = document.createElement("css-renderer");
    innerStyle = document.createElement("style");
    isUpdating = false;
    baseBlockModel = {
        gui_light: "side",
        display: {
            gui: {
                rotation: [
                    30,
                    225,
                    0
                ],
                translation: [
                    0,
                    0,
                    0
                ],
                scale: [
                    0.625,
                    0.625,
                    0.625
                ]
            }
        },
        elements: [
            {
                from: [
                    0,
                    0,
                    0
                ],
                to: [
                    16,
                    16,
                    16
                ]
            }
        ]
    };
    baseItemModel = {
        gui_light: "front",
        display: {
            gui: {
                rotation: [
                    0,
                    180,
                    0
                ],
                translation: [
                    0,
                    0,
                    0
                ],
                scale: [
                    1,
                    1,
                    1
                ]
            }
        },
        elements: [
            {
                from: [
                    0,
                    0,
                    8
                ],
                to: [
                    16,
                    16,
                    8
                ],
                faces: {
                    south: {
                        texture: "#layer0"
                    }
                }
            }
        ]
    };
    constructor(){
        super();
        this.shadow.append(this.innerStyle, this.renderer);
    }
    connectedCallback() {
        this.attributeChangedCallback();
    }
    // need to cache merged model maybe for when update() is called
    async attributeChangedCallback() {
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
        this.innerStyle.textContent = `css-renderer{font-size:${this.clientHeight || 64}px;}`;
        this.renderer.rootOrigin.innerHTML = "";
        if (__modelCache.has(modelAttr)) {
            const cachedModel = __modelCache.get(modelAttr);
            this.renderer.setAttribute("rotate", cachedModel.model?.display?.gui.rotation.join(","));
            this.renderer.setAttribute("scale", cachedModel.model?.display?.gui.scale.join(","));
            this.renderer.setAttribute("translate", cachedModel.model?.display?.gui.translation.join(","));
            for (const ele of cachedModel.elements){
                this.renderer.rootOrigin.insertAdjacentHTML("beforeend", ele);
            }
        } else {
            const model = await this.resolveModel(this.getAttribute("model") || null);
            // move render camera
            this.renderer.setAttribute("rotate", model?.display?.["gui"].rotation.join(","));
            this.renderer.setAttribute("scale", model?.display?.["gui"].scale.join(","));
            this.renderer.setAttribute("translate", model?.display?.["gui"].translation.join(","));
            // go through each element, and add it to renderer
            const elements = [];
            for (const modelElement of model["elements"]){
                const ele = document.createElement("css-renderer-element");
                if ((model.gui_light || "front") == "front") ele.setAttribute("noshade", "");
                ele.setAttribute("from", modelElement.from.join(","));
                ele.setAttribute("to", modelElement.to.join(","));
                // each tests for face.texture to see if its blank texture
                if (modelElement.faces?.north && modelElement.faces.north.texture) {
                    ele.north = await this.getTexture(modelElement.faces.north.texture);
                    ele.northUV = modelElement.faces.north.uv || [
                        0,
                        0,
                        16,
                        16
                    ];
                }
                if (modelElement.faces?.south && modelElement.faces.south.texture) {
                    ele.south = await this.getTexture(modelElement.faces.south.texture);
                    ele.southUV = modelElement.faces.south.uv || [
                        0,
                        0,
                        16,
                        16
                    ];
                }
                if (modelElement.faces?.east && modelElement.faces.east.texture) {
                    ele.east = await this.getTexture(modelElement.faces.east.texture);
                    ele.eastUV = modelElement.faces.east.uv || [
                        0,
                        0,
                        16,
                        16
                    ];
                }
                if (modelElement.faces?.west && modelElement.faces.west.texture) {
                    ele.west = await this.getTexture(modelElement.faces.west.texture);
                    ele.westUV = modelElement.faces.west.uv || [
                        0,
                        0,
                        16,
                        16
                    ];
                }
                if (modelElement.faces?.up && modelElement.faces.up.texture) {
                    ele.up = await this.getTexture(modelElement.faces.up.texture);
                    ele.upUV = modelElement.faces.up.uv || [
                        0,
                        0,
                        16,
                        16
                    ];
                }
                if (modelElement.faces?.down && modelElement.faces.down.texture) {
                    ele.down = await this.getTexture(modelElement.faces.down.texture);
                    ele.downUV = modelElement.faces.down.uv || [
                        0,
                        0,
                        16,
                        16
                    ];
                }
                elements.push(ele.outerHTML);
            }
            __modelCache.add(modelAttr, {
                model,
                elements
            });
            for (const ele of elements){
                this.renderer.rootOrigin.insertAdjacentHTML("beforeend", ele);
            }
        }
        for (const ele of this.renderer.rootOrigin.querySelectorAll("css-renderer-plane")){
            ele.overlay = this.hasAttribute("enchanted") ? "../resourcepacks/vanilla/assets/minecraft/textures/misc/enchanted_item_glint.png" : null;
            ele.overlayStyle = "css-renderer-overlay {" + "mix-blend-mode: screen;" + "background-size: 400%;" + "animation: 20s linear infinite enchantGlint;" + "}" + "@keyframes enchantGlint {" + "from { background-position: 0% 0% }" + "to { background-position: 400% 400% }" + "}";
        }
        this.isUpdating = false;
    }
    // provide default model
    // resolve to a merged model
    async resolveModel(namespacedId) {
        if (namespacedId === null) return this.baseItemModel;
        let modelFilename = namespacedResource("vanilla", "models", namespacedId, "json");
        let modelRes = await loadUrl(modelFilename);
        const modelTree = [];
        // get heirachy into tree
        if (modelRes !== null) {
            let currModel = await __jsonModelCache.add(modelFilename, ()=>modelRes.json()
            );
            modelTree.unshift(currModel);
            while(currModel["parent"]){
                modelFilename = namespacedResource("vanilla", "models", currModel["parent"], "json");
                modelRes = await loadUrl(modelFilename);
                if (modelRes === null) break;
                currModel = await __jsonModelCache.add(modelFilename, ()=>modelRes.json()
                );
                modelTree.unshift(currModel);
            }
        }
        // add in a basic model as a placeholder if nothing found
        modelTree.unshift(namespacedId.includes("block/") ? this.baseBlockModel : this.baseItemModel);
        // merge tree into mergedModel
        const mergedModel = {
            textures: {
            }
        };
        for (const model of modelTree){
            for(const texture in model["textures"])mergedModel["textures"][texture] = model["textures"][texture];
            if (model["display"]) mergedModel["display"] = {
                ...mergedModel["display"],
                ...JSON.parse(JSON.stringify(model["display"]))
            };
            if (model["elements"]) mergedModel["elements"] = JSON.parse(JSON.stringify(model["elements"]));
            if (model["gui_light"]) mergedModel["gui_light"] = model["gui_light"];
        }
        // preprocess textures
        for (const modelElement of mergedModel["elements"]){
            let done = false;
            while(!done){
                done = true;
                for(const faceKey in modelElement["faces"]){
                    //@ts-ignore
                    const face = modelElement["faces"][faceKey];
                    if (face.texture.startsWith("#")) {
                        done = false;
                        // set blank texture
                        face.texture = mergedModel["textures"][face.texture.slice(1)] || "";
                    }
                }
            }
        }
        return mergedModel;
    }
    async getTexture(namespacedId) {
        const textureFilename = namespacedResource(currentResourcePack, "textures", namespacedId, "png");
        const fallbackTextureFilename = namespacedResource("vanilla", "textures", namespacedId, "png");
        const texture = await loadUrl(textureFilename);
        if (texture !== null) return textureFilename;
        else return fallbackTextureFilename;
    }
}
//
//
// MC TOOLTIP FAST
//
//
class MCTooltipFast extends HTMLElement {
    constructor(){
        super();
    }
}
//
//
// MC TOOLTIP FANCY
//
//
class MCTooltipFancy extends HTMLElement {
    shadow = this.attachShadow({
        mode: "closed"
    });
    headerDiv = document.createElement("div");
    titleDiv = document.createElement("div");
    descriptionDiv = document.createElement("div");
    detailsDiv = document.createElement("div");
    detailsDivContent = "Sample Details";
    storedParent = null;
    storedParentInitialZIndex = "";
    storedParentInitialPosition = "";
    mouseEnterFunc = ()=>{
        this.style.visibility = "visible";
        this.storedParent.style.zIndex = "";
    };
    mouseLeaveFunc = ()=>{
        this.style.visibility = "hidden";
        this.storedParent.style.zIndex = "-2";
        this.closeDetails();
    };
    clickFunc = ()=>{
        if (this.detailsOpen) {
            this.closeDetails();
        } else {
            this.openDetails();
        }
    };
    detailsOpen = false;
    // Needed for attributeChangedCallback
    static get observedAttributes() {
        return [
            "done",
            "type"
        ];
    }
    set setTitleText(text) {
        this.titleDiv.innerText = text;
    }
    set setDescriptionText(text) {
        this.descriptionDiv.innerText = text;
    }
    set setDetailsContent(contents) {
        this.detailsDivContent = contents;
    }
    get getDetailsContent() {
        return this.detailsDivContent;
    }
    get getDetailsDiv() {
        return this.detailsDiv;
    }
    updateSelf() {
        const doneValue = this.getAttribute("done");
        const cateValue = this.getAttribute("type");
        if (doneValue != null) {
            this.headerDiv.setAttribute("done", "");
        } else {
            this.headerDiv.removeAttribute("done");
        }
        if (cateValue == "challenge") {
            this.descriptionDiv.setAttribute("challenge", "");
        } else {
            this.descriptionDiv.removeAttribute("challenge");
        }
    }
    setupParent() {
        if (this.storedParent != null) {
            this.storedParent.style.zIndex = "-2";
            this.storedParent.style.position = "relative";
            this.storedParent.addEventListener("mouseenter", this.mouseEnterFunc);
            this.storedParent.addEventListener("mouseleave", this.mouseLeaveFunc);
            this.storedParent.addEventListener("click", this.clickFunc);
        }
    }
    clearParent() {
        if (this.storedParent != null) {
            this.storedParent.style.zIndex = this.storedParentInitialZIndex;
            this.storedParent.style.position = this.storedParentInitialPosition;
            this.storedParent.removeEventListener("mouseenter", this.mouseEnterFunc);
            this.storedParent.removeEventListener("mouseleave", this.mouseLeaveFunc);
            this.storedParent.removeEventListener("click", this.clickFunc);
        }
    }
    openDetails() {
        this.detailsOpen = true;
        this.detailsDiv.style.fontStyle = "";
        this.detailsDiv.style.color = "";
        this.detailsDiv.style.textAlign = "";
        this.style.pointerEvents = "";
        if (typeof this.detailsDivContent == "string") {
            this.detailsDiv.innerHTML = this.detailsDivContent;
        } else {
            this.detailsDiv.innerHTML = "";
            this.detailsDiv.appendChild(this.detailsDivContent);
        }
    }
    closeDetails() {
        this.detailsOpen = false;
        this.detailsDiv.style.color = "#AAAAAA";
        this.detailsDiv.style.fontStyle = "oblique";
        this.detailsDiv.style.textAlign = "left";
        this.detailsDiv.innerHTML = "Click For More...";
        this.style.pointerEvents = "none";
    }
    constructor(){
        super();
        const styleEle = document.createElement("style");
        const parentDiv = document.createElement("div");
        parentDiv.id = "parent";
        this.headerDiv.id = "header";
        this.titleDiv.id = "title";
        this.descriptionDiv.id = "description";
        this.detailsDiv.id = "details";
        styleEle.textContent = this.styling;
        this.headerDiv.append(this.titleDiv);
        parentDiv.append(this.headerDiv, this.descriptionDiv, this.detailsDiv);
        this.shadow.append(styleEle, parentDiv);
        this.setTitleText = "Sample Title";
        this.setDescriptionText = "Sample Description";
        this.closeDetails();
    }
    connectedCallback() {
        this.storedParent = this.parentElement;
        this.storedParentInitialZIndex = this.storedParent != null ? this.storedParent.style.zIndex : "";
        this.storedParentInitialPosition = this.storedParent != null ? this.storedParent.style.position : "";
        this.style.display = "inline-block";
        this.style.visibility = "hidden";
        this.style.position = "absolute";
        this.style.left = "-12px";
        this.style.top = "12px";
        this.style.zIndex = "-1";
        this.updateSelf();
        this.setupParent();
    }
    attributeChangedCallback() {
        this.updateSelf();
    }
    disconnectedCallback() {
        this.clearParent();
    }
    styling = `\n    div {\n      font-size: ${String(8 * pixelSize)}px;\n      line-height: ${String(8 * pixelSize)}px;\n      text-align: left;\n    }\n\n    div#parent {\n      border-image: url(../img/gui/tooltip-fancy-content.png) 2 fill;\n      border-width: ${String(2 * pixelSize)}px;\n      border-style: solid;\n    }\n\n    div#header {\n      border-image: url(../img/gui/tooltip-fancy-header-blue.png) 2 fill;\n      border-width: ${String(2 * pixelSize)}px;\n      border-style: solid;\n      color: white; \n      margin: -${String(2 * pixelSize)}px;\n    }\n\n    div#header[done] {\n      border-image: url(../img/gui/tooltip-fancy-header-orange.png) 2 fill;\n    }\n\n    div#header>div {\n      display: inline-block;\n    }\n\n    div#filler {\n      width: ${String(26 * pixelSize)}px;\n    }\n\n    div#title {\n      padding: ${String(4 * pixelSize)}px;\n      text-shadow: ${String(pixelSize * 0.75)}px ${String(pixelSize * 0.75)}px #3E3E3E;\n      width: max-content;\n      margin-left: ${String(26 * pixelSize)}px;\n    }\n\n    div#description {\n      color: #54FC54;\n      text-shadow: none;\n      padding: ${String(4 * pixelSize)}px ${String(2 * pixelSize)}px ${String(2 * pixelSize)}px;\n    }\n\n    div#description[challenge] {\n      color: #A800A8;\n    }\n\n    div#details {\n      text-shadow: none;\n      padding: ${String(4 * pixelSize)}px ${String(2 * pixelSize)}px ${String(2 * pixelSize)}px;\n    }\n\n    ul {\n      list-style-type: none;\n      margin: 0px;\n      padding: 0px;\n    }\n\n    ul>li {\n      text-indent: ${String(3 * pixelSize)}px\n    }\n\n    ul>li:before {\n      content: "-";\n    }\n\n    li[done] {\n      color: #55FFFF;\n    }\n  `;
}
customElements.define('mc-tooltip-fancy', MCTooltipFancy);
customElements.define('mc-advancement', MCAdvancement);
customElements.define('mc-advancement-view', MCAdvancementView);
customElements.define('mc-item-icon', MCItemIcon);
