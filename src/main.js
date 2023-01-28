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
    fetchGeneration(obj);
    fetchEvolutionDetails(obj);
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
    console.log(multipliers);
    const tdStrength = document.createElement('td');
    const tdWeak = document.createElement('td');
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
    tableStrengths.appendChild(tdStrength);
    tableWeaknesses.appendChild(tdWeak);
    console.log(multipliers);
}

function fetchGeneration(obj) {

}

function fetchEvolutionDetails(obj) {

}

function createTypeListing(obj) {

}

function clearPage() {
    const div = document.querySelector('#pokemon_image');
    if (div.firstChild !== null) {
        div.firstChild.remove();
    }
}