#LunchBuddy - backend
Zaledni sistem za projekt LunchBuddy v okvirju programa IT Arhitekture.

## Narejeno z

* [Node.js](https://nodejs.org/en/) - Izvajalno okolje
* [Typescript](https://www.typescriptlang.org/) - Tipiziran superset javascripta
* [expressjs](https://expressjs.com/) - Strežniško ogrodje
* [MongoDB](https://www.mongodb.com/) - Podatkovna baza
* [Mongoose](https://mongoosejs.com/) - ODM med aplikacijo in podatkovno bazo  
Celotni seznam je navoljo v ```package.json```

## Seznam funkcionalnosti
* ~~Lokalno overjanje~~
* ~~Google Sign in~~
* ~~Sprememba gesla~~
* ~~Urejanje profila in preference~~
* ~~Dodeljevanje vlog~~
* ~~CRUD uporabnikov~~
* ~~CRUD obiskov~~
* Iskanje oviskov
* Pridružitev obiskom
* veto na pridružitev
* ??




## Nabor identificiranih vzorcev (bežno)
Skozi lastno implementacijo in ostala uporabljena ogrodja sem identificiral naslednje uporabljenje vzorce:
+ Lazy Load (3)
+ Active Record (1)
+ MVC (1) - **(bolj MVVC)**
+ Data Transfer Object (1)
+ Server Session State (2)
+ Mock (2)
+ Basic CRUD operations (1)
+ dvanced business logic (2)

~~mogoče se motim kje ?~~

## Testiranje
| # \ Modul      | Auth | User | Admin | Meet | Skupaj |
|----------------|------|------|-------|------|--------|
| Število testov | 6    | 13   | 8     | 7    | 34     |

Ogrodja:
 * [mocha](https://www.npmjs.com/package/mocha) - Celovito ogrodje za testiranje
 * [chai](https://www.npmjs.com/package/chai) - Ogrodje za enačenja in pričakovanja (asserts, expect)
 * [supertest](https://www.npmjs.com/package/supertest) - Ogrodje 'proxy' za zahteve
 * [nyc - Istanbul](https://www.npmjs.com/package/nyc) - Ogrodje pokritost

Za izpit ?

MVC; Lazy Load, Single Class Inheritance, Service Layer, Remote Facade, Data Transfer Object, Data Mapper, Active Record, 
