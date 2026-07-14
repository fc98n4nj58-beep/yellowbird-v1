const TOPIC_FAMILIES = Object.freeze([
  "classroom_school",
  "animals_nature",
  "food_gardens",
  "sports_movement",
  "books_stories",
  "weather_seasons",
  "transportation",
  "toys_play",
  "community_places",
  "science_observations",
  "arts_music",
  "everyday_objects"
]);

const FORBIDDEN_SENSITIVE_TAGS = Object.freeze([
  "health",
  "religion",
  "identity",
  "household_status",
  "income",
  "specialized_access"
]);

const SCENARIO_TYPE_METADATA = Object.freeze({
  vote: Object.freeze({
    dataSource: "class vote",
    collectionAction: "students chose one option",
    purpose: "show the class choices"
  }),
  survey: Object.freeze({
    dataSource: "class survey",
    collectionAction: "students answered one short question",
    purpose: "show the class responses"
  }),
  observation: Object.freeze({
    dataSource: "observation record",
    collectionAction: "students watched and recorded what they saw",
    purpose: "show the observations"
  }),
  count: Object.freeze({
    dataSource: "class count",
    collectionAction: "students counted familiar things",
    purpose: "show the totals"
  }),
  sorting: Object.freeze({
    dataSource: "sorting activity",
    collectionAction: "students sorted things and counted each group",
    purpose: "show the group totals"
  }),
  record_over_time: Object.freeze({
    dataSource: "daily record",
    collectionAction: "students recorded what happened over several days",
    purpose: "show the observations over time"
  }),
  experiment: Object.freeze({
    dataSource: "class investigation",
    collectionAction: "students tested or observed familiar objects",
    purpose: "show the results"
  })
});

function categoryNounLanguage(singularNoun, pluralNoun, options = {}) {
  return Object.freeze({
    singularNoun,
    pluralNoun,
    addPhrase: Object.freeze({
      singular: options.addSingular || "was added",
      plural: options.addPlural || "were added"
    }),
    removePhrase: Object.freeze({
      singular: options.removeSingular || "was taken away",
      plural: options.removePlural || "were taken away"
    }),
    counterType: options.counterType || "count_noun"
  });
}

const CATEGORY_NOUN_LANGUAGE = Object.freeze({
  paper: categoryNounLanguage("sheet of paper", "sheets of paper", {
    removeSingular: "was used",
    removePlural: "were used",
    counterType: "sheet"
  }),
  glue: categoryNounLanguage("glue stick", "glue sticks", {
    removeSingular: "was used",
    removePlural: "were used",
    counterType: "stick"
  }),
  scissors: categoryNounLanguage("pair of scissors", "pairs of scissors", {
    removeSingular: "was used",
    removePlural: "were used",
    counterType: "pair"
  }),
  chalk: categoryNounLanguage("piece of chalk", "pieces of chalk", {
    removeSingular: "was used",
    removePlural: "were used",
    counterType: "piece"
  }),
  bark: categoryNounLanguage("piece of bark", "pieces of bark", { counterType: "piece" }),
  corn: categoryNounLanguage("piece of corn", "pieces of corn", { counterType: "piece" }),
  yarn: categoryNounLanguage("piece of yarn", "pieces of yarn", {
    removeSingular: "was used",
    removePlural: "were used",
    counterType: "piece"
  }),
  foil: categoryNounLanguage("sheet of foil", "sheets of foil", {
    removeSingular: "was used",
    removePlural: "were used",
    counterType: "sheet"
  }),
  bread: categoryNounLanguage("loaf of bread", "loaves of bread", { counterType: "loaf" }),
  fruit: categoryNounLanguage("piece of fruit", "pieces of fruit", { counterType: "piece" }),
  leaves: categoryNounLanguage("leaf", "leaves"),
  shelves: categoryNounLanguage("shelf", "shelves"),
  people: categoryNounLanguage("person", "people")
});

const UNSAFE_AUTOMATIC_CATEGORY_NOUNS = Object.freeze([
  "equipment",
  "furniture",
  "moss"
]);

const CATEGORY_APPLICATION_UNSUPPORTED_TOPIC_IDS = Object.freeze([
  "places-at-school",
  "story-characters",
  "weather-tools-used",
  "story-settings",
  "book-cover-pictures",
  "puppet-characters",
  "things-that-move",
  "ways-packages-move",
  "vehicles-with-wheels",
  "water-transportation",
  "air-transportation",
  "puzzle-pictures",
  "helpers-in-stories",
  "market-stalls"
]);

function deriveSingularCategoryNoun(label) {
  const value = String(label || "").trim().toLowerCase();
  if (!value || value.includes(" ") || UNSAFE_AUTOMATIC_CATEGORY_NOUNS.includes(value)) return null;
  if (/^(fish|deer)$/.test(value)) return value;
  if (/ies$/.test(value)) return `${value.slice(0, -3)}y`;
  if (/ves$/.test(value)) return null;
  if (/(ches|shes|xes|zes|oes)$/.test(value)) return value.slice(0, -2);
  if (/s$/.test(value) && !/(ss|us|is)$/.test(value)) return value.slice(0, -1);
  return value;
}

function pluralizeCategoryNoun(singularNoun) {
  if (/^(fish|deer)$/.test(singularNoun)) return singularNoun;
  if (/[^aeiou]y$/.test(singularNoun)) return `${singularNoun.slice(0, -1)}ies`;
  if (/(s|x|z|ch|sh)$/.test(singularNoun)) return `${singularNoun}es`;
  return `${singularNoun}s`;
}

function resolveCategoryNounLanguage(label) {
  const value = String(label || "").trim().toLowerCase();
  if (CATEGORY_NOUN_LANGUAGE[value]) return CATEGORY_NOUN_LANGUAGE[value];
  const singularNoun = deriveSingularCategoryNoun(value);
  if (!singularNoun) return null;
  const pluralNoun = singularNoun === value ? pluralizeCategoryNoun(singularNoun) : value;
  return categoryNounLanguage(singularNoun, pluralNoun);
}

const SCENARIO_CONTEXTS = Object.freeze({
  "favourite-classroom-activities": ["vote", "A class voted for an activity they enjoy. The graph shows their votes."],
  "classroom-materials": ["count", "Students counted supplies in their room. The graph shows the items."],
  "class-jobs-chosen": ["survey", "Students chose a job they could help with. The graph shows the students in each group."],
  "ways-to-learn": ["vote", "A class chose a way they like to learn. The graph shows their votes."],
  "places-at-school": ["count", "Students kept a tally as they used different school spaces. The graph shows the visits."],
  "recess-choices": ["vote", "Students chose an activity for recess. The graph shows their votes."],
  "lunchroom-items": ["count", "Students counted familiar supplies in the eating area. The graph shows the items."],
  "things-in-a-backpack": ["sorting", "Students sorted school supplies from a sample bag. The graph shows the items."],
  "morning-activities": ["survey", "A class recorded what each person chose to do first. The graph shows the students."],

  "animals-seen-at-a-pond": ["observation", "A class visited a pond and recorded the animals they saw. The graph shows the sightings."],
  "garden-visitors": ["observation", "Students watched a garden and marked each visitor they saw. The graph shows the sightings."],
  "forest-animals": ["observation", "Students looked at a forest camera record. The graph shows the animal sightings."],
  "birds-at-a-feeder": ["observation", "Students watched a bird feeder for a short time. The graph shows the sightings."],
  "pond-plants": ["observation", "Students looked around a pond and counted each kind they found. The graph shows the plants."],
  "tree-parts-found": ["sorting", "Students collected fallen nature pieces and sorted them. The graph shows the items."],
  "nature-walk-finds": ["observation", "Students noticed familiar things on a short nature walk. The graph shows the items."],
  "bugs-seen-outside": ["observation", "Students watched a small outdoor area and kept a tally. The graph shows the bugs."],
  "animals-near-water": ["observation", "Students used a nature record to note wildlife beside a pond. The graph shows the sightings."],

  "favourite-fruits": ["vote", "A class voted for their favourite fruit, and each student chose one. The graph shows their votes."],
  "favourite-vegetables": ["vote", "Students chose a vegetable they like. The graph shows their votes."],
  "garden-plants": ["count", "Students counted different plants in a class garden. The graph shows the plants."],
  "fruit-basket": ["sorting", "Students sorted a basket of pretend food. The graph shows the fruits."],
  "lunch-snacks": ["survey", "A class answered a question about simple snack choices. The graph shows the snacks."],
  "soup-vegetables": ["sorting", "Students sorted pretend food pieces for a soup activity. The graph shows the pieces."],
  "seeds-planted": ["count", "Students planted several kinds in a class garden tray. The graph shows the seeds."],
  "garden-harvest": ["count", "Students counted food picked from a class garden. The graph shows the vegetables."],
  "favourite-breakfast-foods": ["vote", "A class chose a breakfast food from a picture list. The graph shows their votes."],

  "playground-activities": ["survey", "Students answered a question about activities at play time. The graph shows their votes."],
  "ways-to-move": ["vote", "A class chose a movement to practise. The graph shows their votes."],
  "gym-activities": ["survey", "Students chose an activity for a movement lesson. The graph shows their votes."],
  "ball-games": ["vote", "A class picked a ball activity from a short list. The graph shows their votes."],
  "movement-breaks": ["vote", "Students chose a movement for a class break. The graph shows their votes."],
  "track-activities": ["survey", "Students answered a question about events on a track. The graph shows their votes."],
  "outdoor-games": ["vote", "A class selected a game for outdoor play. The graph shows their votes."],
  "beanbag-moves": ["survey", "Students chose a beanbag move to try. The graph shows their votes."],
  "dance-moves": ["vote", "A class picked a move for a short dance. The graph shows their votes."],

  "favourite-story-types": ["vote", "Students chose a kind of story they enjoy. The graph shows their votes."],
  "story-characters": ["count", "Students sorted picture cards from several tales. The graph shows the characters."],
  "books-read-in-class": ["count", "A class kept a simple reading record. The graph shows the books."],
  "library-choices": ["survey", "Students selected a kind of book from a class list. The graph shows the books."],
  "reading-spots": ["vote", "A class chose a comfortable place for quiet reading. The graph shows their votes."],
  "story-settings": ["sorting", "Students sorted tales by where each one happened. The graph shows the stories."],
  "book-cover-pictures": ["sorting", "Students sorted books by the pictures on the front. The graph shows the books."],
  "puppet-characters": ["count", "Students counted figures used in a class puppet show. The graph shows the puppets."],

  "types-of-weather": ["record_over_time", "Students recorded the weather each school day. The graph shows the days."],
  "weather-this-month": ["record_over_time", "A class kept a short daily weather record. The graph shows the days."],
  "season-activities": ["vote", "Students chose an activity they connect with a season. The graph shows their votes."],
  "things-seen-in-spring": ["observation", "Students watched for signs of spring near school. The graph shows the sightings."],
  "summer-nature": ["observation", "Students used picture records to note signs of summer. The graph shows the sightings."],
  "autumn-finds": ["sorting", "Students sorted fallen nature pieces from autumn. The graph shows the items."],
  "winter-weather": ["record_over_time", "A class recorded winter conditions over several school days. The graph shows the days."],
  "weather-tools-used": ["count", "Students kept a tally while using simple weather tools. The graph shows the uses."],

  "vehicles-seen": ["observation", "Students watched a safe street view and kept a tally. The graph shows the vehicles."],
  "things-that-move": ["sorting", "Students sorted pictures by how each thing moves. The graph shows the vehicles."],
  "ways-packages-move": ["sorting", "Students sorted picture cards showing how mail can move. The graph shows the packages."],
  "construction-vehicles": ["observation", "Students used a picture record from a work site. The graph shows the vehicles."],
  "community-vehicles": ["observation", "Students watched for helpful vehicles in a neighbourhood video. The graph shows the vehicles."],
  "vehicles-with-wheels": ["sorting", "Students sorted picture cards of things with wheels. The graph shows the vehicles."],
  "water-transportation": ["sorting", "Students grouped pictures of things that move on water. The graph shows the vehicles."],
  "air-transportation": ["sorting", "Students grouped pictures of things that move in the air. The graph shows the vehicles."],

  "favourite-toys": ["vote", "A class chose a toy from a picture list. The graph shows their votes."],
  "building-toys": ["sorting", "Students sorted class building pieces into groups. The graph shows the items."],
  "pretend-play": ["survey", "Students chose a pretend-play centre for class time. The graph shows their votes."],
  "table-games": ["vote", "A class selected a game for indoor play. The graph shows their votes."],
  "outdoor-play-items": ["count", "Students counted shared supplies for outdoor play. The graph shows the items."],
  "things-in-a-toy-bin": ["sorting", "Students sorted objects from a classroom play bin. The graph shows the items."],
  "sand-table-tools": ["count", "Students counted shared tools near a class sand table. The graph shows the items."],
  "puzzle-pictures": ["sorting", "Students grouped picture puzzles by what they showed. The graph shows the puzzles."],

  "community-places": ["survey", "Students chose a familiar place from a picture list. The graph shows the visits they would make."],
  "places-to-read": ["vote", "A class chose a quiet place where they would like to read. The graph shows their votes."],
  "helpers-in-stories": ["sorting", "Students sorted story cards by the helper shown. The graph shows the characters."],
  "things-at-a-library": ["count", "Students counted familiar things in a library picture. The graph shows the items."],
  "park-features": ["observation", "Students studied a picture of a public park. The graph shows the items they noticed."],
  "market-stalls": ["count", "Students counted stands in a pretend market picture. The graph shows the stalls."],
  "buildings-seen": ["observation", "Students looked at a neighbourhood picture and kept a tally. The graph shows the buildings."],
  "community-signs": ["observation", "Students found signs in a safe street picture. The graph shows the signs."],

  "shapes-found-in-class": ["observation", "Students looked for shapes around their classroom. The graph shows the shapes."],
  "objects-that-roll": ["experiment", "Students tested familiar things on a small ramp. The graph shows which objects moved down it."],
  "objects-that-sink": ["experiment", "Students tested safe class materials in water. The graph shows the objects that sank."],
  "objects-that-float": ["experiment", "Students placed safe class materials in water. The graph shows which objects stayed on top."],
  "materials-tested": ["experiment", "Students explored several safe materials in class. The graph shows the items they tested."],
  "magnets-picked-up": ["experiment", "Students used a magnet with safe class objects. The graph shows the items it picked up."],
  "light-sources": ["observation", "Students sorted pictures of things that can give light. The graph shows the sources."],
  "science-table-objects": ["count", "Students counted familiar things on a class discovery table. The graph shows the items."],

  "art-tools": ["count", "Students counted shared supplies at an art table. The graph shows the items."],
  "favourite-art-activities": ["vote", "A class chose an art activity they would like to try. The graph shows their votes."],
  "lines-in-art": ["observation", "Students looked at class artwork and kept a tally. The graph shows the lines they found."],
  "shapes-in-art": ["observation", "Students studied several class pictures. The graph shows the shapes they noticed."],
  "instruments-heard": ["observation", "Students listened to a short set of music clips. The graph shows the sounds they heard."],
  "music-actions": ["vote", "A class chose an action for a music break. The graph shows their votes."],
  "craft-materials": ["sorting", "Students sorted shared supplies for a class craft. The graph shows the items."],
  "ways-to-make-music": ["survey", "Students selected a way to make music together. The graph shows their votes."],

  "desk-items": ["count", "Students counted pencils and other supplies at their desks. The graph shows the items."],
  "kitchen-tools": ["sorting", "Students sorted pictures of familiar food tools. The graph shows the items."],
  "things-with-handles": ["observation", "Students looked for handles in classroom pictures. The graph shows the items."],
  "round-objects": ["sorting", "Students grouped familiar things by shape. The graph shows the objects with a round shape."],
  "things-made-of-paper": ["sorting", "Students sorted familiar paper things into groups. The graph shows the items."],
  "fasteners": ["sorting", "Students grouped pictures of things that join or close. The graph shows the items."],
  "containers": ["count", "Students counted different holders in a classroom picture. The graph shows the containers."],
  "cleaning-tools": ["sorting", "Students sorted pictures of familiar tools used to tidy. The graph shows the tools."]
});

const SCENARIO_TYPES_BY_FAMILY = Object.freeze({
  classroom_school: Object.freeze(["vote", "survey", "count", "sorting"]),
  animals_nature: Object.freeze(["observation", "count", "sorting"]),
  food_gardens: Object.freeze(["vote", "survey", "count", "sorting", "observation"]),
  sports_movement: Object.freeze(["vote", "survey", "count"]),
  books_stories: Object.freeze(["vote", "survey", "count", "sorting"]),
  weather_seasons: Object.freeze(["record_over_time", "vote", "observation", "sorting", "count"]),
  transportation: Object.freeze(["observation", "sorting"]),
  toys_play: Object.freeze(["vote", "survey", "sorting", "count"]),
  community_places: Object.freeze(["survey", "vote", "sorting", "count", "observation"]),
  science_observations: Object.freeze(["observation", "experiment", "count", "sorting"]),
  arts_music: Object.freeze(["count", "vote", "observation", "sorting", "survey"]),
  everyday_objects: Object.freeze(["count", "sorting", "observation"])
});

function topic(id, title, categories, unitSingular, unitPlural, topicFamily) {
  const scenarioContext = SCENARIO_CONTEXTS[id];
  if (!scenarioContext) throw new Error(`Missing Grade 1 graph scenario for '${id}'.`);
  const [scenarioType, scenario] = scenarioContext;
  const typeMetadata = SCENARIO_TYPE_METADATA[scenarioType];
  if (!typeMetadata) throw new Error(`Unknown Grade 1 graph scenario type '${scenarioType}'.`);
  const categoryLanguage = Object.freeze(categories.map(resolveCategoryNounLanguage));
  return Object.freeze({
    id,
    title,
    categories: Object.freeze([...categories]),
    unitSingular,
    unitPlural,
    keyLabel: `1 circle = 1 ${unitSingular}`,
    keyText: `= 1 ${unitSingular}`,
    questionNoun: unitPlural,
    topicFamily,
    gradeBand: "grade1",
    vocabularyLevel: "grade1_readable",
    readingLevel: "grade1_short",
    scenarioType,
    scenario,
    dataSource: typeMetadata.dataSource,
    collectionAction: typeMetadata.collectionAction,
    purpose: typeMetadata.purpose,
    categoryLanguage,
    supportsCategoryApplicationLanguage: !CATEGORY_APPLICATION_UNSUPPORTED_TOPIC_IDS.includes(id)
      && categoryLanguage.every(Boolean),
    supportsDirectReading: true,
    supportsComparison: true,
    supportsMixedQuestions: true,
    blackAndWhiteSafe: true,
    colorOnlyInterpretation: false,
    coherenceReviewed: true,
    sensitiveTags: Object.freeze([]),
    futureCompatibility: Object.freeze(["pictograph", "tally_chart", "bar_graph"])
  });
}

const GRADE1_GRAPH_TOPICS = Object.freeze([
  // Classroom and school (9)
  topic("favourite-classroom-activities", "Favourite Classroom Activities", ["Reading", "Drawing", "Building", "Puzzles"], "vote", "votes", "classroom_school"),
  topic("classroom-materials", "Classroom Materials", ["Pencils", "Crayons", "Paper", "Glue"], "item", "items", "classroom_school"),
  topic("class-jobs-chosen", "Class Jobs Chosen", ["Door Helper", "Line Leader", "Book Helper", "Plant Helper"], "student", "students", "classroom_school"),
  topic("ways-to-learn", "Ways to Learn", ["Reading", "Writing", "Talking", "Making"], "vote", "votes", "classroom_school"),
  topic("places-at-school", "Places at School", ["Classroom", "Library", "Gym", "Office"], "visit", "visits", "classroom_school"),
  topic("recess-choices", "Recess Choices", ["Swings", "Slide", "Tag", "Chalk"], "vote", "votes", "classroom_school"),
  topic("lunchroom-items", "Lunchroom Items", ["Trays", "Cups", "Spoons", "Napkins"], "item", "items", "classroom_school"),
  topic("things-in-a-backpack", "Things in a Backpack", ["Books", "Folders", "Pencils", "Erasers"], "item", "items", "classroom_school"),
  topic("morning-activities", "Morning Activities", ["Reading", "Drawing", "Puzzles", "Building"], "student", "students", "classroom_school"),

  // Animals and nature (9)
  topic("animals-seen-at-a-pond", "Animals Seen at a Pond", ["Ducks", "Frogs", "Fish", "Turtles"], "sighting", "sightings", "animals_nature"),
  topic("garden-visitors", "Garden Visitors", ["Bees", "Butterflies", "Birds", "Worms"], "sighting", "sightings", "animals_nature"),
  topic("forest-animals", "Forest Animals", ["Deer", "Rabbits", "Foxes", "Squirrels"], "sighting", "sightings", "animals_nature"),
  topic("birds-at-a-feeder", "Birds at a Feeder", ["Robins", "Sparrows", "Finches", "Blue Jays"], "sighting", "sightings", "animals_nature"),
  topic("pond-plants", "Pond Plants", ["Reeds", "Lilies", "Moss", "Ferns"], "plant", "plants", "animals_nature"),
  topic("tree-parts-found", "Tree Parts Found", ["Leaves", "Twigs", "Seeds", "Bark"], "item", "items", "animals_nature"),
  topic("nature-walk-finds", "Nature Walk Finds", ["Rocks", "Leaves", "Sticks", "Cones"], "item", "items", "animals_nature"),
  topic("bugs-seen-outside", "Bugs Seen Outside", ["Ants", "Beetles", "Bees", "Moths"], "bug", "bugs", "animals_nature"),
  topic("animals-near-water", "Animals Near Water", ["Ducks", "Frogs", "Fish", "Snails"], "sighting", "sightings", "animals_nature"),

  // Food and gardens (9)
  topic("favourite-fruits", "Favourite Fruits", ["Apples", "Bananas", "Grapes", "Oranges"], "vote", "votes", "food_gardens"),
  topic("favourite-vegetables", "Favourite Vegetables", ["Carrots", "Peas", "Corn", "Beans"], "vote", "votes", "food_gardens"),
  topic("garden-plants", "Garden Plants", ["Tomatoes", "Beans", "Peas", "Carrots"], "plant", "plants", "food_gardens"),
  topic("fruit-basket", "Fruit Basket", ["Apples", "Bananas", "Oranges", "Pears"], "fruit", "fruits", "food_gardens"),
  topic("lunch-snacks", "Lunch Snacks", ["Crackers", "Apples", "Yogurt", "Pretzels"], "snack", "snacks", "food_gardens"),
  topic("soup-vegetables", "Soup Vegetables", ["Carrots", "Peas", "Corn", "Beans"], "piece", "pieces", "food_gardens"),
  topic("seeds-planted", "Seeds Planted", ["Bean", "Pea", "Corn", "Sunflower"], "seed", "seeds", "food_gardens"),
  topic("garden-harvest", "Garden Harvest", ["Tomatoes", "Beans", "Peas", "Carrots"], "vegetable", "vegetables", "food_gardens"),
  topic("favourite-breakfast-foods", "Favourite Breakfast Foods", ["Oatmeal", "Toast", "Fruit", "Yogurt"], "vote", "votes", "food_gardens"),

  // Sports and movement (9)
  topic("playground-activities", "Playground Activities", ["Swings", "Slide", "Tag", "Chalk"], "vote", "votes", "sports_movement"),
  topic("ways-to-move", "Ways to Move", ["Walk", "Run", "Hop", "Skip"], "vote", "votes", "sports_movement"),
  topic("gym-activities", "Gym Activities", ["Jumping", "Throwing", "Rolling", "Balancing"], "vote", "votes", "sports_movement"),
  topic("ball-games", "Ball Games", ["Soccer", "Basketball", "Kickball", "Catch"], "vote", "votes", "sports_movement"),
  topic("movement-breaks", "Movement Breaks", ["Stretch", "Hop", "March", "Twist"], "vote", "votes", "sports_movement"),
  topic("track-activities", "Track Activities", ["Running", "Walking", "Hurdles", "Relay"], "vote", "votes", "sports_movement"),
  topic("outdoor-games", "Outdoor Games", ["Tag", "Hide-and-Seek", "Hopscotch", "Catch"], "vote", "votes", "sports_movement"),
  topic("beanbag-moves", "Beanbag Moves", ["Toss", "Catch", "Balance", "Slide"], "vote", "votes", "sports_movement"),
  topic("dance-moves", "Dance Moves", ["Step", "Clap", "Turn", "Jump"], "vote", "votes", "sports_movement"),

  // Books and stories (8)
  topic("favourite-story-types", "Favourite Story Types", ["Animals", "Adventure", "Funny", "Mystery"], "vote", "votes", "books_stories"),
  topic("story-characters", "Story Characters", ["Bears", "Rabbits", "Robots", "Dragons"], "character", "characters", "books_stories"),
  topic("books-read-in-class", "Books Read in Class", ["Animal Tales", "Poems", "Facts", "Comics"], "book", "books", "books_stories"),
  topic("library-choices", "Library Choices", ["Stories", "Facts", "Poems", "Comics"], "book", "books", "books_stories"),
  topic("reading-spots", "Reading Spots", ["Carpet", "Desk", "Bench", "Cushion"], "vote", "votes", "books_stories"),
  topic("story-settings", "Story Settings", ["Forest", "School", "Space", "Farm"], "story", "stories", "books_stories"),
  topic("book-cover-pictures", "Book Cover Pictures", ["Animals", "Places", "People", "Objects"], "book", "books", "books_stories"),
  topic("puppet-characters", "Puppet Characters", ["Cat", "Dog", "Bear", "Rabbit"], "puppet", "puppets", "books_stories"),

  // Weather and seasons (8)
  topic("types-of-weather", "Types of Weather", ["Sunny", "Rainy", "Windy", "Snowy"], "day", "days", "weather_seasons"),
  topic("weather-this-month", "Weather This Month", ["Sunny", "Rainy", "Cloudy", "Windy"], "day", "days", "weather_seasons"),
  topic("season-activities", "Season Activities", ["Sledding", "Gardening", "Swimming", "Hiking"], "vote", "votes", "weather_seasons"),
  topic("things-seen-in-spring", "Things Seen in Spring", ["Buds", "Birds", "Rainbows", "Puddles"], "sighting", "sightings", "weather_seasons"),
  topic("summer-nature", "Summer Nature", ["Bees", "Flowers", "Birds", "Clouds"], "sighting", "sightings", "weather_seasons"),
  topic("autumn-finds", "Autumn Finds", ["Leaves", "Acorns", "Cones", "Twigs"], "item", "items", "weather_seasons"),
  topic("winter-weather", "Winter Weather", ["Snow", "Frost", "Wind", "Clouds"], "day", "days", "weather_seasons"),
  topic("weather-tools-used", "Weather Tools Used", ["Thermometer", "Rain Gauge", "Windsock", "Chart"], "use", "uses", "weather_seasons"),

  // Transportation (8)
  topic("vehicles-seen", "Vehicles Seen", ["Bus", "Bike", "Truck", "Van"], "vehicle", "vehicles", "transportation"),
  topic("things-that-move", "Things That Move", ["Car", "Bus", "Train", "Boat"], "vehicle", "vehicles", "transportation"),
  topic("ways-packages-move", "Ways Packages Move", ["Truck", "Train", "Ship", "Plane"], "package", "packages", "transportation"),
  topic("construction-vehicles", "Construction Vehicles", ["Digger", "Loader", "Crane", "Truck"], "vehicle", "vehicles", "transportation"),
  topic("community-vehicles", "Community Vehicles", ["Bus", "Fire Truck", "Mail Van", "Ambulance"], "vehicle", "vehicles", "transportation"),
  topic("vehicles-with-wheels", "Vehicles with Wheels", ["Bike", "Wagon", "Bus", "Scooter"], "vehicle", "vehicles", "transportation"),
  topic("water-transportation", "Water Transportation", ["Canoe", "Ferry", "Sailboat", "Ship"], "vehicle", "vehicles", "transportation"),
  topic("air-transportation", "Air Transportation", ["Plane", "Helicopter", "Glider", "Balloon"], "vehicle", "vehicles", "transportation"),

  // Toys and play (8)
  topic("favourite-toys", "Favourite Toys", ["Blocks", "Dolls", "Balls", "Puzzles"], "vote", "votes", "toys_play"),
  topic("building-toys", "Building Toys", ["Blocks", "Bricks", "Tiles", "Sticks"], "item", "items", "toys_play"),
  topic("pretend-play", "Pretend Play", ["Kitchen", "Shop", "School", "Space Station"], "vote", "votes", "toys_play"),
  topic("table-games", "Table Games", ["Dominoes", "Cards", "Bingo", "Checkers"], "vote", "votes", "toys_play"),
  topic("outdoor-play-items", "Outdoor Play Items", ["Balls", "Chalk", "Hoops", "Ropes"], "item", "items", "toys_play"),
  topic("things-in-a-toy-bin", "Things in a Toy Bin", ["Blocks", "Cars", "Puppets", "Balls"], "item", "items", "toys_play"),
  topic("sand-table-tools", "Sand Table Tools", ["Pails", "Scoops", "Rakes", "Moulds"], "item", "items", "toys_play"),
  topic("puzzle-pictures", "Puzzle Pictures", ["Animals", "Shapes", "Places", "Foods"], "puzzle", "puzzles", "toys_play"),

  // Community places (8)
  topic("community-places", "Community Places", ["Library", "Park", "School", "Bakery"], "visit", "visits", "community_places"),
  topic("places-to-read", "Places to Read", ["Library", "Classroom", "Park", "Reading Room"], "vote", "votes", "community_places"),
  topic("helpers-in-stories", "Helpers in Stories", ["Teacher", "Firefighter", "Librarian", "Farmer"], "character", "characters", "community_places"),
  topic("things-at-a-library", "Things at a Library", ["Books", "Shelves", "Tables", "Computers"], "item", "items", "community_places"),
  topic("park-features", "Park Features", ["Trees", "Benches", "Paths", "Swings"], "item", "items", "community_places"),
  topic("market-stalls", "Market Stalls", ["Fruit", "Bread", "Flowers", "Books"], "stall", "stalls", "community_places"),
  topic("buildings-seen", "Buildings Seen", ["School", "Library", "Store", "Station"], "building", "buildings", "community_places"),
  topic("community-signs", "Community Signs", ["Stop", "Exit", "Crosswalk", "Library"], "sign", "signs", "community_places"),

  // Science observations (8)
  topic("shapes-found-in-class", "Shapes Found in Class", ["Circles", "Squares", "Triangles", "Rectangles"], "shape", "shapes", "science_observations"),
  topic("objects-that-roll", "Objects That Roll", ["Balls", "Cans", "Tubes", "Wheels"], "object", "objects", "science_observations"),
  topic("objects-that-sink", "Objects That Sink", ["Rocks", "Coins", "Keys", "Blocks"], "object", "objects", "science_observations"),
  topic("objects-that-float", "Objects That Float", ["Corks", "Leaves", "Sticks", "Sponges"], "object", "objects", "science_observations"),
  topic("materials-tested", "Materials Tested", ["Paper", "Wood", "Metal", "Fabric"], "item", "items", "science_observations"),
  topic("magnets-picked-up", "Magnets Picked Up", ["Clips", "Pins", "Keys", "Screws"], "item", "items", "science_observations"),
  topic("light-sources", "Light Sources", ["Sun", "Lamp", "Flashlight", "Candle"], "source", "sources", "science_observations"),
  topic("science-table-objects", "Science Table Objects", ["Rocks", "Shells", "Feathers", "Magnets"], "item", "items", "science_observations"),

  // Arts and music (8)
  topic("art-tools", "Art Tools", ["Crayons", "Markers", "Brushes", "Chalk"], "item", "items", "arts_music"),
  topic("favourite-art-activities", "Favourite Art Activities", ["Drawing", "Painting", "Collage", "Clay"], "vote", "votes", "arts_music"),
  topic("lines-in-art", "Lines in Art", ["Straight", "Curved", "Zigzag", "Wavy"], "line", "lines", "arts_music"),
  topic("shapes-in-art", "Shapes in Art", ["Circles", "Squares", "Triangles", "Stars"], "shape", "shapes", "arts_music"),
  topic("instruments-heard", "Instruments Heard", ["Drums", "Bells", "Shakers", "Flutes"], "sound", "sounds", "arts_music"),
  topic("music-actions", "Music Actions", ["Clap", "Tap", "Shake", "Ring"], "vote", "votes", "arts_music"),
  topic("craft-materials", "Craft Materials", ["Paper", "Yarn", "Sticks", "Foil"], "item", "items", "arts_music"),
  topic("ways-to-make-music", "Ways to Make Music", ["Singing", "Clapping", "Tapping", "Humming"], "vote", "votes", "arts_music"),

  // Everyday objects (8)
  topic("desk-items", "Desk Items", ["Pencils", "Erasers", "Rulers", "Clips"], "item", "items", "everyday_objects"),
  topic("kitchen-tools", "Kitchen Tools", ["Spoon", "Whisk", "Bowl", "Cup"], "item", "items", "everyday_objects"),
  topic("things-with-handles", "Things with Handles", ["Mugs", "Pails", "Bags", "Doors"], "item", "items", "everyday_objects"),
  topic("round-objects", "Round Objects", ["Balls", "Coins", "Plates", "Buttons"], "object", "objects", "everyday_objects"),
  topic("things-made-of-paper", "Things Made of Paper", ["Books", "Cards", "Bags", "Notes"], "item", "items", "everyday_objects"),
  topic("fasteners", "Fasteners", ["Buttons", "Zips", "Clips", "Snaps"], "item", "items", "everyday_objects"),
  topic("containers", "Containers", ["Boxes", "Jars", "Cups", "Baskets"], "container", "containers", "everyday_objects"),
  topic("cleaning-tools", "Cleaning Tools", ["Broom", "Cloth", "Brush", "Mop"], "tool", "tools", "everyday_objects")
]);

function validateGrade1GraphTopics(topics = GRADE1_GRAPH_TOPICS) {
  const errors = [];
  const ids = new Set();
  const titles = new Set();
  const malformedPunctuation = /[!?;:]|\s{2,}|^[\s.,-]|[\s,.-]$/;
  const forbiddenAmericanCopy = /\b(Favorite|Color)\b/;
  const forbiddenScenarioContent = /\b(?:health|medical|religion|religious|income|identity|vacation|owned|household|family car)\b/i;
  const answerReveal = /\d|\b(?:most|least|same|equal|more|fewer|highest|lowest|greatest|smallest)\b/i;
  const unsupportedPlaceholder = /\{\{?|\}\}?|\$\{/;

  if (!Array.isArray(topics) || topics.length !== 100) {
    errors.push(`Expected exactly 100 graph topics; received ${Array.isArray(topics) ? topics.length : "non-array"}.`);
  }
  if (Object.keys(SCENARIO_CONTEXTS).length !== 100) {
    errors.push(`Expected exactly 100 scenario contexts; received ${Object.keys(SCENARIO_CONTEXTS).length}.`);
  }

  topics.forEach((entry, index) => {
    const label = `Topic ${index + 1}${entry?.id ? ` (${entry.id})` : ""}`;
    if (!entry || typeof entry !== "object") {
      errors.push(`${label} must be an object.`);
      return;
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.id || "")) errors.push(`${label} has an invalid id.`);
    if (ids.has(entry.id)) errors.push(`${label} duplicates topic id '${entry.id}'.`);
    ids.add(entry.id);
    if (!entry.title || titles.has(entry.title)) errors.push(`${label} has a missing or duplicate title.`);
    titles.add(entry.title);
    if (!Array.isArray(entry.categories) || entry.categories.length !== 4) errors.push(`${label} must have exactly four categories.`);
    const categories = Array.isArray(entry.categories) ? entry.categories : [];
    if (new Set(categories.map((value) => String(value).toLowerCase())).size !== categories.length) errors.push(`${label} repeats a category.`);
    categories.forEach((category) => {
      if (!String(category || "").trim()) errors.push(`${label} has an empty category.`);
      if (String(category).length > 18) errors.push(`${label} category '${category}' exceeds 18 characters.`);
      if (malformedPunctuation.test(String(category))) errors.push(`${label} category '${category}' has malformed punctuation.`);
    });
    const categoryLanguage = Array.isArray(entry.categoryLanguage) ? entry.categoryLanguage : [];
    if (categoryLanguage.length !== categories.length) errors.push(`${label} must align category-language metadata with its categories.`);
    categoryLanguage.filter(Boolean).forEach((language, categoryIndex) => {
      ["singularNoun", "pluralNoun", "counterType"].forEach((field) => {
        if (!String(language[field] || "").trim()) errors.push(`${label} category language ${categoryIndex + 1} is missing ${field}.`);
      });
      ["addPhrase", "removePhrase"].forEach((field) => {
        if (!String(language[field]?.singular || "").trim() || !String(language[field]?.plural || "").trim()) {
          errors.push(`${label} category language ${categoryIndex + 1} has incomplete ${field} metadata.`);
        }
      });
    });
    if (["count", "sorting"].includes(entry.scenarioType) && entry.supportsCategoryApplicationLanguage === true && categoryLanguage.some((language) => !language)) {
      errors.push(`${label} claims category-language support but contains an unsafe category noun.`);
    }
    ["unitSingular", "unitPlural", "keyLabel", "keyText", "questionNoun"].forEach((field) => {
      if (!String(entry[field] || "").trim()) errors.push(`${label} is missing ${field}.`);
    });
    if (entry.unitSingular === entry.unitPlural) errors.push(`${label} must distinguish singular and plural units.`);
    if (!TOPIC_FAMILIES.includes(entry.topicFamily)) errors.push(`${label} has invalid family '${entry.topicFamily}'.`);
    if (entry.gradeBand !== "grade1" || entry.vocabularyLevel !== "grade1_readable") errors.push(`${label} has invalid Grade 1 vocabulary metadata.`);
    if (entry.readingLevel !== "grade1_short") errors.push(`${label} has an invalid scenario reading level.`);
    ["supportsDirectReading", "supportsComparison", "supportsMixedQuestions", "blackAndWhiteSafe", "coherenceReviewed"].forEach((field) => {
      if (entry[field] !== true) errors.push(`${label} must set ${field} to true.`);
    });
    if (entry.colorOnlyInterpretation !== false) errors.push(`${label} must not require colour-only interpretation.`);
    const sensitiveTags = Array.isArray(entry.sensitiveTags) ? entry.sensitiveTags : [];
    const forbidden = sensitiveTags.filter((tag) => FORBIDDEN_SENSITIVE_TAGS.includes(tag));
    if (forbidden.length) errors.push(`${label} contains forbidden sensitive tags: ${forbidden.join(", ")}.`);
    const publicCopy = [entry.title, ...categories, entry.keyLabel].join(" ");
    if (forbiddenAmericanCopy.test(publicCopy)) errors.push(`${label} uses non-Canadian public spelling.`);
    if (malformedPunctuation.test(entry.title)) errors.push(`${label} title has malformed punctuation.`);

    const scenario = String(entry.scenario || "").trim();
    if (!scenario) errors.push(`${label} is missing a scenario.`);
    if (scenario.length > 160) errors.push(`${label} scenario exceeds 160 characters.`);
    const sentenceCount = (scenario.match(/[.]/g) || []).length;
    if (sentenceCount < 1 || sentenceCount > 2) errors.push(`${label} scenario must contain one or two sentences.`);
    if (!scenario.endsWith(".")) errors.push(`${label} scenario must end with a period.`);
    if (unsupportedPlaceholder.test(scenario)) errors.push(`${label} scenario contains an unsupported placeholder.`);
    if (answerReveal.test(scenario)) errors.push(`${label} scenario may reveal a graph answer or relationship.`);
    if (forbiddenAmericanCopy.test(scenario)) errors.push(`${label} scenario uses non-Canadian public spelling.`);
    if (forbiddenScenarioContent.test(scenario)) errors.push(`${label} scenario contains a sensitive or inaccessible assumption.`);
    if (malformedPunctuation.test(scenario.replace(/\./g, ""))) errors.push(`${label} scenario has malformed punctuation.`);
    const words = scenario.match(/[A-Za-z]+(?:-[A-Za-z]+)*/g) || [];
    if (words.length > 30) errors.push(`${label} scenario exceeds 30 words.`);
    if (words.some((word) => word.replace(/-/g, "").length > 14)) errors.push(`${label} scenario contains vocabulary that is too long for the Grade 1 contract.`);
    if (!scenario.toLowerCase().includes(String(entry.unitPlural || "").toLowerCase())) {
      errors.push(`${label} scenario does not match unit '${entry.unitPlural}'.`);
    }
    if (String(entry.title || "").trim().includes(" ") && scenario.toLowerCase().includes(entry.title.toLowerCase())) {
      errors.push(`${label} scenario repeats the graph title verbatim.`);
    }
    if (!SCENARIO_TYPE_METADATA[entry.scenarioType]) errors.push(`${label} has invalid scenario type '${entry.scenarioType}'.`);
    if (!SCENARIO_TYPES_BY_FAMILY[entry.topicFamily]?.includes(entry.scenarioType)) {
      errors.push(`${label} scenario type '${entry.scenarioType}' is incompatible with '${entry.topicFamily}'.`);
    }
    ["dataSource", "collectionAction", "purpose"].forEach((field) => {
      if (!String(entry[field] || "").trim()) errors.push(`${label} is missing scenario metadata '${field}'.`);
    });
  });

  if (errors.length) {
    const error = new Error(`Grade 1 graph topic registry validation failed:\n- ${errors.join("\n- ")}`);
    error.validationErrors = errors;
    throw error;
  }

  return {
    topicCount: topics.length,
    scenarioCount: topics.filter((entry) => String(entry.scenario || "").trim()).length,
    scenarioTypeCounts: Object.keys(SCENARIO_TYPE_METADATA).reduce((counts, scenarioType) => {
      counts[scenarioType] = topics.filter((entry) => entry.scenarioType === scenarioType).length;
      return counts;
    }, {}),
    familyCounts: TOPIC_FAMILIES.reduce((counts, family) => {
      counts[family] = topics.filter((entry) => entry.topicFamily === family).length;
      return counts;
    }, {})
  };
}

function graphTopicById(id) {
  return GRADE1_GRAPH_TOPICS.find((entry) => entry.id === id) || null;
}

validateGrade1GraphTopics();

module.exports = {
  TOPIC_FAMILIES,
  FORBIDDEN_SENSITIVE_TAGS,
  SCENARIO_TYPE_METADATA,
  SCENARIO_TYPES_BY_FAMILY,
  CATEGORY_NOUN_LANGUAGE,
  UNSAFE_AUTOMATIC_CATEGORY_NOUNS,
  CATEGORY_APPLICATION_UNSUPPORTED_TOPIC_IDS,
  GRADE1_GRAPH_TOPICS,
  graphTopicById,
  resolveCategoryNounLanguage,
  validateGrade1GraphTopics
};
