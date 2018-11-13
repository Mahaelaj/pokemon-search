import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as _ from 'lodash';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent {

	allPokemon = [];
	displayPokemon = [];
	showNoPokemonMessage = false;

	constructor(public http: HttpClient) {

		// get the list of pokemon
		this.http.get('https://pokeapi.co/api/v2/pokemon/')
			.subscribe((result: { results: object[] }) => this.allPokemon = result.results);
	}

	/**
	 * search for pokemon data that have names that begin with the text in the search bar when the enter key is pressed 
	 */
	onEnterUp(prefix) {

		// do not show any pokemon if the search bar is empty 
		if (!prefix) {
			this.displayPokemon = [];
			return;
		}
		this.displayPokemon = _.filter(this.allPokemon, pokemon => _.startsWith(pokemon.name, prefix.toLowerCase()));

		// show an error message if no pokemon are found
		this.showNoPokemonMessage = !this.displayPokemon.length;
		this.getPokemonData();
	}

	/**
	 * request more data from the PokeAPI for displaying in the UI
	 * cache the pokemon data because PokeApi limits requests to their api to 100 requests per minute
	 */
	getPokemonData() {
		this.displayPokemon.forEach(pokemon => {

			// there is no reason to request the pokemon's data from PokeApi if the data has already been cached
			if (pokemon.id) return;
			this.http.get(pokemon.url)
				.subscribe((result: object) => {

					// cache the pokemon data so a request for the same pokemon data will not need to be made again
					_.merge(pokemon, result);
					_.merge(this.allPokemon, result)
				})
		})
	}

	/**
	 * not all pokemon have sprites, so I only show sprites for the pokemon that have one
	 */
	getSprite(pokemon) {
		if (!pokemon.sprites) return null;
		if (pokemon.sprites.front_default) return pokemon.sprites.front_default;
		if (pokemon.sprites.back_default) return pokemon.sprites.back_default;
	}
}
