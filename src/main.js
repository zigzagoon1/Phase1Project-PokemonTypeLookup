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
    console.log(obj);
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
    const tableStrengths = document.querySelector('#strong_against');
    const tableWeaknesses = document.querySelector('#weak_against');
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
        let generation;
        const split = objTwo.generation['name'].split('-');
        switch (split[1]) {
            case 'i': generation = 1;
                break;
            case 'ii': generation = 2;
                break;
            case 'iii': generation = 3;
                break;
            case 'iv': generation = 4;
                break;
            case 'v': generation = 5;
                break;
            case 'vi': generation = 6;
                break;
            case 'vii': generation = 7;
                break;
            case 'viii': generation = 8;
                break;
            case 'xi': generation = 9;
                break;
            case 'x': generation = 10;
                break;
            case 'ix': generation = 11;
                break;
        }
        tdGeneration.innerHTML = generation;
        const tdEvolveFrom = document.querySelector('#evolves_from');
        if (objTwo.evolves_from_species === null) {
            tdEvolveFrom.innerHTML = 'None';
        }
        else {
            tdEvolveFrom.innerHTML = '<a href="#user_search_bar">'+objTwo.evolves_from_species['name'][0].toUpperCase() + 
                objTwo.evolves_from_species['name'].substring(1)+'</a>';
            if (tdEvolveFrom.innerHTML !== 'None') {
                tdEvolveFrom.addEventListener('click', () => {
                    clearPage(true);
                    fetch(`https://pokeapi.co/api/v2/pokemon/${objTwo.evolves_from_species['name']}`)
                    .then(res => res.json())
                    .then(function(objThree) {
                        createPokemonListing(objThree);
                    })
                })
            }

        }
        const tdEvolveTo = document.querySelector('#evolves_into');
        fetch(`${objTwo.evolution_chain['url']}`)
        .then(res => res.json())
        .then(function(objFour) {
            console.log(objFour)
            let pokemon;
            let innerString = "";
            let evoChain;
            if (objFour.chain.evolves_to.length > 1 || objFour.chain.evolves_to[0].evolves_to.length > 1 || objFour.chain.evolves_to[0].evolves_to[0].evolves_to.length > 1) {
                if (objFour.chain.evolves_to.length > 1) {
                    evoChain = objFour.chain.evolves_to;
                    
                }
                else {
                    evoChain = objFour.chain.evolves_to[0].evolves_to;
                    console.log(evoChain)
                }
                    evoChain.forEach(evo => {
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
            else if (obj.Four.chain.evolves_to.length < 2 && objFour.chain.evolves_to[0].species['name'] === obj.name.toLowerCase()) {
                tdEvolveTo.innerHTML =  '<a href="#user_search_bar">' + 
                    objFour.chain.evolves_to[0].evolves_to[0].species['name'][0].toUpperCase() + 
                    objFour.chain.evolves_to[0].evolves_to[0].species['name'].substring(1) + '</a>';
                    pokemon = objFour.chain.evolves_to[0].evolves_to[0].species['name'];
            }
            else {
                tdEvolveTo.innerHTML = 'None';
            }
            if (tdEvolveTo.innerHTML !== 'None' && pokemon !== null) {
                console.log('here');
                tdEvolveTo.addEventListener('click', () => {
                    clearPage(true);
                    fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`)
                    .then(res => res.json())
                    .then(function(objFive) {
                        createPokemonListing(objFive);
                    })
                })
            }

        })
    })

}
class Pokemon {
    constructor(stats) {
        this._stats = stats;
    }
}
function createTypeListing(obj, e) {
    fetch(`https://pokeapi.co/api/v2/type/${e.target.user_search_bar.value}`)
    .then(res => res.json())
    .then(function(objTwo) {
        console.log(objTwo);
        const table = document.querySelector('#type_table_container');
        table.style.display = 'block';

        const type = document.querySelector('#type_searched');
        type.innerHTML = objTwo.name[0].toUpperCase() + objTwo.name.substring(1);

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
                li.innerHTML = objTwo.pokemon[i].pokemon.name;
                li.className = 'tooltip';
                const p = document.createElement('p');
                p.className = 'tooltiptext';
                li.appendChild(p);
                console.log(pokemon);
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
        tableType.innerHTML = null;
        const tableStrengths = document.querySelector('#strong_against');
        tableStrengths.innerHTML = null;
        const tableWeakness = document.querySelector('#weak_against');
        tableWeakness.innerHTML = null;
        const tableEvolvesFrom = document.querySelector('#evolves_from');
        tableEvolvesFrom.innerHTML = null;
    }
}