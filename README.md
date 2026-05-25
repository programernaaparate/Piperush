# PipeRush

PipeRush je futuristička puzzle-arkadna igra u kojoj igrač rotira cijevi i pokušava da poveže `START` sa `END` prije isteka vremena. Projekat je napravljen kao ozbiljna univerzitetska demo igra u React + Vite okruženju, sa kampanjom, nivoima težine, boss nivoima, animiranim tokom, zvukom i lokalnim progresom.

## Glavne funkcije

- `Kampanja` sa ukupno `27` nivoa:
  - `9 Lako`
  - `9 Srednje`
  - `9 Teško`
- `Dnevni izazov`
- `Boss nivoi` sa posebnim mehanikama
- `Hint` sistem zasnovan na tačnoj rotaciji cijevi
- `Rezultat`, `vrijeme`, `potezi`, `savjeti`
- `Pauza`, `restart`, `meni`, `sljedeći nivo`
- `Rang lista` i lokalni progres preko `localStorage`
- različite pozadine po težini i posebnim nivoima
- siguran audio sistem sa `Zvuk: ON/OFF`

## Vizuelni identitet

PipeRush koristi plavo/cijan cyber-pipeline okruženje:

- tamna navy pozadina
- cijan glow i staklaste panele
- glossy UI dugmad i paneli
- animirani tok kroz cijevi
- responsive board koji ostaje čitljiv i na većim i na manjim ekranima

## Kontrole

- klik na cijev: rotacija za `90°`
- `Savjet`: označava jednu bitnu pogrešno rotiranu cijev
- `Restart`: vraća trenutni nivo na početno stanje
- `Pauza`: zaustavlja tajmer
- `Meni`: povratak na početni ekran
- `Zvuk`: uključivanje i isključivanje muzike i efekata

## Pokretanje projekta

U folderu projekta pokreni:

```powershell
npm install
npm run dev
```

Zatim otvori lokalni link koji Vite ispiše u terminalu.

Za produkcioni build:

```powershell
npm run build
```

## Struktura projekta

Najvažniji fajlovi:

- `src/components/MainMenu.jsx`
- `src/components/GameScreen.jsx`
- `src/components/GameBoard.jsx`
- `src/components/Tile.jsx`
- `src/components/HUD.jsx`
- `src/components/LevelCompleteModal.jsx`
- `src/components/GameOverModal.jsx`
- `src/components/PauseModal.jsx`
- `src/components/LevelSelectModal.jsx`
- `src/components/LeaderboardModal.jsx`
- `src/data/levels.js`
- `src/utils/pipeLogic.js`
- `src/utils/levelValidator.js`
- `src/utils/audio.js`
- `src/utils/progress.js`

## Logika igre

PipeRush koristi validaciju cijevi preko BFS/DFS pristupa:

- kreće od `START` cijevi
- prati samo validne veze između susednih polja
- proverava da li i susedna cijev vraća vezu nazad
- kad se stigne do `END`, nivo je riješen

Svaki nivo sadrži:

- `id`
- `difficulty`
- `size`
- `timeLimit`
- `hints`
- `background`
- `grid`
- `correctRotation`

## Nivoi i validacija

Nivoi nisu nasumični. Svaki nivo je planski složen:

1. prvo se definiše tačna ruta od `START` do `END`
2. zatim se rotiraju ključne cijevi
3. dodaju se lažne rute, blokade i dead-end polja
4. validator proverava da nivo:
   - nije već riješen
   - postaje riješen sa `correctRotation`
   - ima ispravnu veličinu
   - ima tačno jedan `START` i jedan `END`

## Audio

Audio sistem podržava:

- pozadinsku muziku
- zvuk rotacije
- success/fail efekte
- klik i hint zvuk

Ako neki audio fajl ne postoji, igra ne puca, već koristi bezbedan fallback ili ostaje tiha.

## AI alati korišćeni u projektu

U razvoju su korišćeni AI alati za:

- generisanje i doradu delova koda
- debagovanje UI i gameplay problema
- predloge za level design
- doradu UX toka i vizuelnog polisha
- generisanje i integraciju zvučne podloge

## Ideje za prezentaciju

Za kratku demonstraciju od 5 minuta možeš pokazati:

1. glavni meni i izbor težine
2. campaign mapu i izbor nivoa
3. jedan `Lako` nivo za osnovni gameplay
4. jedan `Teško` ili `Boss` nivo za posebne mehanike
5. rang listu, progres i lokalno čuvanje rezultata

## Napomena za predaju

U README po potrebi dopiši:

- link do GitHub repozitorijuma
- screenshotove igre
- promo GIF ili video
- kratko poređenje sa originalnom verzijom igre
