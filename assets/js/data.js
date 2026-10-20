/* The Irish Vicker's Al Raha: everything the site shows lives here.
   Update a price or a time here and every page follows.
   Days: 0 Sunday, 1 Monday, ... 6 Saturday. Times are UAE time, 24h.
   Sources: the Google profile (hours, phone, reviews, photos), the brunch table card in the
   venue's own Google photos (Saturday brunch), and SpeedQuizzing's listing (Thursday quiz).
   "sample: true" marks a night we invented as an example until the team confirms the real
   schedule; "check: true" marks a real offer whose details still need confirming. */

window.ABK_DATA = {
  theme: "vickers",
  key: "tiv_raha",
  host: "Molly",
  dayCut: 300, /* open till 4AM, so the night runs till 5AM */
  introIrish: "Céad míle fáilte",
  introEnglish: "A hundred thousand welcomes",

  venue: {
    name: "The Irish Vicker's",
    branch: "Al Raha Beach",
    short: "Al Raha",
    full: "The Irish Vicker's Al Raha",
    greet: "Hi Irish Vicker's Al Raha!",
    phone: "+971504189572",
    phoneDisplay: "050 418 9572",
    whatsapp: "971504189572",
    address: ["Next to Al Raha Beach Hotel", "Rashid Bin Jabr Al Halami Street, Al Raha", "Abu Dhabi"],
    addressLine: "Next to Al Raha Beach Hotel, Rashid Bin Jabr Al Halami Street, Al Raha, Abu Dhabi",
    locality: "Al Raha, Abu Dhabi",
    whereShort: "Next to Al Raha Beach Hotel, Abu Dhabi",
    headerSub: "Al Raha Beach, Abu Dhabi",
    plusCode: "CHQF+95 Abu Dhabi",
    google: { rating: "4.6", count: 356 },
    maps: "https://www.google.com/maps/search/?api=1&query=The+Irish+Vicker%27s+Al+Raha+Abu+Dhabi",
    reviewUrl: "https://www.google.com/maps/search/?api=1&query=The+Irish+Vicker%27s+Al+Raha+Abu+Dhabi",
    mapEmbed: "https://maps.google.com/maps?q=24.4384955,54.5729434&z=16&output=embed",
    instagram: "https://www.instagram.com/theirishvickersalraha/",
    handle: "@theirishvickersalraha",
    /* from the Google profile: Mon – Fri 12PM – 4AM, Sat – Sun 9AM – 4AM */
    hours: { 0: ["09:00", "04:00"], 1: ["12:00", "04:00"], 2: ["12:00", "04:00"], 3: ["12:00", "04:00"], 4: ["12:00", "04:00"], 5: ["12:00", "04:00"], 6: ["09:00", "04:00"] },
    happyHour: null,
    hoursNote: { 6: "Brunch 12PM – 8PM", 0: "Weekend breakfast from 9AM", 4: "Quiz from 8PM" },
    footerNote: "Next door to Al Raha Beach Hotel",
    findLede: "Next door to Al Raha Beach Hotel on Rashid Bin Jabr Al Halami Street, in the spot that used to be McGettigan's. Look for the green lights and the harp over the door.",
    parkingTitle: "Parking",
    openNote: "At weekends the doors open at 9AM.",
    parkingText: "There's parking outside and around Al Raha Beach Hotel. Staying at the hotel? One guest timed the walk at 30 seconds."
  },

  nav: [
    ["whats-on.html", "What's on"],
    ["beer-garden.html", "Beer garden"],
    ["saturday-brunch.html", "Brunch"],
    ["match-centre.html", "Sport", "opt"],
    ["menu.html", "Menu"]
  ],
  more: [
    ["match-centre.html", "Sport", "opt"],
    ["quiz-night.html", "Thursday quiz"],
    ["on-tap.html", "On tap"],
    ["offers.html", "Offers"],
    ["gallery.html", "Gallery"],
    ["reviews.html", "Reviews"],
    ["about.html", "Our story"],
    ["find-us.html", "Find us"]
  ],
  explore: [["whats-on.html", "What's on"], ["beer-garden.html", "Beer garden"], ["saturday-brunch.html", "Saturday brunch"], ["quiz-night.html", "Thursday quiz"], ["match-centre.html", "Sport"], ["on-tap.html", "On tap"], ["menu.html", "Menu"], ["offers.html", "Offers"], ["gallery.html", "Gallery"], ["reviews.html", "Reviews"], ["about.html", "Our story"], ["find-us.html", "Find us"]],
  footerBlurb: "The home of music and craic at Al Raha Beach: live bands, the Thursday quiz, a beer garden and a proper pint, next door to Al Raha Beach Hotel.",
  siblings: 'Also in the family: <a href="https://lukasgrobler.github.io/irish-vickers-wtc/">The Irish Vicker\'s World Trade Center</a> and <a href="https://lukasgrobler.github.io/irish-vickers-al-ain/">The Irish Vicker\'s Al Ain</a>.',
  replayLabel: "Pluck the harp again (replay the intro)",
  gateNo: "Come back on your 21st. The first song's on the band.",
  marquee: ["Thursday quiz from 8PM", "Saturday brunch AED 169", "Live music every week", "Open till 4AM", "Weekends from 9AM", "Every game on the screens", "The beer garden is open"],

  artists: {
    "joe": { name: "Joe Job", role: "Quiz host", initials: "JJ" },
    "band": { name: "The house band", role: "Live band", initials: "LB" },
    "acoustic": { name: "Acoustic session", role: "Live music", initials: "AS" }
  },

  /* Weekly nights. "slots" drive the chalkboard, the calendar files and the booking form. */
  events: [
    {
      slug: "pool-darts-monday", days: [1], dayLabel: "Every Monday", sample: true,
      name: "Pool & Darts Monday", with: "Winner stays on",
      cats: ["quiz"], img: "pool", img2: "bar",
      short: "The pool table and the dartboard are free all night. Winner stays on.",
      intro: "Monday's for settling scores. The pool table and the dartboard are free from 7PM, winner stays on, and the best checkout of the night goes up on the board.",
      facts: [["Pool & darts", "Free from 7PM"], ["Rule", "Winner stays on"], ["Prize", "Best checkout on the board"]],
      slots: [{ label: "Pool & darts night", start: "19:00", end: "23:00", price: "Free pool and darts" }],
      week: { title: "Pool & darts", lines: [["7PM – 11PM", "Free pool and darts"], ["Rule", "Winner stays on"]] }
    },
    {
      slug: "ladies-night", days: [2], dayLabel: "Every Tuesday", sample: true,
      name: "Ladies Night", with: "Three hours of selected drinks",
      cats: ["drinks"], img: null, img2: "entrance",
      short: "Ladies, three hours of selected drinks for AED 99.",
      intro: "Tuesday belongs to the ladies. AED 99 covers three hours of selected drinks, inside or out in the beer garden, with music to match.",
      facts: [["When", "8PM – 11PM"], ["Package", "3 hours, selected drinks"], ["Price", "AED 99"]],
      deal: { title: "3 hours of selected drinks", note: "Ladies, 8PM – 11PM", price: 99 },
      slots: [{ label: "Ladies night", start: "20:00", end: "23:00", price: "AED 99, 3 hours" }],
      week: { title: "Ladies night", lines: [["AED 99", "3 hours of selected drinks"], ["8PM – 11PM", "Inside or in the garden"]] }
    },
    {
      slug: "live-music-wednesday", days: [3], dayLabel: "Every Wednesday", sample: true,
      name: "Acoustic Wednesday", with: "Songs everyone knows the words to",
      cats: ["music"], img: "bar", img2: "band",
      short: "An acoustic set from 8:30PM: singalongs, requests and the odd ballad.",
      intro: "Midweek, the stage goes acoustic. Two guitars from 8:30PM, the songs everyone knows the words to, and requests taken (within reason).",
      facts: [["Music", "8:30PM – 11:30PM"], ["Requests", "Taken"], ["Entry", "Free"]],
      lineup: [{ who: "acoustic", time: "8:30PM – 11:30PM" }],
      slots: [{ label: "Acoustic session", start: "20:30", end: "23:30", price: "Free entry" }],
      week: { title: "Acoustic night", lines: [["8:30PM", "Acoustic set, requests taken"], ["Entry", "Free"]] }
    },
    {
      slug: "quiz-night", days: [4], dayLabel: "Every Thursday",
      name: "Thursday Quiz Night", with: "SpeedQuizzing with Joe Job",
      cats: ["quiz"], img: null, img2: "entrance",
      short: "Joe Job's SpeedQuizzing night from 8PM. Your phone is the buzzer, and there are prizes.",
      intro: "Thursday is quiz night. Joe Job runs SpeedQuizzing from 8PM: you answer on your phone, the fastest right answer scores the most, and the winners take the prizes. Get a team together and book a table, it fills up.",
      facts: [["Quiz", "From 8PM"], ["Host", "Joe Job"], ["Buzzer", "Your phone"]],
      deals: [["Prizes for the winning team", "Prizes"], ["Answer on your phone: no pens, no cheating", "Free app"]],
      lineup: [{ who: "joe", time: "8PM – 10PM" }],
      slots: [{ label: "Quiz night with Joe Job", start: "20:00", end: "22:00", price: "SpeedQuizzing, prizes" }],
      hallOfFame: true,
      week: { title: "Quiz night", lines: [["8PM", "SpeedQuizzing with Joe Job"], ["Buzzer", "Your phone. Prizes for the winners"]] }
    },
    {
      slug: "friday-live", days: [5], dayLabel: "Every Friday", sample: true,
      name: "Live Band Friday", with: "The band's on from 9PM",
      cats: ["music"], img: "band", img2: "facade",
      short: "A live band from 9PM, then the music keeps going till 4AM.",
      intro: "Friday is band night. The house band plugs in at 9PM and plays the songs you'll be singing on the way home, and the bar stays open till 4AM.",
      facts: [["Live band", "9PM – 1AM"], ["Open", "Till 4AM"], ["Entry", "Free"]],
      lineup: [{ who: "band", time: "9PM – 1AM" }],
      slots: [{ label: "Live band", start: "21:00", end: "01:00", price: "Free entry" }],
      week: { title: "Live band", lines: [["9PM – 1AM", "The house band"], ["Open", "Till 4AM"]] }
    },
    {
      slug: "saturday-brunch", days: [6], dayLabel: "Every Saturday",
      name: "Saturday Brunch", with: "Brunch at your own pace",
      cats: ["food", "drinks", "garden"], img: "brunch", img2: "spread",
      short: "One meal and five drinks for AED 169, any time from 12PM to 8PM.",
      intro: "Brunch at your own pace: pick a meal, have five drinks, and take all afternoon over it. Saturdays from 12PM to 8PM, inside or out in the beer garden, with the football on.",
      facts: [["When", "12PM – 8PM"], ["Package", "One meal + 5 drinks"], ["Price", "AED 169"]],
      deal: { title: "One meal and five drinks", note: "Saturdays, 12PM – 8PM. T&C apply.", price: 169 },
      slots: [{ label: "Saturday brunch", start: "12:00", end: "20:00", price: "AED 169, meal + 5 drinks" }],
      week: { title: "Saturday brunch", lines: [["AED 169", "One meal + 5 drinks"], ["12PM – 8PM", "At your own pace"]] }
    },
    {
      slug: "weekend-breakfast", days: [6, 0], dayLabel: "Saturdays and Sundays", sample: true,
      name: "Weekend Breakfast", with: "The full Irish, from 9AM",
      cats: ["food"], img: null, img2: "facade",
      short: "Doors open at 9AM at weekends for a full Irish breakfast and a pot of tea.",
      intro: "At weekends the doors open at 9AM. Come in for a full Irish: eggs, rashers, sausages, black and white pudding and toast, with a pot of tea or the first pint of the day.",
      facts: [["When", "9AM – 12PM"], ["Days", "Saturday + Sunday"], ["Plate", "The full Irish"]],
      slots: [{ label: "Weekend breakfast", start: "09:00", end: "12:00", price: "The full Irish" }]
    },
    {
      slug: "sunday-roast", days: [0], dayLabel: "Every Sunday", sample: true,
      name: "Sunday Roast", with: "With all the trimmings",
      cats: ["food"], img: null, img2: "spread",
      short: "A proper Sunday roast with all the trimmings, from midday, with the football on.",
      intro: "Sunday is for a roast with all the trimmings, a pint and the late kick-off. Served from midday till 8PM, inside or in the beer garden.",
      facts: [["Roast", "12PM – 8PM"], ["Trimmings", "All of them"], ["Football", "On the screens"]],
      deals: [["Sunday roast with all the trimmings", "To confirm"]],
      slots: [{ label: "Sunday roast", start: "12:00", end: "20:00", price: "All the trimmings" }],
      week: { title: "Sunday roast", lines: [["12PM – 8PM", "Roast with all the trimmings"], ["9AM", "Weekend breakfast first"]] }
    }
  ],

  /* Tonight takeover: on each day the homepage headline becomes that day's main event. */
  takeover: {
    1: { slug: "pool-darts-monday", lines: ["Pool &", "darts night"], sub: "The pool table and the dartboard are free from 7PM. Winner stays on." },
    2: { slug: "ladies-night", lines: ["Ladies", "night"], sub: "Three hours of selected drinks for AED 99, from 8PM." },
    3: { slug: "live-music-wednesday", lines: ["Acoustic", "Wednesday"], sub: "Two guitars from 8:30PM, and the songs everyone knows the words to." },
    4: { slug: "quiz-night", lines: ["Quiz", "night"], sub: "Joe Job's SpeedQuizzing from 8PM. Your phone is the buzzer, and there are prizes." },
    5: { slug: "friday-live", lines: ["Live band", "Friday"], sub: "The band plugs in at 9PM, and we're open till 4AM." },
    6: { slug: "saturday-brunch", lines: ["Saturday", "brunch"], sub: "One meal and five drinks for AED 169, any time from 12PM to 8PM." },
    0: { slug: "sunday-roast", lines: ["Sunday", "roast"], sub: "Breakfast from 9AM, then a roast with all the trimmings from midday." }
  },

  offers: [
    {
      slug: "two-for-one-cocktails", name: "2-for-1 Cocktails", with: "Two cocktails for the price of one", cats: ["drinks"], img: "bar", check: true,
      dayLabel: "Ask the team for times",
      short: "Two cocktails for the price of one. It's on the screen by the front door.",
      intro: "Two cocktails for the price of one: it's up on the screen by the front door. Ask the team which cocktails and which hours, and bring someone to share with.",
      facts: [["Deal", "2 for 1"], ["On", "Cocktails"], ["When", "Ask the team"]]
    }
  ],

  specials: [
    {
      slug: "abu-dhabi-grand-prix", name: "Abu Dhabi Grand Prix Weekend", short_name: "Grand Prix", with: "Ten minutes from Yas Marina", sample: true,
      from: "2026-12-04", to: "2026-12-06", when: "4 – 6 December", img: "facade", countdown: true,
      short: "Every session on the screens, ten minutes up the road from the track. Pints before, pints after.",
      intro: "The Formula 1 finale is ten minutes up the road at Yas Marina. Watch every session on our screens, or come straight here after the race: practice on Friday, qualifying on Saturday and lights out on Sunday at 5PM.",
      vouchers: [["Race-day table with a sharing platter", "TBC"]],
      fine: "Race-weekend packages and prices to be confirmed."
    },
    {
      slug: "st-patricks-day", name: "St Patrick's Day 2027", short_name: "St Patrick's Day", with: "The biggest night of the year at the Vickers", sample: true,
      from: "2027-03-17", to: "2027-03-17", when: "Wednesday 17 March 2027", img: null, countdown: true,
      short: "Live music from lunchtime, green pints and a full house. Tables go months ahead.",
      intro: "St Patrick's Day is our Christmas. Live music from lunchtime, Irish dancing, green everything and a full house by the evening. It falls on a Wednesday in 2027, and the big tables go months ahead.",
      vouchers: [["Reserve a table for St Patrick's Day", "TBC"]],
      fine: "The plan and packages for the day to be confirmed."
    }
  ],

  /* Real Google reviews from the venue's Google profile. Names shortened. */
  reviews: [
    { name: "Estefania T.", meta: "Google review", featured: true, text: "I absolutely love Vickers! The food is spectacular, the live music creates such a great atmosphere, and the service is always outstanding. I would especially like to mention Susmita for her kindness and warm hospitality. She truly made our experience even more special." },
    { name: "Beth J.", meta: "Google review", text: "One of my favourite places on a Saturday afternoon. The beer garden is lovely and the service is great. Susmita and the rest of the staff are fantastic. Good place to watch sport and they’ll often change the tvs to what game you’d like to watch (if available)." },
    { name: "TravelRevs1to5", meta: "Google review, Local Guide", text: "I wanted to play Darts abroad and they had a dart board. Even the locals were friendly and played against them. Won 1 nil, my first competitive 501.. Stayed at the Hotel next door, Al raha beach resort so it was a 30 second …" }
  ],

  /* SAMPLE: names come from guest reviews and the quiz listing; roles and lines to be confirmed with the team. */
  crew: [
    { name: "Susmita", role: "Floor team", initials: "S", line: "Named in two of our Google reviews for her “kindness and warm hospitality”. Ask for Susmita." },
    { name: "Joe Job", role: "Quiz host", initials: "JJ", line: "Runs SpeedQuizzing every Thursday. Fast questions, faster thumbs." },
    { name: "The band", role: "Live music", initials: "LB", line: "Plugs in on Friday nights. Requests welcome, singing along compulsory." },
    { name: "The kitchen", role: "Back of house", initials: "K", line: "Behind the brunch burger in our photos. Come hungry." }
  ],

  hof: { title: "Quiz Hall of Fame", sub: "Thursday's winners, as crowned by Joe Job", note: "Sample names, real winners added every Thursday", photo: "entrance", photoAlt: "The entrance at The Irish Vicker's Al Raha: Croí an cheoil agus craic, the home of music and craic", caption: "The home of music and craic" },
  /* SAMPLE quiz winners, replaced every Thursday once live. */
  hallOfFame: [
    ["15 Oct 2026", "The Craic Addicts"],
    ["8 Oct 2026", "Raha Raiders"],
    ["1 Oct 2026", "Quiz Team Aguilera"],
    ["24 Sep 2026", "Les Quizérables"],
    ["17 Sep 2026", "Pint of No Return"],
    ["10 Sep 2026", "Know It Ales"]
  ],

  /* Photos from the venue's Google profile; swap for the venue's own shots before launch. */
  gallery: [
    { img: "facade", cap: "Find the green lights" },
    { img: "band", cap: "Live on the stage" },
    { img: "brunch", cap: "Saturday brunch, in the garden" },
    { img: "entrance", cap: "Croí an cheoil agus craic" },
    { img: "spread", cap: "Something for the table" },
    { img: "bar", cap: "The bar, lit up" },
    { img: "pool", cap: "Rack 'em up" },
    { img: "front", cap: "Al Raha Beach, after dark" }
  ],
  wallCta: "Tag {handle} on Instagram and your night could end up on the wall.",

  /* Menus open here once the venue sends the PDFs. */
  menus: { food: null, drinks: null },
  menuCopy: {
    food: ["Food menu", "The full food menu lands here as soon as the kitchen sends the latest version. Want it right now? Ask on WhatsApp and we'll send it over."],
    drinks: ["Drinks menu", "Guinness, Irish whiskey, ciders, cocktails and wine. The full list is on its way to this page; ask on WhatsApp and we'll send it straight away."]
  },
  /* Dishes from the venue's own photos, so Molly can answer food questions. [name, details, AED or null, search words] */
  menuItems: [
    ["Bacon cheeseburger", "The brunch favourite", null, "burger burgers cheeseburger bacon"],
    ["Crispy chicken burger", "With coleslaw", null, "chicken burger crispy"],
    ["Sliders", "Made for sharing", null, "sliders slider"],
    ["Loaded chilli fries", "Chilli and cheese", null, "fries chips loaded chilli"],
    ["Mozzarella sticks", "With a tomato dip", null, "mozzarella sticks cheese"],
    ["Club sandwich", "Toasted and triple-stacked", null, "club sandwich"],
    ["Chicken tenders", "In a basket, with dips", null, "tenders strips wings"],
    ["Saturday brunch", "One meal and five drinks, 12PM – 8PM", 169, "brunch"],
    ["Full Irish breakfast", "Weekends from 9AM (to confirm)", null, "breakfast irish fry eggs rashers"],
    ["Sunday roast", "Sundays from midday (to confirm)", null, "roast sunday"]
  ],
  /* What guests order (menu page). [name, note, price or ""] */
  dishes: [
    ["Bacon cheeseburger", "The brunch favourite, on a branded bun", ""],
    ["Crispy chicken burger", "Wrapped, stacked, coleslaw on the side", ""],
    ["Sliders", "Three little burgers, made for sharing", ""],
    ["Loaded chilli fries", "Under a blanket of chilli and cheese", ""],
    ["Mozzarella sticks", "With a tomato dip", ""],
    ["Club sandwich", "Toasted and triple-stacked", ""],
    ["Chicken tenders", "In a basket, with dips", ""],
    ["Saturday brunch", "One meal and five drinks, 12PM – 8PM", 169]
  ],

  seats: ["No preference", "Inside", "Beer garden", "Near the screens", "By the stage", "By the pool table", "Big group area"],
  filters: [["all", "Everything"], ["music", "Live music"], ["quiz", "Quiz & games"], ["food", "Food deals"], ["drinks", "Drinks deals"], ["garden", "In the garden"]],
  goodToKnow: [
    ["pin", "Next to Al Raha Beach Hotel", 'Rashid Bin Jabr Al Halami Street, Al Raha. First time? <a class="link" href="find-us.html">Read the 30-second guide</a>'],
    ["leaf", "The beer garden", "Out on the grass, for brunch, the match or a quiet one."],
    ["clock", "Open till 4AM", "From 12PM in the week and 9AM at weekends."],
    ["wa", "Book on WhatsApp", "Quiz and band nights fill up. Booking takes about 20 seconds."]
  ],
  packageNote: "",
  defaultPhoto: "bar",
  liveLink: "whats-on.html",

  /* SAMPLE tap list, to confirm with the bar. */
  taps: [
    { name: "Guinness", style: "Stout", from: "Ireland", color: "#1a0f09", head: "#efe2c6" },
    { name: "Kilkenny", style: "Irish red ale", from: "Ireland", color: "#8e3b1b", head: "#f1e4c8" },
    { name: "Harp", style: "Lager", from: "Ireland", color: "#eab83c" },
    { name: "Hop House 13", style: "Lager", from: "Ireland", color: "#e3a83e" },
    { name: "Magners", style: "Cider", from: "Ireland", color: "#e3a03a" },
    { name: "Heineken", style: "Lager", from: "Netherlands", color: "#efc046" },
    { name: "Stella Artois", style: "Pilsner", from: "Belgium", color: "#f1c547" },
    { name: "Carlsberg", style: "Pilsner", from: "Denmark", color: "#f2c84c" }
  ],

  /* Formula 1, rest of the 2026 season. Lights-out times are UAE time and approximate; check nearer the date. */
  races: [
    { name: "United States Grand Prix", place: "Austin", date: "2026-10-25", time: "23:00" },
    { name: "Mexico City Grand Prix", place: "Mexico City", date: "2026-11-02", time: "00:00", note: "That's the early hours of Monday" },
    { name: "São Paulo Grand Prix", place: "São Paulo", date: "2026-11-08", time: "21:00" },
    { name: "Las Vegas Grand Prix", place: "Las Vegas", date: "2026-11-22", time: "08:00", note: "A Sunday-morning race over here" },
    { name: "Qatar Grand Prix", place: "Lusail", date: "2026-11-29", time: "20:00" },
    { name: "Abu Dhabi Grand Prix", place: "Yas Marina, ten minutes away", date: "2026-12-06", time: "17:00", home: true }
  ],

  /* Ask Molly: the branch-specific answers. Everything else is worked out from the schedule above. */
  adam: {
    main: [["tonight", "What's on tonight?"], ["deals", "Any deals today?"], ["terrace", "Is the beer garden open?"], ["find", "How do I find you?"], ["book", "Book a table"], ["more", "More questions"]],
    more: [["live", "Who's playing?"], ["menu", "Show me the menu"], ["sport", "Can you put my game on?"], ["race", "Next F1 race?"], ["games", "Darts or pool?"], ["parking", "Where do I park?"], ["groups", "Big group or party?"], ["hours", "Opening hours"], ["joke", "Tell me a joke"], ["human", "Talk to the team"]],
    greeting: "Ask me anything about The Irish Vicker's Al Raha: the Thursday quiz, Saturday brunch, the beer garden, getting here, or just type naturally, like “table for 6 at the quiz on Thursday”.",
    placeholder: "e.g. table for 6 at the quiz on Thursday",
    hhNone: "There's no fixed happy hour on the board here, but there's a deal most days: <b>Saturday brunch</b> is one meal and five drinks for AED 169, and there are <b>2-for-1 cocktails</b> (ask the team for times).",
    hhLine: "",
    hoursExtra: "At weekends the doors open at 9AM.",
    liveIntro: "Here's who's on this week:",
    find: "We're <b>next door to Al Raha Beach Hotel</b> on Rashid Bin Jabr Al Halami Street, in Al Raha, in the old McGettigan's spot. Look for the green lights and the harp over the door.",
    parking: "There's parking <b>right outside</b> and around Al Raha Beach Hotel. Staying at the hotel? One guest timed the walk at 30 seconds.",
    dealOfDay: { 1: "pool-darts-monday", 2: "ladies-night", 3: "live-music-wednesday", 4: "quiz-night", 5: "friday-live", 6: "saturday-brunch", 0: "sunday-roast" },
    menuIntro: "A few things guests order:",
    sport: "Every big game is on the screens. If your match isn't on, ask: guests say the team will <b>happily switch a TV to your game</b> if it's available. Every F1 race is on too, and Yas Marina is ten minutes up the road.",
    sportBtn: ["Sport at the Vickers", "match-centre.html"],
    groups: "Birthdays, leaving dos, the whole office: tell me the date and how many of you, and I'll pass it to the team. The beer garden is great for groups.",
    groupsPage: false,
    kids: "Families are welcome for food during the day, and weekend breakfast is a good time to bring them. For late event nights, check with the team first.",
    veg: "Yes, there's plenty without meat, from mozzarella sticks to loaded fries. For vegan or allergy questions, the team will check with the kitchen.",
    access: "We're on the ground floor. If you need anything set up, like a table near the door, just let the team know.",
    terrace: "Yes, the <b>beer garden</b> is open: out on the grass, with the match on. It's where Saturday brunch happens. Want me to book you a garden table?",
    terraceBook: "Book a garden table",
    terraceSeat: "Beer garden",
    games: "There's a <b>dartboard</b> and a <b>pool table</b>, both free on Monday nights. One guest won their first competitive 501 here, so the board might be lucky.",
    drinks: "Guinness poured the proper way (in two parts), Irish lagers and ciders, whiskey, and 2-for-1 cocktails. <a href=\"on-tap.html\">See what's on tap</a>.",
    jokes: [
      "Why did the quizmaster bring a ladder? For the questions on the next level. Joe Job starts asking on Thursday at 8PM.",
      "What do you call a fake Irish stone? A sham-rock. The real one's on the harp over our door.",
      "How do you make a band sound better? Order another round. The band's on from 9PM on Friday.",
      "Why do we pour Guinness in two parts? Because good things come to those who wait. About 119.5 seconds, to be exact."
    ],
    dishIntro: "From our kitchen:",
    priceNote: "Prices are on the menu; the team can send it over on WhatsApp.",
    prices: "A quick guide:",
    priceRows: [["AED 169", "Saturday brunch", "One meal + 5 drinks, 12PM – 8PM"], ["2 for 1", "Cocktails", "Ask the team for times"], ["8PM", "Thursday quiz", "Prizes for the winners"]],
    vocab: "garden raha vickers vicker quiz joe brunch harp guinness kilkenny magners darts pool sliders mozzarella breakfast roast susmita yas acoustic",
    eventWords: [["\\b(quiz|trivia|joe job|speedquizzing)\\b", "quiz-night"], ["\\bladies\\b", "ladies-night"], ["\\b(pool night|darts night|pool and darts|pool & darts)\\b", "pool-darts-monday"], ["\\b(acoustic)\\b", "live-music-wednesday"], ["\\b(live band|band night|friday band)\\b", "friday-live"], ["\\bbrunch\\b", "saturday-brunch"], ["\\b(breakfast|full irish|fry up)\\b", "weekend-breakfast"], ["\\broast\\b", "sunday-roast"], ["\\b(2 for 1|two for one|2-for-1)\\b", "two-for-one-cocktails"], ["\\b(st patrick|paddy'?s day|patricks day|patrick)\\b", "st-patricks-day"], ["\\b(abu dhabi grand prix|grand prix weekend|yas marina)\\b", "abu-dhabi-grand-prix"]],
    seatWords: [["\\b(garden|outside|outdoor|terrace|grass)\\b", "Beer garden"], ["\\bscreens?\\b", "Near the screens"], ["\\b(stage|band)\\b", "By the stage"], ["\\bpool\\b", "By the pool table"]]
  }
};
