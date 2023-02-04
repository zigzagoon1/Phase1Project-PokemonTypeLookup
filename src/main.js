import getMultipliers from "./multipliers.js";
let dropDown;
let userSearchBar;
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#search_form');
    dropDown = document.querySelector('#drop_down');
    userSearchBar = document.querySelector('#user_search_bar');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        fetchPokemonOrType(e);
    });

})
function fetchPokemonOrType(e) {
    const searchBy = e.target.type_or_pokemon.value;
    const searchThis = e.target.user_search_bar.value.toLowerCase();
    
    const div = document.querySelector('#pokemon_image');
    if (div.firstChild !== null) {
    clearPage();
    }
    fetch(`https://pokeapi.co/api/v2/${searchBy}/${searchThis}`)
    .then(res => res.json())
    .then(function(obj) {
        if (searchBy === 'type') {
            createTypeListing(obj, e);
        }
        else {
            createPokemonListing(obj);
        }
    })

}


function createPokemonListing(obj) {
    resetForm();
    clearPage(true);
    const imageContainer = document.querySelector('#pokemon_image');
    const img = document.createElement('img');
    img.src = obj.sprites.front_default;
    img.alt = `${obj.name}`;
    imageContainer.appendChild(img);
    const table = document.querySelector('#pokemon_table_container');
    table.style.display = 'block';
    
    const tableType = document.querySelector('#pokemon_type');
    const types = [];
    types[0] = obj.types[0]['type']['name'];
    types[0] = types[0][0].toUpperCase() + types[0].substring(1);
    if (obj.types.length > 1) {
        types[1] = obj.types[1]['type']['name'];
        types[1] = types[1][0].toUpperCase() + types[1].substring(1);
    }
    tableType.innerHTML = types;
    fetchTypeDetails(types, obj);
    fetchEvolutionAndGenerationDetails(obj);
}

function fetchTypeDetails(types, obj) {
    const lowerTypes = [];
     types.forEach(function(type) {
        type = type.toLowerCase();
        lowerTypes.push(type)
    })
    const multipliers = getMultipliers(lowerTypes);
    const tdStrength = document.querySelector('#strong_against');
    const tdWeak = document.querySelector('#weak_against');
    
    for (const type in multipliers.attack) {
        if (multipliers.attack[type] > 1) {
            tdStrength.innerHTML += ', ' + type[0].toUpperCase() + type.substring(1);
        } 
    }
    for (const type in multipliers.defense) {
        if (multipliers.defense[type] > 1) {
            tdWeak.innerHTML += ', ' + type[0].toUpperCase() + type.substring(1);
        }
    }
    tdWeak.innerHTML = tdWeak.innerHTML.substring(1);
    tdStrength.innerHTML = tdStrength.innerHTML.substring(1)
}


function fetchEvolutionAndGenerationDetails(obj) {
    fetch(`https://pokeapi.co/api/v2/pokemon-species/${obj.name}`)
    .then(res => res.json())
    .then(function(objTwo) {
        const tdGeneration = document.querySelector('#generation');
        const split = objTwo.generation['name'].split('-');
        const generation = setGenerationFromNumeral(split[1]);
        tdGeneration.innerHTML = generation;
        const tdEvolveFrom = document.querySelector('#evolves_from');
        if (objTwo.evolves_from_species === null) {
            tdEvolveFrom.innerHTML = 'None';
        }
        else {
            tdEvolveFrom.innerHTML = '<a href="#user_search_bar">'+objTwo.evolves_from_species['name'][0].toUpperCase() + 
                objTwo.evolves_from_species['name'].substring(1)+'</a>';
            if (tdEvolveFrom.innerHTML !== 'None') {
                tdEvolveFrom.addEventListener('click', function handler() {
                    clearPage(true);
                    fetch(`https://pokeapi.co/api/v2/pokemon/${objTwo.evolves_from_species['name']}`)
                    .then(res => res.json())
                    .then(function(objThree) {
                        tdEvolveFrom.removeEventListener('click', handler)
                        createPokemonListing(objThree);
                    })
                })
            }

        }
        const tdEvolveTo = document.querySelector('#evolves_into');
        fetch(`${objTwo.evolution_chain['url']}`)
        .then(res => res.json())
        .then(function(objFour) {
            let pokemon;
            let innerString = "";
            let evoChain;
            let namesMatch = false;
            if (objFour.chain.evolves_to.length > 1 || objFour.chain.evolves_to[0].evolves_to.length > 1) {
                if (objFour.chain.evolves_to.length > 1) {
                    evoChain = objFour.chain.evolves_to;
                }
                else {
                    evoChain = objFour.chain.evolves_to[0].evolves_to;
                }
                
                    evoChain.forEach(evo => {
                        if (objTwo.name === evo.species['name']) {
                            namesMatch = true;
                            console.log('names match');
                        }
                        innerString += ', <a id="' + evo.species["name"]  + '"href="#user_search_bar">' + evo.species['name'] + '</a>'
                       });
                   tdEvolveTo.innerHTML = innerString.substring(1);
                   for (let i = 0; i < evoChain.length; i++) {
                       const tableEvo = document.querySelector(`#${evoChain[i].species['name']}`);
                       tableEvo.addEventListener('click', function() {
                           clearPage(true);
                           fetch(`https://pokeapi.co/api/v2/pokemon/${evoChain[i].species['name']}`)
                           .then(res => res.json())
                           .then(function(objSix, ) {
                               createPokemonListing(objSix);
                           })
                       })
                   }
                   pokemon = null;
                }
            else if (objFour.chain.evolves_to.length < 1) {
                tdEvolveTo.innerHTML = 'None';
            }
            else if (objFour.chain.evolves_to.length < 2 && objFour.chain.species['name'] === obj.name.toLowerCase()) {
                tdEvolveTo.innerHTML = '<a href="#user_search_bar">' +
                objFour.chain.evolves_to[0].species['name'][0].toUpperCase() +
                objFour.chain.evolves_to[0].species['name'].substring(1) + '</a>';
                pokemon = objFour.chain.evolves_to[0].species['name'];
            }
            else if (objFour.chain.evolves_to[0].species['name'] === obj.name.toLowerCase()) {
                tdEvolveTo.innerHTML =  '<a href="#user_search_bar">' + 
                    objFour.chain.evolves_to[0].evolves_to[0].species['name'][0].toUpperCase() + 
                    objFour.chain.evolves_to[0].evolves_to[0].species['name'].substring(1) + '</a>';
                    pokemon = objFour.chain.evolves_to[0].evolves_to[0].species['name'];
            }
            else {
                tdEvolveTo.innerHTML = 'None';
            }
            if (namesMatch) {
                tdEvolveTo.innerHTML = 'None';
            }
            if (tdEvolveTo.innerHTML !== 'None' && pokemon !== null) {
                tdEvolveTo.addEventListener('click', function handler() {
                    clearPage(true);
                    fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`)
                    .then(res => res.json())
                    .then(function(objFive) {
                        tdEvolveTo.removeEventListener('click', handler)
                        createPokemonListing(objFive);
                    })
                })
            }
        })
    })
}
function setGenerationFromNumeral(romanNumeral) {
    switch (romanNumeral) {
        case 'i': return 1;
        break;
    case 'ii': return 2;
        break;
    case 'iii': return 3;
        break;
    case 'iv': return 4;
        break;
    case 'v': return 5;
        break;
    case 'vi': return 6;
        break;
    case 'vii': return 7;
        break;
    case 'viii': return 8;
        break;
    case 'xi': return 9;
        break;
    case 'x': return 10;
        break;
    case 'ix': return 11;
        break;
}
    }

class Pokemon {
    constructor(stats) {
        this._stats = stats;
    }
}
function createTypeListing(obj, e) {
    clearPage(true);
    const searchedType = e.target.user_search_bar.value.toLowerCase();
    fetch(`https://pokeapi.co/api/v2/type/${searchedType}`)
    .then(res => res.json())
    .then(function(objTwo) {
        resetForm();
        const table = document.querySelector('#type_table_container');
        table.style.display = 'block';
        console.log(objTwo);
        const type = document.querySelector('#type_searched');
        type.innerHTML = objTwo['name'][0].toUpperCase() + objTwo.name.substring(1);

        setDamage('double_damage_to', objTwo);
        setDamage('double_damage_from', objTwo);

        setDamage('half_damage_to', objTwo);
        setDamage('half_damage_from', objTwo);

        setDamage('no_damage_to', objTwo);
        setDamage('no_damage_from', objTwo);

        const pokeHeader = document.querySelector('#poke_type_header');
        const ol = document.createElement('ol');
        for (let i = 0; i < objTwo.pokemon.length; i++) {
            const li = document.createElement('li');
            fetch(`${objTwo.pokemon[i].pokemon.url}`)
            .then(res => res.json())
            .then(function(objThree){
                const baseStats = [];
                objThree.stats.forEach(stat => {
                    baseStats.push({name: stat['stat']['name'], base: stat.base_stat});
                })
                const pokemon = new Pokemon(baseStats);
                li.innerHTML = objTwo.pokemon[i].pokemon.name[0].toUpperCase() + objTwo.pokemon[i].pokemon.name.substring(1);
                li.className = 'tooltip';
                const p = document.createElement('p');
                p.className = 'tooltiptext';
                li.appendChild(p);
                li.addEventListener('mouseover', function() {
                    p.style.display = "block"
                    p.innerHTML = `Base Stats: <br>HP: ${pokemon._stats[0].base}<br> Attack: ${pokemon._stats[1].base}<br>
                     Defense: ${pokemon._stats[2].base}<br>
                     Special Attack: ${pokemon._stats[3].base}<br>
                     Special Defense: ${pokemon._stats[4].base}<br> Speed: ${pokemon._stats[5].base} `;
                })
                li.addEventListener('mouseleave', function() {
                    p.style.display = 'none';                    
                })
                ol.appendChild(li);
        })
        pokeHeader.appendChild(ol);
}})
}

function setDamage(damageType, obj) {
    const damage = document.querySelector(`#${damageType}`);
    let innerString = "";
    for (let i = 0; i < obj.damage_relations[damageType].length; i++) {
        innerString += `, ${obj.damage_relations[damageType][i].name[0].toUpperCase() +
        obj.damage_relations[damageType][i].name.substring(1)}`;
    }
    if (innerString === "") {
        innerString = ' None'; 
    }
    damage.innerHTML = innerString.substring(1);
}

function clearPage(clearTableBool) {
    const div = document.querySelector('#pokemon_image');
    if (div.firstChild !== null) {
        div.firstChild.remove();
    }
    if (clearTableBool) {
        const tableType = document.querySelector('#pokemon_type');
        tableType.innerHTML = "";
        const tableStrengths = document.querySelector('#strong_against');
        tableStrengths.innerHTML = "";
        const tableWeakness = document.querySelector('#weak_against');
        tableWeakness.innerHTML = "";
        const tableEvolvesFrom = document.querySelector('#evolves_from');
        tableEvolvesFrom.innerHTML = "";
        const tableEvolvesTo = document.querySelector('#evolves_into');
        tableEvolvesTo.innerHTML = "";

        // const typeSearched = document.querySelector('#type_searched');
        // typeSearched.innerHTML = "";
        // const ddTo = document.querySelector('#double_damage_to');
        // ddTo.innerHTML = "";
        // const ddFrom = document.querySelector('#double_damage_from');
        // ddTo.innerHTML = "";
        // const hdTo = document.querySelector('#half_damage_to');
        // hdTo.innerHTML = "";
        // const hdFrom = document.querySelector('#half_damag_from');
        // hdFrom.innerHTML = "";
        const pokeType = document.querySelector('#poke_type_header');
        while (pokeType.firstChild) {
            pokeType.firstChild.remove();
        }
    }
    const typeTable = document.querySelector('#type_table_container');
    typeTable.style.display = 'none';
    const pokemonTable = document.querySelector('#pokemon_table_container');
    pokemonTable.style.display = 'none';
}

function resetForm() {
    const form = document.querySelector('#search_form');
    form.reset();
}