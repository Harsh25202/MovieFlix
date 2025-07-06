export const dummyMovies = [
  {
    _id: "573a1390f29313caabcd42e8",
    title: "The Great Train Robbery",
    plot: "A group of bandits stage a brazen train hold-up, only to find a determined posse hot on their heels.",
    fullplot:
      "Among the earliest existing films in American cinema - notable as the first film that presented a narrative story to tell - it depicts a group of cowboy outlaws who hold up a train and rob the passengers.",
    genres: ["Short", "Western"],
    runtime: 11,
    cast: ["A.C. Abadie", "Gilbert M. 'Broncho Billy' Anderson", "George Barnes", "Justus D. Barnes"],
    poster:
      "https://m.media-amazon.com/images/M/MV5BMTU3NjE5NzYtYTYyNS00MDVmLWIwYjgtMmYwYWIxZDYyNzU2XkEyXkFqcGdeQXVyNzQzNzQxNzI@._V1_SY1000_SX677_AL_.jpg",
    year: 1903,
    rated: "TV-G",
    imdb: { rating: 7.4, votes: 9847, id: 439 },
    countries: ["USA"],
    languages: ["English"],
    directors: ["Edwin S. Porter"],
    num_mflix_comments: 12,
  },
  {
    _id: "573a1390f29313caabcd5293",
    title: "The Perils of Pauline",
    plot: "Young Pauline is left a lot of money when her wealthy uncle dies. However, her uncle's secretary has been named as her guardian until she marries.",
    fullplot:
      "Young Pauline is left a lot of money when her wealthy uncle dies. However, her uncle's secretary has been named as her guardian until she marries, at which time she will officially take possession of her inheritance.",
    genres: ["Action"],
    runtime: 199,
    cast: ["Pearl White", "Crane Wilbur", "Paul Panzer", "Edward Josè"],
    poster:
      "https://m.media-amazon.com/images/M/MV5BMzgxODk1Mzk2Ml5BMl5BanBnXkFtZTgwMDg0NzkwMjE@._V1_SY1000_SX677_AL_.jpg",
    year: 1914,
    imdb: { rating: 7.6, votes: 744, id: 4465 },
    countries: ["USA"],
    languages: ["English"],
    directors: ["Louis J. Gasnier", "Donald MacKenzie"],
    num_mflix_comments: 8,
  },
]

export const dummyComments = [
  {
    _id: "5a9427648b0beebeb69579e7",
    name: "Mercedes Tyler",
    email: "mercedes_tyler@fakegmail.com",
    movie_id: "573a1390f29313caabcd4323",
    text: "Amazing cinematography and storytelling. This film really captures the essence of early cinema.",
    date: new Date("2002-08-18T04:56:07.000Z"),
  },
  {
    _id: "5a9427648b0beebeb69579e8",
    name: "John Smith",
    email: "john.smith@example.com",
    movie_id: "573a1390f29313caabcd42e8",
    text: "A classic that started it all! The train robbery scene is iconic.",
    date: new Date("2023-01-15T10:30:00.000Z"),
  },
]

export const dummyTheaters = [
  {
    _id: "59a47286cfa9a3a73e51e72d",
    theaterId: 1003,
    location: {
      address: {
        street1: "45235 Worth Ave.",
        city: "California",
        state: "MD",
        zipcode: "20619",
      },
      geo: {
        type: "Point",
        coordinates: [-76.512016, 38.29697],
      },
    },
  },
  {
    _id: "59a47286cfa9a3a73e51e72e",
    theaterId: 1004,
    location: {
      address: {
        street1: "123 Main St.",
        city: "New York",
        state: "NY",
        zipcode: "10001",
      },
      geo: {
        type: "Point",
        coordinates: [-74.006, 40.7128],
      },
    },
  },
]

export const dummyUsers = [
  {
    _id: "59b99db6cfa9a34dcd7885bb",
    name: "Daenerys Targaryen",
    email: "emilia_clarke@gameofthron.es",
    password: "$2b$12$NzpbWHdMytemLtTfFKduHenr2NZ.rvxIKuYM4AWLTFaUShxbJ.G3q",
  },
]
