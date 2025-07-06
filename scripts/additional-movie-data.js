// Additional movie data to add to your MongoDB database
// Run this script to add more movies to your collection

const { MongoClient } = require("mongodb")
const path = require("path")

// Load environment variables
function loadEnvironment() {
  const envFiles = [".env", ".env.production", ".env.local"]
  for (const envFile of envFiles) {
    const envPath = path.join(process.cwd(), envFile)
    try {
      require("dotenv").config({ path: envPath, override: false })
    } catch (error) {
      // Continue to next file
    }
  }
}

loadEnvironment()

const additionalMovies = [
  {
    title: "The Dark Knight",
    plot: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    fullplot:
      "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets. The partnership proves to be effective, but they soon find themselves prey to a reign of chaos unleashed by a rising criminal mastermind known to the terrified citizens of Gotham as the Joker.",
    genres: ["Action", "Crime", "Drama"],
    runtime: 152,
    cast: [
      "Christian Bale",
      "Heath Ledger",
      "Aaron Eckhart",
      "Michael Caine",
      "Maggie Gyllenhaal",
      "Gary Oldman",
      "Morgan Freeman",
    ],
    poster:
      "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SY1000_CR0,0,675,1000_AL_.jpg",
    year: 2008,
    rated: "PG-13",
    imdb: { rating: 9.0, votes: 2500000, id: 468569 },
    countries: ["USA", "UK"],
    languages: ["English", "Mandarin"],
    directors: ["Christopher Nolan"],
    num_mflix_comments: 0,
    released: new Date("2008-07-18"),
    awards: { wins: 159, nominations: 163, text: "Won 2 Oscars. Another 157 wins & 163 nominations." },
    type: "movie",
  },
  {
    title: "Inception",
    plot: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    fullplot:
      "Dom Cobb is a skilled thief, the absolute best in the dangerous art of extraction, stealing valuable secrets from deep within the subconscious during the dream state, when the mind is at its most vulnerable. Cobb's rare ability has made him a coveted player in this treacherous new world of corporate espionage, but it has also made him an international fugitive and cost him everything he has ever loved. Now Cobb is being offered a chance at redemption. One last job could give him his life back but only if he can accomplish the impossible, inception.",
    genres: ["Action", "Sci-Fi", "Thriller"],
    runtime: 148,
    cast: [
      "Leonardo DiCaprio",
      "Marion Cotillard",
      "Tom Hardy",
      "Ellen Page",
      "Ken Watanabe",
      "Joseph Gordon-Levitt",
      "Cillian Murphy",
    ],
    poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SY1000_CR0,0,675,1000_AL_.jpg",
    year: 2010,
    rated: "PG-13",
    imdb: { rating: 8.8, votes: 2200000, id: 1375666 },
    countries: ["USA", "UK"],
    languages: ["English", "Japanese", "French"],
    directors: ["Christopher Nolan"],
    num_mflix_comments: 0,
    released: new Date("2010-07-16"),
    awards: { wins: 157, nominations: 220, text: "Won 4 Oscars. Another 153 wins & 220 nominations." },
    type: "movie",
  },
  {
    title: "Pulp Fiction",
    plot: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
    fullplot:
      "Jules Winnfield and Vincent Vega are two hit men who are out to retrieve a suitcase stolen from their employer, mob boss Marsellus Wallace. Wallace has also asked Vincent to take his wife Mia out a few days later when Wallace himself will be out of town. Butch Coolidge is an aging boxer who is paid by Wallace to lose his fight. The lives of these seemingly unrelated people are woven together comprising of a series of funny, bizarre and uncalled-for incidents.",
    genres: ["Crime", "Drama"],
    runtime: 154,
    cast: [
      "John Travolta",
      "Uma Thurman",
      "Samuel L. Jackson",
      "Bruce Willis",
      "Ving Rhames",
      "Harvey Keitel",
      "Tim Roth",
    ],
    poster:
      "https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SY1000_CR0,0,675,1000_AL_.jpg",
    year: 1994,
    rated: "R",
    imdb: { rating: 8.9, votes: 1900000, id: 110912 },
    countries: ["USA"],
    languages: ["English", "Spanish", "French"],
    directors: ["Quentin Tarantino"],
    num_mflix_comments: 0,
    released: new Date("1994-10-14"),
    awards: { wins: 69, nominations: 71, text: "Won 1 Oscar. Another 68 wins & 71 nominations." },
    type: "movie",
  },
  {
    title: "The Matrix",
    plot: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
    fullplot:
      "Thomas A. Anderson is a man living two lives. By day he is an average computer programmer and by night a hacker known as Neo. Neo has always questioned his reality, but the truth is far beyond his imagination. Neo finds himself targeted by the police when he is contacted by Morpheus, a legendary computer hacker branded a terrorist by the government. Morpheus awakens Neo to the real world, a ravaged wasteland where most of humanity have been captured by a race of machines that live off of the humans' body heat and electrochemical energy and who imprison their minds within an artificial reality known as the Matrix.",
    genres: ["Action", "Sci-Fi"],
    runtime: 136,
    cast: [
      "Keanu Reeves",
      "Laurence Fishburne",
      "Carrie-Anne Moss",
      "Hugo Weaving",
      "Gloria Foster",
      "Joe Pantoliano",
      "Marcus Chong",
    ],
    poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SY1000_CR0,0,675,1000_AL_.jpg",
    year: 1999,
    rated: "R",
    imdb: { rating: 8.7, votes: 1800000, id: 133093 },
    countries: ["USA"],
    languages: ["English"],
    directors: ["Lana Wachowski", "Lilly Wachowski"],
    num_mflix_comments: 0,
    released: new Date("1999-03-31"),
    awards: { wins: 37, nominations: 51, text: "Won 4 Oscars. Another 33 wins & 51 nominations." },
    type: "movie",
  },
  {
    title: "Forrest Gump",
    plot: "The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an IQ of 75.",
    fullplot:
      "Forrest Gump is a simple man with a low I.Q. but good intentions. He is running through childhood with his best and only friend Jenny. His 'mama' teaches him the ways of life and leaves him to choose his destiny. Forrest joins the army for service in Vietnam, finding new friends called Dan and Bubba, he wins medals, creates a famous shrimp fishing fleet, inspires people to jog, starts a ping-pong craze, creates the smiley, writes bumper stickers and songs, donates to people and meets the president several times.",
    genres: ["Drama", "Romance"],
    runtime: 142,
    cast: [
      "Tom Hanks",
      "Robin Wright",
      "Gary Sinise",
      "Sally Field",
      "Mykelti Williamson",
      "Michael Conner Humphreys",
      "Hanna Hall",
    ],
    poster:
      "https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SY1000_CR0,0,675,1000_AL_.jpg",
    year: 1994,
    rated: "PG-13",
    imdb: { rating: 8.8, votes: 1900000, id: 109830 },
    countries: ["USA"],
    languages: ["English"],
    directors: ["Robert Zemeckis"],
    num_mflix_comments: 0,
    released: new Date("1994-07-06"),
    awards: { wins: 50, nominations: 74, text: "Won 6 Oscars. Another 44 wins & 74 nominations." },
    type: "movie",
  },
  {
    title: "Interstellar",
    plot: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    fullplot:
      "Earth's future has been riddled by disasters, famines, and droughts. There is only one way to ensure mankind's survival: Interstellar travel. A newly discovered wormhole in the far reaches of our solar system allows a team of astronauts to go where no man has gone before, a planet that may have the right environment to sustain human life.",
    genres: ["Adventure", "Drama", "Sci-Fi"],
    runtime: 169,
    cast: [
      "Matthew McConaughey",
      "Anne Hathaway",
      "Jessica Chastain",
      "Michael Caine",
      "Casey Affleck",
      "Wes Bentley",
      "Topher Grace",
    ],
    poster:
      "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SY1000_CR0,0,675,1000_AL_.jpg",
    year: 2014,
    rated: "PG-13",
    imdb: { rating: 8.6, votes: 1600000, id: 816692 },
    countries: ["USA", "UK"],
    languages: ["English"],
    directors: ["Christopher Nolan"],
    num_mflix_comments: 0,
    released: new Date("2014-11-07"),
    awards: { wins: 44, nominations: 148, text: "Won 1 Oscar. Another 43 wins & 148 nominations." },
    type: "movie",
  },
  {
    title: "The Avengers",
    plot: "Earth's mightiest heroes must come together and learn to fight as a team if they are going to stop the mischievous Loki and his alien army from enslaving humanity.",
    fullplot:
      "Loki, the adopted brother of Thor, teams-up with the Chitauri Army and uses the Tesseract's power to travel from Asgard to Midgard to plot the invasion of Earth and become a king. The director of the agency S.H.I.E.L.D., Nick Fury, sets in motion project Avengers, joining Tony Stark, Steve Rogers, Bruce Banner, Thor, Natasha Romanoff and Clint Barton to save the world from the powerful Loki and the alien invasion.",
    genres: ["Action", "Adventure", "Sci-Fi"],
    runtime: 143,
    cast: [
      "Robert Downey Jr.",
      "Chris Evans",
      "Mark Ruffalo",
      "Chris Hemsworth",
      "Scarlett Johansson",
      "Jeremy Renner",
      "Tom Hiddleston",
    ],
    poster:
      "https://m.media-amazon.com/images/M/MV5BNDYxNjQyMjAtNTdiOS00NGYwLWFmNTAtNThmYjU5ZGI2YTI1XkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SY1000_CR0,0,675,1000_AL_.jpg",
    year: 2012,
    rated: "PG-13",
    imdb: { rating: 8.0, votes: 1300000, id: 848228 },
    countries: ["USA"],
    languages: ["English", "Russian"],
    directors: ["Joss Whedon"],
    num_mflix_comments: 0,
    released: new Date("2012-05-04"),
    awards: { wins: 38, nominations: 80, text: "Nominated for 1 Oscar. Another 37 wins & 80 nominations." },
    type: "movie",
  },
  {
    title: "Titanic",
    plot: "A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic.",
    fullplot:
      "84 years later, a 100-year-old woman named Rose DeWitt Bukater tells the story to her granddaughter Lizzy Calvert, Brock Lovett, Lewis Bodine, Bobby Buell and Anatoly Mikailavich on the Keldysh about her life set in April 10th 1912, on a ship called Titanic when young Rose boards the departing ship with the upper-class passengers and her mother, Ruth DeWitt Bukater, and her fiancé, Caledon Hockley. Meanwhile, a drifter and artist named Jack Dawson and his best friend Fabrizio De Rossi win third-class tickets to the ship in a game.",
    genres: ["Drama", "Romance"],
    runtime: 194,
    cast: [
      "Leonardo DiCaprio",
      "Kate Winslet",
      "Billy Zane",
      "Kathy Bates",
      "Frances Fisher",
      "Bernard Hill",
      "Jonathan Hyde",
    ],
    poster:
      "https://m.media-amazon.com/images/M/MV5BMDdmZGU3NDQtY2E5My00ZTliLWIzOTUtMTY4ZGI1YjdiNjk3XkEyXkFqcGdeQXVyNTA4NzY1MzY@._V1_SY1000_CR0,0,675,1000_AL_.jpg",
    year: 1997,
    rated: "PG-13",
    imdb: { rating: 7.8, votes: 1100000, id: 120338 },
    countries: ["USA"],
    languages: ["English", "French", "German", "Swedish", "Italian", "Russian"],
    directors: ["James Cameron"],
    num_mflix_comments: 0,
    released: new Date("1997-12-19"),
    awards: { wins: 127, nominations: 83, text: "Won 11 Oscars. Another 116 wins & 83 nominations." },
    type: "movie",
  },
  {
    title: "Avatar",
    plot: "A paraplegic Marine dispatched to the moon Pandora on a unique mission becomes torn between following his orders and protecting the world he feels is his home.",
    fullplot:
      "In the 22nd century, a paraplegic Marine is dispatched to the moon Pandora on a unique mission, but becomes torn between following orders and protecting an alien civilization. Avatar takes us to a spectacular world beyond imagination, where a reluctant hero embarks on a journey of redemption and discovery, as he leads a heroic battle to save a civilization.",
    genres: ["Action", "Adventure", "Fantasy"],
    runtime: 162,
    cast: [
      "Sam Worthington",
      "Zoe Saldana",
      "Sigourney Weaver",
      "Stephen Lang",
      "Michelle Rodriguez",
      "Giovanni Ribisi",
      "Joel David Moore",
    ],
    poster:
      "https://m.media-amazon.com/images/M/MV5BZDA0OGQxNTItMDZkMC00N2UyLTg3MzMtYTJmNjg3Nzk5MzRiXkEyXkFqcGdeQXVyMjUzOTY1NTc@._V1_SY1000_CR0,0,675,1000_AL_.jpg",
    year: 2009,
    rated: "PG-13",
    imdb: { rating: 7.8, votes: 1200000, id: 499549 },
    countries: ["USA", "UK"],
    languages: ["English", "Spanish"],
    directors: ["James Cameron"],
    num_mflix_comments: 0,
    released: new Date("2009-12-18"),
    awards: { wins: 38, nominations: 132, text: "Won 3 Oscars. Another 35 wins & 132 nominations." },
    type: "movie",
  },
  {
    title: "Gladiator",
    plot: "A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery.",
    fullplot:
      "Maximus is a powerful Roman general, loved by the people and the aging Emperor, Marcus Aurelius. Before his death, the Emperor chooses Maximus to be his heir over his own son, Commodus, and a power struggle leaves Maximus and his family condemned to death. The powerful general is unable to save his family, and his loss of will allows him to get captured and put into the Gladiator games until he dies. The only desire that fuels him now is the chance to rise to the top so that he will be able to look into the eyes of the man who will feel his revenge.",
    genres: ["Action", "Adventure", "Drama"],
    runtime: 155,
    cast: [
      "Russell Crowe",
      "Joaquin Phoenix",
      "Connie Nielsen",
      "Oliver Reed",
      "Richard Harris",
      "Derek Jacobi",
      "Djimon Hounsou",
    ],
    poster:
      "https://m.media-amazon.com/images/M/MV5BMDliMmNhNDEtODUyOS00MjNlLTgxODEtN2U3NzIxMGVkZTA1L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SY1000_CR0,0,675,1000_AL_.jpg",
    year: 2000,
    rated: "R",
    imdb: { rating: 8.5, votes: 1400000, id: 172495 },
    countries: ["USA", "UK"],
    languages: ["English"],
    directors: ["Ridley Scott"],
    num_mflix_comments: 0,
    released: new Date("2000-05-05"),
    awards: { wins: 48, nominations: 108, text: "Won 5 Oscars. Another 43 wins & 108 nominations." },
    type: "movie",
  },
]

async function addMoviesToDatabase() {
  const rawUri = process.env.MONGODB_URI
  const dbName = process.env.MONGODB_DB_NAME || "movieflix"

  if (!rawUri) {
    console.error("❌ MONGODB_URI not found in environment variables")
    process.exit(1)
  }

  const client = new MongoClient(rawUri)

  try {
    await client.connect()
    console.log("✅ Connected to MongoDB")

    const db = client.db(dbName)

    console.log("📽️  Adding additional movies...")
    const result = await db.collection("movies").insertMany(additionalMovies)
    console.log(`✅ Successfully added ${result.insertedCount} movies to the database`)

    // Create indexes if they don't exist
    console.log("📊 Updating database indexes...")
    await db.collection("movies").createIndex({ title: "text", plot: "text", fullplot: "text" })
    await db.collection("movies").createIndex({ genres: 1 })
    await db.collection("movies").createIndex({ year: 1 })
    await db.collection("movies").createIndex({ "imdb.rating": -1 })

    console.log("🎉 Additional movies added successfully!")
    console.log("\nNew movies added:")
    additionalMovies.forEach((movie, index) => {
      console.log(`${index + 1}. ${movie.title} (${movie.year}) - ${movie.genres.join(", ")}`)
    })
  } catch (error) {
    console.error("❌ Error adding movies:", error.message)
    process.exit(1)
  } finally {
    await client.close()
  }
}

// Run the script
if (require.main === module) {
  addMoviesToDatabase()
}

module.exports = { additionalMovies }
