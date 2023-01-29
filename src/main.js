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
            createTypeListing(obj);
        }
        else {
            createPokemonListing(obj);
        }
    })
}

class Pokemon {
    constructor(types, strengths, weaknesses, generation, evolvesFrom, evolvesTo) {
        this._types = types;
        this._strengths = strengths;
        this._weaknesses = weaknesses;
        this._generation = generation;
        this._evolvesFrom = evolvesFrom;
        this._evolvesTo = evolvesTo;
    }


}
function createPokemonListing(obj) {
    console.log(obj);
    const imageContainer = document.querySelector('#pokemon_image');
    const img = document.createElement('img');
    img.src = obj.sprites.front_default;
    img.alt = `${obj.name}`;
    imageContainer.appendChild(img);
    const table = document.querySelector('#table_container');
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
        console.log(split[1])
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
            if (objFour.chain.evolves_to.length > 1) {
                objFour.chain.evolves_to.forEach(evo => {
                     tdEvolveTo.innerHTML += ', <a id="' + evo.species["name"]  + '"href="#user_search_bar">' + evo.species['name'] + '</a>'
                     const tableEvo = document.querySelector(`#${evo.species['name']}`);
                     console.log(tableEvo)
                     tableEvo.addEventListener('click', function() {
                        console.log('hereInEventListener');
                        clearPage(true);
                        fetch(`https://pokeapi.co/api/v2/pokemon/${evo.species['name']}`)
                        .then(res => res.json())
                        .then(function(objSix, ) {
                            createPokemonListing(objSix);
                        })
                    });
                })
                tdEvolveTo.innerHTML = tdEvolveTo.innerHTML.substring(1);
                pokemon = null;
                //for each evolution,
                //display in table, adding event listener to each
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

function createTypeListing(obj) {

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