
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

function createPokemonListing(obj) {
    console.log(obj);
    const imageContainer = document.querySelector('#pokemon_image');
    const img = document.createElement('img');
    img.src = obj.sprites.front_default;
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
    
}

function createTypeListing(obj) {

}

function clearPage() {
    
}