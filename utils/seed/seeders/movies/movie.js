const Movie = require('../../../../models/movie');
const quantity = 20;

let movies = [];

for (let i = 0; i < quantity; i++){
  const index = i + 1;
  const movie = {
    title: 'Test movie ' + index,
    description: 'The best movie ever ' + index,
    actors: ['Jon Doe', 'Frank Lowis'],
    directors: ['Steven Jhonson'],
    image: 'https://picsum.photos/200/300',
    stock: 1 + index
  }

  movies.push(movie)
}

module.exports = movies;


