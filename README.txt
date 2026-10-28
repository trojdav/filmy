VANOCNI LOSOVAC – STATICKA VERZE

1. Rozbal cely ZIP do jedne slozky.
2. Do podslozky images vloz svych 250 plakatu pojmenovanych presne 1.png, 2.png, 3.png ... 250.png.
3. Dvakrat klikni na index.html. Hotovo.

Neni potreba Python, server, rucni nahravani ani vytvareni seznamu. Aplikace ma v poster-list.js pevne uvedenych vsech 250 nazvu obrazku a ve film-titles.js nazvy filmu prevzate z filmy.xlsx. Pri losovani i v galerii pouziva stejny seznam. Film se losuje kliknutim na vanocni balicek karet.

Struktura slozky:
filmovy-los/
  index.html
  style.css
  app.js
  poster-list.js
  film-titles.js
  images/
    1.png
    2.png
    ...
    250.png

Po vymene obrazku staci obnovit stranku. Plakaty jsou po otevreni stranky nacitany relativne ze slozky images. Pri michani se na kartach stridaji nahodne plakaty z kolekce a na predni karte se pred odhalenim ustali vylosovany film. Losovany plakát je vetsi a lze na nej kliknout pro dalsi zvetseni. Galerie i detail zobrazuji nazev filmu z tabulky; vyhledavani funguje podle nazvu i cisla plakatu. Bez historie losovani; bezprostredni opakovani se potlacuje.

DULEZITE: Nazvy musi byt presne 1.png az 250.png. Tato verze predpoklada format PNG; pokud mas obrazky JPG, preved je na PNG nebo uprav nazvy i seznam v poster-list.js.
